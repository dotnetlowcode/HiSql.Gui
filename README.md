# HiSql.Gui
HiSql发布时，我们就说过HiSql不仅是一个ORM框架!HiSql.GUI 是基于开源HiSql开发的一个带GUI界面的跨数据基础管理工具，提供了表创建、修改、删除等基于表的操作，同时也提供了表数据的操作如批量的数据导入导出，根据数据生成图形报表。为了节省后端开发量对表的增、删、查、改可以动态的生成API接口，后续我们将会持续维护此开源项目。




## HiSql.GUI源码
HiSql.GUI的源码分成两部分前端和后台

### 前端源码 
通过`vscode` 打开`WEB` 目录 通过命令 `npm install` 安装完成后再通过`npm run build` 编译生成前端代码在`dist` 目录 将编译生成的前端代码拷至后端源码`HiSql.GUI` 项目下的`wwwroot` 目录


### 后端源码

通过`visual studio` 打开 `Server`目录下的`HiGui.sln` 解决方案,运行`HiSql.Gui.WebApi` 

注意：`HiSql.Gui.WebApi`  默认引用的是`nuget`上的`HiSql.Gui.dll` 如果需要测试本地的请引用项目`HiSql.GUI.csproj`


### 连接配置
在站点配置`appsettings.json` 和`appsettings.Development.json` 如下让所示
``` js
{
  "Kestrel": {
    "EndPoints": {
      "Http": {
        "Url": "http://*:5170"
      }
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "HiGui": {
    "SiteUrl": "http://127.0.0.1:5170",
    /*连接字符串*/
    "DbConnection": {
      "DbType": "SqlServer",
      "DbServer": "Hone_HiData",
      //"ConnectionString": "server=(local);uid=sa;pwd=Hone@123;database=Hone;Encrypt=True; TrustServerCertificate=True;",
      "ConnectionString": "server=192.168.10.88,7433;uid=sa;pwd=abcabc;database=Hone_HiData;;Encrypt=True; TrustServerCertificate=True;",
      "Schema": "dbo"
    }
  }
}
```

`HiSql.Gui` 支持多种数据库 只要是`HiSql`支持的库都可以.
`HiGui.DbConnection.DbType` 该节点可配置当前使用的数据类型 注意当前类型一定引用`HiSql`支持的数据库包








# 启动
默认地址：`http://127.0.0.1:5170/hidataweb/index.html#/login`
帐号：`hisql` 密码:`123456`














