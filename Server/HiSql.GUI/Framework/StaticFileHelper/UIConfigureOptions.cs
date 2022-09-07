using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HiSql.Gui.WebApi.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace HiSql.WebUI
{
    internal class UIConfigureOptions : IPostConfigureOptions<StaticFileOptions>
    {
        public void PostConfigure(string name, StaticFileOptions options)
        {
            options.FileProvider = new CompositeFileProvider(new ManifestEmbeddedFileProvider(typeof(DataBaseController).Assembly, "wwwroot"));
            options.RequestPath = "/hidataweb";
        }
    }
}
