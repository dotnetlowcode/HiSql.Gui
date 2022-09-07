using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace HiSql.GUI
{
    public static class EncryptionUtility
    {



        public static string GenerateSalt()
        {
            byte[] data = new byte[0x10];
            new RNGCryptoServiceProvider().GetBytes(data);
            return Convert.ToBase64String(data);
        }

        public static string EncryptSHA256(string input, string salt)
        {
            if (salt == null)
            {
                salt = GenerateSalt();
            }
            // 将密码和salt值转换成字节形式并连接起来
            byte[] bytes = Encoding.Unicode.GetBytes(input);
            byte[] src = Convert.FromBase64String(salt);
            byte[] dst = new byte[src.Length + bytes.Length];
            Buffer.BlockCopy(src, 0, dst, 0, src.Length);
            Buffer.BlockCopy(bytes, 0, dst, src.Length, bytes.Length);

            // 选择算法，对连接后的值进行散列
            HashAlgorithm algorithm = HashAlgorithm.Create("SHA256");
            byte[] inArray = algorithm.ComputeHash(dst);

            // 以字符串形式返回散列值
            return Convert.ToBase64String(inArray);
        }


        /// <summary>
        /// 生成md5
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string To16MD5(string str)
        {
            MD5CryptoServiceProvider provider = new MD5CryptoServiceProvider();
            return BitConverter.ToString(provider.ComputeHash(Encoding.Default.GetBytes(str)), 4, 8).Replace("-", "");
        }





        /// <summary>
        /// 字符可逆加密
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="payload"></param>
        /// <param name="Key"></param>
        /// <returns></returns>
        public static string? DESEncode<T>(T payload, string key)
        {
            var playload = Newtonsoft.Json.JsonConvert.SerializeObject(payload);
            return DESEncode(playload, key);
        }

        /// <summary>
        /// 反解析Token
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="str"></param>
        /// <param name="key"></param>
        /// <returns></returns>
        public static T DESDecodeToEntity<T>(string str, string key)
        {
            var json = DESDecode(str, key);
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(json);
        }


        /// <summary>
        /// 字符可逆加密
        ///  密钥必须是8位长度
        /// </summary>
        /// <param name="Str">加密字符串</param>
        /// <param name="Key">密钥</param>
        /// <returns></returns>
        public static string? DESEncode(string Str, string Key)
        {
            if (Str == null)
                return null;
            DESCryptoServiceProvider des = new DESCryptoServiceProvider();
            byte[] inputByteArray = Encoding.Default.GetBytes(Str);
            des.Key = ASCIIEncoding.ASCII.GetBytes(Key);
            des.IV = ASCIIEncoding.ASCII.GetBytes(Key);
            MemoryStream ms = new MemoryStream();
            CryptoStream cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            StringBuilder ret = new StringBuilder();
            foreach (byte b in ms.ToArray())
                ret.AppendFormat("{0:X2}", b);
            ret.ToString();
            return ret.ToString();
        }



        /// <summary>
        /// 字符串MD5解密
        /// 密钥必须是8位长度
        /// </summary>
        /// <param name="Str">解密字符串</param>
        /// <param name="Key">密钥</param>
        /// <returns></returns>
        public static string? DESDecode(string Str, string Key)
        {
            if (Str == null)
                return null;
            DESCryptoServiceProvider des = new DESCryptoServiceProvider();
            byte[] inputByteArray = new byte[Str.Length / 2];
            for (int x = 0; x < Str.Length / 2; x++)
            {
                int i = (Convert.ToInt32(Str.Substring(x * 2, 2), 16));
                inputByteArray[x] = (byte)i;
            }
            des.Key = ASCIIEncoding.ASCII.GetBytes(Key);
            des.IV = ASCIIEncoding.ASCII.GetBytes(Key);
            MemoryStream ms = new MemoryStream();
            CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            StringBuilder ret = new StringBuilder();
            return System.Text.Encoding.Default.GetString(ms.ToArray());
        }
    }
}
