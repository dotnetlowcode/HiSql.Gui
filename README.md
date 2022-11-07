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

```json
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

*   第一步

    ##### 打开项目配置文件 `Server/HiSql.Gui.WebApi/appsettings.Development.json`,修改连接数据库连接字符串

![image](https://user-images.githubusercontent.com/6754634/188810858-a8938b19-f34e-4afb-bf83-9a20a5c6577d.png)

*   第二步

    ##### 编译启动项目,访问地址

    默认地址：`http://127.0.0.1:5170/hidataweb/index.html#/login`

    帐号：`hisql` 密码:`123456`

> ## 用户登录

> ## 表创建

#### 表结构

当HiSql GUI启动后会自动扫描数据库中所有表结构,自动建立和缓存表结构信息.
后续对表的结构操作和表信息和字段操作都会自动在`Hi_TabModel` 和`Hi_FieldModel` 保存起来.

##### 系统表:

***

```typescript
 `Hi_TabModel` :表基本信息
 `Hi_FieldModel`:表字段基本信息
 `Hi_FieldModelExt`:表字段扩展信息表,主要存放表字段高级配置
 `Hi_Domain`:系统中枚举数据
 `Hi_DataElement`:系统枚举值保存表
 `Hi_DataType`:数据库表字段类型
 `Hi_Version`:HiSql版本信息
 `Hi_UserInfo`:登录用户信息
 `Hi_UserRole`:用户角色信息
 `Hi_Api`:HiApi 主体信息表
 `Hi_ApiBlock`:HiApi 代码块信息表
 `Hi_ApiParam`:HiApi 代码块参数表
 `Hi_ViewExt`: 视图设计信息存储表
```

**创建表步骤：**

> 点击数据表=>再点创建=>填写表名和表描述,注意:==表名只能是英文==,因为会做为最终物理表的名字
> ![image](https://user-images.githubusercontent.com/6754634/199671412-37ea4083-505d-4645-87fa-3061c79d309c.png)

*   默认有4个标准字段,建议添加`CreateTime`,`CreateName`,`ModiTime`,`ModiName`
*   如果有`excel`,可以选择`excel`列导入,导入后再修改列类型,`设置好主键`即可保存.
*   也可以点击`增加列`来新增字段,或者点`复制表字段`快速复制其他表的列
*   注意: ==切记设置主键列==

**表索引：**

> 勾选要创建的索引列保存即可以创建索引
> ![image](https://user-images.githubusercontent.com/6754634/199689938-f4867761-3aad-46d2-a9d0-88da32b46853.png)

**表数据：**

> 展示当前表里存在的数据,也可以对表数据进行CURD
> <img src="https://user-images.githubusercontent.com/6754634/199690835-cf548e82-981d-44c0-aadc-28709b0a7336.png" width="90%" >

### API

> 针对每个数据表我们都生成了可以直接`增,删,改,查`的Api接口,以及完整的文档描述
> ![image](https://user-images.githubusercontent.com/6754634/199871159-95aa02bf-becf-4027-849b-49ac6c0a823c.png)

### 图表

> 针对当前数据库的数据表,可以创建分析图表
> <img src="https://user-images.githubusercontent.com/6754634/199872437-a1538471-3fde-4a0b-8967-e3c972fcdd17.png" width="80%" >

## 视图
可以通过视图设计器创建视图,其他操作和数据表基本一致
![image](https://user-images.githubusercontent.com/6754634/199877312-c4ab4ce6-9dab-4bd4-8eda-2607ef59bb46.png)

## 数据接口
#### 数据接口是为了快速创建API
![image](https://user-images.githubusercontent.com/6754634/199906567-8222a0f8-8398-4aef-ac88-95f8b06c01ac.png)
功能开发目标:
- [x]  HiSql查询功能块
- [ ] JavaScript逻辑功能模块
- [ ] 日志收集
- [ ] 性能监控
- [ ] 单元测试


一个数据接口由多个功能块构成,每个功能块由`入参`,`出参`,`功能体`构成,功能体可以是`HiSQL`,`TS代码`,或者功能函数.

![image](https://user-images.githubusercontent.com/6754634/200214571-50a9f1a3-65e9-43e7-9ea9-160aec185eda.png)


## 定时任务
#### 目前定时任务支持SQL数据自动定时导出到新表,自动导出并推送到指定Url地址,后续会结合数据接口实现更加高级的功能

##### HiSQL定时任务
![image](https://user-images.githubusercontent.com/6754634/200214945-ae0dc9ae-4271-4331-b628-76064d24b269.png)

##### Excel模板数据导出
![image](https://user-images.githubusercontent.com/6754634/200215103-70900339-a3b4-494b-a823-88932187846c.png)
