using System;

namespace BeardBrosTrivia.Validation
{
    public class RequestValidationException : Exception
    {
        public RequestValidationException(string message) : base(message) { }

        public RequestValidationException(string message, Exception baseException) : base(message, baseException) { }
    }
}