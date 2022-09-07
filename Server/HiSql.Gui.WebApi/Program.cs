

using HiSql.Gui.WebApi.Helper;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Text.Json;
using HiSql.WebUI;
using HiSql.GUI;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
services.AddHiDataMannger();


services.AddHiSqlSetup()


.AddControllers()
.AddNewtonsoftJson(options =>
{
    //��������д
    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
});


var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthentication();
app.UseAuthorization();


/// <summary>
/// ִ��HiSql��װ
/// </summary>
app.UseHiSqlGuiInstall();

app.UseHiDataWeb();


app.UseCors();
app.MapControllers();

app.Run();
