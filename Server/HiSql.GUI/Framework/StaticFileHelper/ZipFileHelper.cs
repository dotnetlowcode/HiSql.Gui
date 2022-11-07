using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HiSql.GUI.Framework.StaticFileHelper
{
    public class ZipFileHelper
    {
        static ZipFileHelper()
        {
            ZipConstants.DefaultCodePage = Encoding.UTF8.CodePage;
        }
        /// <summary>
        /// 文件转ZIP
        /// </summary>
        /// <param name="filePaths"></param>
        /// <param name="zipSavePath"></param>
        public static async Task FilesToZip(List<string> filePaths, string zipSavePath)
        {
            var ms = new FileStream(zipSavePath, FileMode.Create);
            using ZipFile file = ZipFile.Create(ms);
            file.BeginUpdate();
            foreach (var filePath in filePaths)
            {
                if (File.Exists(filePath))
                {
                    var fileName = Path.GetFileName(filePath);
                    file.Add(filePath, fileName);
                }
            }
            file.CommitUpdate();
            await ms.FlushAsync();
            ms.Close();
        }
    }
}
