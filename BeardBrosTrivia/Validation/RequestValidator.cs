using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using BeardBrosTrivia.Models;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using Org.BouncyCastle.Security.Certificates;
using Org.BouncyCastle.X509;

namespace BeardBrosTrivia.Validation
{
    public class RequestValidator
    {
        TraceWriter Log { get; }

        public RequestValidator(TraceWriter log)
        {
            Log = log;
        }

        /// <summary>
        /// Parses the request body into the given type and validates it. Will throw a RequestValidationException if the request is not valid.
        /// </summary>
        public async Task<AlexaRequest> ParseAndValidate(HttpRequestMessage req)
        {
            string reqBody = await req.Content.ReadAsStringAsync();
            var alexaRequest = Parse(reqBody);

            // To validate an Alexa request, you must:
            // 1. Verify that the [timestamp] value in the request body is no older than 150 seconds. 
            // 2. Verify the signature of the request by:
            //   a. Verify the URL in the SignatureCertChainUrl header.
            //   b. Download the certificate at that URL.
            //   c. Parse the certificate and verify that it hasn't expired (examine both the Not Before and Not After dates).
            //   d. Verify the domain echo-api.amazon.com is listed in the certificate's Subject Alternative Names list.
            //   e. Extract the certificate's public key.
            //   f. Base-64 decode the [Signature] header.
            //   g. Use the cert's public key to decrypt the decoded [Signature] header and produce the [Asserted Hash] value.
            //   h. Generate  SHA-1 hash from the full HTTPS body to produce the [Derived Hash] value.
            //   i. Signature is valid if [Derived Hash] == [Asserted Hash].

            Log.Info($"Raw alexa request timestamp: {alexaRequest.request.timestamp}");

            long now = DateTime.Now.ToUnixTimestamp();
            long requestTimeTicks;

            if (alexaRequest.request.timestamp.GetType() == typeof(DateTime))
            {
                requestTimeTicks = ((DateTime)alexaRequest.request.timestamp).ToUnixTimestamp();
            }
            else
            {
                requestTimeTicks = ((long)alexaRequest.request.timestamp);
            }

            // Alexa skills should be invalidated after 150 seconds have passed.
            if (now - requestTimeTicks > 150)
            {
                throw new RequestValidationException("Request's timestamp is over 150 seconds old, which is invalid.");
            }

            IEnumerable<string> signatures;
            IEnumerable<string> certChainUrls;

            if (!req.Headers.TryGetValues("Signature", out signatures))
            {
                throw new RequestValidationException("Failed to retrieve Signature header value.");
            }

            if (!req.Headers.TryGetValues("SignatureCertChainUrl", out certChainUrls))
            {
                throw new RequestValidationException("Failed to retrieve SignatureCertChainUrl header value.");
            }

            string signature = signatures.FirstOrDefault();
            string certChainUrl = certChainUrls.FirstOrDefault();

            if (string.IsNullOrEmpty(signature))
            {
                throw new RequestValidationException("Request headers did not contain the required Signature header.");
            }

            Log.Info($"Signature and certChainUrl headers were retrieved.");

            var cert = await GetAndValidateCertificate(certChainUrl);

            Log.Info($"Got certificate. Is null? {cert == null}");

            if (!VerifySignature(reqBody, signature, cert))
            {
                throw new RequestValidationException("Signature was not valid.");
            }

            return alexaRequest;
        }

        public async Task<AlexaRequest> Parse(HttpRequestMessage req)
        {
            string reqBody = await req.Content.ReadAsStringAsync();

            return Parse(reqBody);
        }

        public AlexaRequest Parse(string requestBody)
        {
            AlexaRequest requestData;

            try
            {
                requestData = JsonConvert.DeserializeObject<AlexaRequest>(requestBody);
            }
            catch (Exception ex)
            {
                throw new RequestValidationException("Failed to parse request body into an AlexaRequest.", ex);
            }

            if (requestData == null)
            {
                throw new RequestValidationException("Failed to parse request body into an AlexaRequest. The deserialized object was null.");
            }

            return requestData;
        }

