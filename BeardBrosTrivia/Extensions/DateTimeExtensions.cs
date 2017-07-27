using System;

namespace BeardBrosTrivia
{
    public static class DateTimeExtensions
    {
        public static long ToUnixTimestamp(this DateTime time)
        {
            return (long)(TimeZoneInfo.ConvertTimeToUtc(time) - new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc)).TotalSeconds;
        }
    }
}