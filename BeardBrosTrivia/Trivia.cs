using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Azure.WebJobs;
using Microsoft.ProjectOxford.Vision;
using Newtonsoft.Json.Linq;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System.Net;

namespace BeardBrosTrivia
{
    public class TriviaBoi
    {
        [FunctionName("BeardBrosTrivia")]
        public static HttpResponseMessage Run([HttpTrigger(AuthorizationLevel.Anonymous, "GET", WebHookType = "genericJson")] HttpRequestMessage req)
        {
            return req.CreateResponse("Hello nerd");
        }
    }
}
