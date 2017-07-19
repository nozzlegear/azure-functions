using System;
using System.Net.Http;
using System.Net;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;

namespace BeardBrosTrivia
{
    public class TriviaBoi
    {
        [FunctionName("BeardBrosTrivia")]
        public static HttpResponseMessage Run([HttpTrigger(AuthorizationLevel.Anonymous, "GET", WebHookType = "genericJson")] HttpRequestMessage req)
        {
            return req.CreateResponse(new
            {
                Hello = "world"
            });
        }
    }
}
