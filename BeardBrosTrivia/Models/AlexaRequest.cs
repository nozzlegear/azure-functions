using System;
using Newtonsoft.Json;

namespace BeardBrosTrivia.Models
{
    public class ApplicationDetails
    {
        public string applicationId { get; set; }
    }

    public class SessionAttributes
    {
    }

    public class UserDetails
    {
        public string userId { get; set; }
        public string accessToken { get; set; }
        public UserPermissions permissions { get; set; }
    }

    public class SessionDetails
    {
        public string sessionId { get; set; }
        public ApplicationDetails application { get; set; }
        public SessionAttributes attributes { get; set; }
        public UserDetails user { get; set; }
        [JsonProperty("new")]
        public bool IsNew { get; set; }
    }

    public class Slots
    {
    }

    public class Intent
    {
        public string name { get; set; }
        public Slots slots { get; set; }
    }

    public class RequestDetails
    {
        public string requestId { get; set; }
        public string locale { get; set; }
        public string type { get; set; }
        public long timestamp { get; set; }
        public Intent intent { get; set; }
    }

    public class UserPermissions
    {
        public string consentToken { get; set; }
    }

    public class DeviceInterfaces
    {

    }

    public class DeviceDetails
    {
        public string deviceId { get; set; }
        public DeviceInterfaces supportedInterfaces { get; set; }
    }

    public class SystemDetails
    {
        public ApplicationDetails application { get; set; }
        public UserDetails user { get; set; }
        public DeviceDetails device { get; set; }
        public string apiEndpoint { get; set; }
    }

    public class ContextDetails
    {
        public SystemDetails System { get; set; }
    }

    public class AlexaRequest
    {
        public SessionDetails session { get; set; }
        public RequestDetails request { get; set; }
        public ContextDetails context { get; set; }
    }
}