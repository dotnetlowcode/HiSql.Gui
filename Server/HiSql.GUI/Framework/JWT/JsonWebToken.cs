using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text; 
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace HiData.Framework.JWT
{
    //Install-Package System.IdentityModel.Tokens.Jwt  
    public enum JwtHashAlgorithm
    {
        RS256,
        HS384,
        HS512
    }

    public class JsonWebTokenPayload<T>
    {
        public JsonWebTokenPayload(T _obj, List<string> _scopeApplication, long _expirationSecond)
        {
            if (_obj != null && _expirationSecond > 0)
            {
                this.Obj = _obj;
                this.ScopeApplication = _scopeApplication;
                this.ExpirationSecond = _expirationSecond;
                var currDate = DateTime.Now;
                EffectTime = JsonWebToken.ConvertDateTimeLong(currDate);
                var exTime = currDate.AddSeconds(_expirationSecond);
                ExpirationTime = JsonWebToken.ConvertDateTimeLong(exTime);
            }
        }

        /// <summary>
        /// 数据对象
        /// </summary>
        public T Obj { get; set; }


        /// <summary>
        /// API接口地址列表
        /// </summary>
        public List<string> ScopeApplication { get; set; }

        /// <summary>
        ///  有效的秒数
        /// </summary>
        public long ExpirationSecond{ get; set; }


        /// <summary>
        /// token生成时间
        /// </summary>
        public long EffectTime { get; set; }


        /// <summary>
        /// token失效时间
        /// </summary>
        public long ExpirationTime { get; set; }


        /// <summary>
        /// 判断token是否已经失效
        /// </summary>
        /// <returns></returns>
        public bool IsValid()
        {
            var exTime = JsonWebToken.GetTime(ExpirationTime);
            return (DateTime.Now - exTime).TotalSeconds < 0;
        }
    }

    public class JsonWebTokenPayload : JsonWebTokenPayload<object>
    {
        public JsonWebTokenPayload(object _obj, List<string> _scopeApplication, long _expirationSecond)
            : base(_obj, _scopeApplication, _expirationSecond)
        {
        }
    }

    public class JsonWebToken
    {


        /// <summary>
        /// DateTime时间格式转换为13位带毫秒的Unix时间戳
        /// </summary>
        /// <param name="time"> DateTime时间格式</param>
        /// <returns>Unix时间戳格式</returns>
        public static long ConvertDateTimeLong(DateTime time)
        {
            DateTime startTime = TimeZone.CurrentTimeZone.ToLocalTime(new DateTime(1970, 1, 1)); // 当地时区
            long timeStamp = (long)(time - startTime).TotalSeconds; // 相差秒数
            return timeStamp;
        }

        /// <summary>
        /// 时间戳转为C#格式时间
        /// </summary>
        /// <param name="timeStamp">Unix时间戳格式</param>
        /// <returns>C#格式时间</returns>
        public static DateTime GetTime(long unixTimeStamp)
        {
            DateTime startTime = TimeZone.CurrentTimeZone.ToLocalTime(new DateTime(1970, 1, 1)); // 当地时区
            DateTime dt = startTime.AddSeconds(unixTimeStamp);
            return dt;
        }
        private static Dictionary<JwtHashAlgorithm, Func<byte[], byte[], byte[]>> HashAlgorithms;

        static JsonWebToken()
        {
            HashAlgorithms = new Dictionary<JwtHashAlgorithm, Func<byte[], byte[], byte[]>>
            {
                { JwtHashAlgorithm.RS256, (key, value) => { using (var sha = new HMACSHA256(key)) { return sha.ComputeHash(value); } } },
                { JwtHashAlgorithm.HS384, (key, value) => { using (var sha = new HMACSHA384(key)) { return sha.ComputeHash(value); } } },
                { JwtHashAlgorithm.HS512, (key, value) => { using (var sha = new HMACSHA512(key)) { return sha.ComputeHash(value); } } }
            };
        }

        public static string Encode(JsonWebTokenPayload payload, string key, JwtHashAlgorithm algorithm)
        {
            return Encode(payload, Encoding.UTF8.GetBytes(key), algorithm);
        }

        private static string Encode(JsonWebTokenPayload payload, byte[] keyBytes, JwtHashAlgorithm algorithm)
        {
            var segments = new List<string>();
            var header = new { alg = algorithm.ToString(), typ = "JWT" };

            byte[] headerBytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(header, Formatting.None));
            byte[] payloadBytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(payload, Formatting.None));
            //byte[] payloadBytes = Encoding.UTF8.GetBytes(@"{"iss":"761326798069-r5mljlln1rd4lrbhg75efgigp36m78j5@developer.gserviceaccount.com","scope":"https://www.googleapis.com/auth/prediction","aud":"https://accounts.google.com/o/oauth2/token","exp":1328554385,"iat":1328550785}");  

            segments.Add(Base64UrlEncode(headerBytes));
            segments.Add(Base64UrlEncode(payloadBytes));

            var stringToSign = string.Join(".", segments.ToArray());

            var bytesToSign = Encoding.UTF8.GetBytes(stringToSign);

            byte[] signature = HashAlgorithms[algorithm](keyBytes, bytesToSign);
            segments.Add(Base64UrlEncode(signature));

            return string.Join(".", segments.ToArray());
        }












        public static JsonWebTokenPayload<T> Decode<T>(string token, string key)
        {
            return Decode<T>(token, key, true);
        }
        public static JsonWebTokenPayload<object> Decode(string token, string key)
        {
            return Decode<object>(token, key, true);
        }


        public static JsonWebTokenPayload<T> Decode<T>(string token, string key, bool verify)
        {
            if (string.IsNullOrWhiteSpace(token))
                token = "";
            if (string.IsNullOrWhiteSpace(key))
                key = "";
            var parts = token.Split('.');
            var header = parts[0];
            var payload = parts[1];
            byte[] crypto = Base64UrlDecode(parts[2]);

            var headerJson = Encoding.UTF8.GetString(Base64UrlDecode(header));
            var headerData = JObject.Parse(headerJson);
            var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(payload));

            var payloadData = JsonConvert.DeserializeObject<JsonWebTokenPayload<T>>(payloadJson);

            if (verify)
            {
                var bytesToSign = Encoding.UTF8.GetBytes(string.Concat(header, ".", payload));
                var keyBytes = Encoding.UTF8.GetBytes(key);
                var algorithm = (string)headerData["alg"];

                var signature = HashAlgorithms[GetHashAlgorithm(algorithm)](keyBytes, bytesToSign);
                var decodedCrypto = Convert.ToBase64String(crypto);
                var decodedSignature = Convert.ToBase64String(signature);
                
                if (decodedCrypto != decodedSignature)
                {
                    throw new  Exception("无效的签名");
                    //throw new MessageTokenException("无效的签名");
                    //throw new ApplicationException(string.Format("无效的签名. Expected {0} got {1}", decodedCrypto, decodedSignature));
                }
            }

            //return payloadData.ToString();  
            return payloadData;
        }


        private static JwtHashAlgorithm GetHashAlgorithm(string algorithm)
        {
            switch (algorithm)
            {
                case "RS256": return JwtHashAlgorithm.RS256;
                case "HS384": return JwtHashAlgorithm.HS384;
                case "HS512": return JwtHashAlgorithm.HS512;
                default: throw new InvalidOperationException("Algorithm not supported.");
            }
        }

        // from JWT spec  
        private static string Base64UrlEncode(byte[] input)
        {
            var output = Convert.ToBase64String(input);
            output = output.Split('=')[0]; // Remove any trailing '='s  
            output = output.Replace('+', '-'); // 62nd char of encoding  
            output = output.Replace('/', '_'); // 63rd char of encoding  
            return output;
        }

        // from JWT spec  
        private static byte[] Base64UrlDecode(string input)
        {
            var output = input;
            output = output.Replace('-', '+'); // 62nd char of encoding  
            output = output.Replace('_', '/'); // 63rd char of encoding  
            switch (output.Length % 4) // Pad with trailing '='s  
            {
                case 0: break; // No pad chars in this case  
                case 2: output += "=="; break; // Two pad chars  
                case 3: output += "="; break; // One pad char  
                default: throw new Exception("Illegal base64url string!");
            }
            var converted = Convert.FromBase64String(output); // Standard base64 decoder  
            return converted;
        }


    }



}