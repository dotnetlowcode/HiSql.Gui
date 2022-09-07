# HiSql.Gui
HiSql发布时，我们就说过HiSql不仅是一个ORM框架!HiSql.GUI 是基于开源HiSql开发的一个带GUI界面的跨数据基础管理工具，提供了表创建、修改、删除等基于表的操作，同时也提供了表数据的操作如批量的数据导入导出，根据数据生成图形报表。为了节省后端开发量对表的增、删、查、改可以动态的生成API接口，后续我们将会持续维护此开源项目。


## HiSql.GUI源码
HiSql.GUI的源码分成两部分前端和后台

### 前端源码
通过`vscode` 打开`WEB` 目录 通过命令 `npm install` 安装完成后再通过`npm run build` 编译生成前端代码在`dist` 目录 将编译生成的前端代码拷至后端源码`HiSql.GUI` 项目下的`wwwroot` 目录


### 后端源码

通过`visual studio` 打开 `Server`目录下的`HiGui.sln` 解决方案,运行`HiSql.Gui.WebApi`

注意：`HiSql.Gui.WebApi`  默认引用的是`nuget`上的`HiSql.Gui.dll` 如果需要测试本地的请引用项目`HiSql.GUI.csproj`


## 项目使用步骤

 1.
