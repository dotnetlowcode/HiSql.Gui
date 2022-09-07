# HISql Gui Web


### 相关框架

##### 这个是HiSql Gui 前端源码,整体基于Vue3+TS框架开发. 界面框架用的是 Ant Design Vue



# 启动

- 第一步

##### 修改根目录下文件`.env.development`,将里面的ServerApiHost修改为您APi的服务器Host

![image](https://user-images.githubusercontent.com/6754634/188842469-8230825b-fe72-4c46-b745-498368404f7f.png)

- 第二步

##### 依次执行脚本

``` Shell
  yarn 或者 npm i
  
  yarn dev 或者 npm run dev
```

#### 打开地址

 `http://localhost:3000/`
 
 用户名: `hisql`
 
 密码:  `123456`


### 目录结构


``` shell
src
├── App.vue
├── assets
│   ├── 资源引用
├── auto-imports.d.ts
├── components
│   ├── 组建目录
├── components.d.ts
├── env.d.ts
├── helper
│   ├── 辅助类
├── layouts
│   ├── 模板页
├── main.ts
├── router
│   └── index.ts
├── serverApi
│   ├── 对接服务端API
├── store
│   ├── 全局存储
├── types
│   └── typing.d.ts
├── utils
│   └── index.ts
└── views
    ├── 入口页面
```

