using System;
using System.Net.Http;
using System.Net;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using System.Collections.Generic;
using System.Linq;
using BeardBrosTrivia.Models;
using System.Text.RegularExpressions;
using AlexaMessageBuilder;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using System.Web.Http;
using System.IO;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.Security.Certificates;
using System.Collections;
using BeardBrosTrivia.Validation;

namespace BeardBrosTrivia
{
    public class TriviaBoi
    {
        [FunctionName("BeardBrosTrivia")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Anonymous, "*", WebHookType = "genericJson")] HttpRequestMessage req, TraceWriter log)
        {
            log.Info("BeardBrosTrivia function running.");

            var validator = new RequestValidator(log);
            bool test = false;
            AlexaRequest alexaRequest;

            log.Info($"Querystring: {req.RequestUri.Query}");

            // Check if the querystring contains test=true
            if (req.RequestUri.Query.IndexOf("test=true", StringComparison.OrdinalIgnoreCase) > -1)
            {
                test = true;
            }

            if (!test)
            {
                try
                {
                    alexaRequest = await validator.ParseAndValidate(req);
                }
                catch (RequestValidationException ex)
                {
                    log.Error("Error validating request.", ex);

                    throw ex;
                }

                // TODO: If your skill supports multiple different intents, use the alexaRequest variable to determine which intent has been requested.
            }
            else
            {
                log.Info("Running function in test mode.");
            }

            Quote quote = GetRandomArrayValue(Constants.Quotes);
            string quoteIntro = GetRandomArrayValue(Constants.QuoteIntroSuffixes.Concat(Constants.QuoteIntroPrefixes));
            bool introIsSuffix = Constants.QuoteIntroSuffixes.Contains(quoteIntro);
            string by = quote.Author;
            string message;

            // Choose a fancy name 3/10 times
            if (new Random().Next(0, 10) <= 3)
            {
                switch (by.ToLower())
                {
                    case "alex":
                        by = GetRandomArrayValue(Constants.AlexFancyNames);
                        break;

                    case "jirard":
                        by = GetRandomArrayValue(Constants.JirardFancyNames);
                        break;
                }
            }

            if (introIsSuffix)
            {
                message = $"{ by} { quoteIntro}";
            }
            else
            {
                message = $"{ quoteIntro} { by}";
            }

            message += $". \"{quote.Text}\"";

            // Replace "Jirard" with "Gerard" to get Alexa to pronounce it correctly
            message = new Regex("jirard", RegexOptions.IgnoreCase | RegexOptions.Multiline).Replace(message, "Gerard");

            var alexa = new MessageBuilder().SetPlainSpeech(message.Trim());

            return new HttpResponseMessage()
            {
                Content = new StringContent(alexa.BuildMessageJson()),
            };

            // return req.CreateResponse(HttpStatusCode.OK, alexa.BuildMessageJson(), new MediaTypeHeaderValue("application/json"));
        }

        /// <summary>
        /// Takes an array and returns a random value from it.
        /// </summary>
        static T GetRandomArrayValue<T>(IEnumerable<T> array)
        {
            // Order by a random guid to get a random first value.
            return array.OrderBy(i => Guid.NewGuid()).First();
        }
    }
}