        async Task<X509Certificate> GetAndValidateCertificate(string certChainUrl)
        {
            Uri certChainUri;

            if (!Uri.TryCreate(certChainUrl, UriKind.Absolute, out certChainUri))
            {
                throw new RequestValidationException($"CertChainUrl header value of {certChainUrl ?? "null"} could not be parsed into a valid URI.");
            }

            if (certChainUri.Scheme != "https")
            {
                throw new RequestValidationException($"SignatureCertChainUrl {certChainUri.Scheme} is not valid. Expected https.");
            }

            if (certChainUri.Port != 443)
            {
                throw new RequestValidationException($"SignatureCertChainUrl's port {certChainUri.Port} is not valid. Expected 443.");
            }

            if (certChainUri.Host != "s3.amazonaws.com")
            {
                throw new RequestValidationException($"SignatureCertChainUrl's Host {certChainUri.Host} is not valid. Expected s3.amazonaws.com.");
            }

            string certContent;

            using (var client = new HttpClient())
            {
                var httpResponse = await client.GetAsync(certChainUri);
                certContent = await httpResponse.Content.ReadAsStringAsync();
            }

            if (string.IsNullOrEmpty(certContent))
            {
                throw new RequestValidationException("Certificate content was null or empty.");
            }

            X509Certificate cert;

            using (var stringReader = new StringReader(certContent))
            {
                var pemReader = new Org.BouncyCastle.OpenSsl.PemReader(stringReader);
                cert = (X509Certificate)pemReader.ReadObject();
            }

            try
            {
                cert.CheckValidity();
            }
            catch (CertificateExpiredException)
            {
                throw new RequestValidationException("Certificate has expired.");
            }
            catch (CertificateNotYetValidException)
            {
                throw new RequestValidationException("Certificate date is not yet valid.");
            }

            if (!CertHasValidSubjectName(cert))
            {
                throw new RequestValidationException("Certificate's alternate subject names did not contain echo-api.amazon.com.");
            }

            return cert;
        }

        /// <remarks>
        /// Source: https://github.com/AreYouFreeBusy/AlexaSkillsKit.NET/blob/ef7f2259a74f052c0980c200fe0caf891e4d4092/AlexaSkillsKit.Lib/Authentication/SpeechletRequestSignatureVerifier.cs#L185
        /// </remarks>
        private bool CertHasValidSubjectName(X509Certificate cert)
        {
            bool found = false;
            ArrayList subjectNamesList = (ArrayList)cert.GetSubjectAlternativeNames();
            for (int i = 0; i < subjectNamesList.Count; i++)
            {
                ArrayList subjectNames = (ArrayList)subjectNamesList[i];
                for (int j = 0; j < subjectNames.Count; j++)
                {
                    if (subjectNames[j] is String && subjectNames[j].Equals("echo-api.amazon.com"))
                    {
                        found = true;
                        break;
                    }
                }
            }

            return found;
        }

        private bool VerifySignature(string requestBodyString, string expectedSignatureString, X509Certificate cert)
        {
            byte[] expectedSignature;
            byte[] requestBody;

            try
            {
                expectedSignature = Convert.FromBase64String(expectedSignatureString);
            }
            catch (FormatException ex)
            {
                throw new RequestValidationException("Failed to convert expected signature header string to a byte array.", ex);
            }

            try
            {
                requestBody = Encoding.UTF8.GetBytes(requestBodyString);
            }
            catch (Exception ex)
            {
                throw new RequestValidationException("Failed to convert request body string to a byte array.", ex);
            }

            var publicKey = (Org.BouncyCastle.Crypto.Parameters.RsaKeyParameters)cert.GetPublicKey();
            var signer = Org.BouncyCastle.Security.SignerUtilities.GetSigner("SHA1withRSA");

            signer.Init(false, publicKey);
            signer.BlockUpdate(requestBody, 0, requestBody.Length);

            return signer.VerifySignature(expectedSignature);
        }
    }
}