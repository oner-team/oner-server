1. 页面名不要和 apiPrefix 中的自定义 key 重复

## 开发约定
- 从 2.0.0-alpha71 > 2.0.1 开始，不再使用 alpha 版本
- 不要再发布调试版本，如果发错误修复版请覆盖式发布。只允许覆盖自己的版本，一旦有人使用了自己发布的版本，不允许再覆盖。
- shu publish -f 覆盖式发布

## 前端开发环境之node层

node层以安装包的形式被集成到前端开发环境(即由脚手架创建的项目初始化文件)的中，只应该保留轻量却非常重要的功能。

- 为单页面项目提供的路由功能，比如监控项目。
- 集成鉴权模块(`authorize.js`)，包括登录页和鉴权跳转功能。

## 项目依赖

- node v7 运行环境
- koa v2 框架
- koa-views 视图渲染
- koa-router 路由
- natty-storage 配置管理
- nunjucks 模板引擎

## 模块说明

#### authorize.js

鉴权模块，定义了项目的两个路由：

- `/login` 跳转到登录页面
- `/logout` 执行退出并跳转到登录页面

## 环境说明

详见xmind

## 开发脚印

#### 2017-06-21

- `fs`模块的上传功能在应用平台的测试环境验证通过。

#### 2017-06-22

- 梳理前端开发环境，Node部署环境的标识，和枫弦同步后，进行修改。

#### 2017-05-18

- 鉴权模块改为内置
- `project.config.js`增加了`plugins`配置，小白鼠项目是广鹏的`oss`。

# 三、项目project.config.js配置项解析
- [看这里](http://git.dtwave-inc.com/cadillac/oner-server/blob/2.x/INTRODUCE.md)


# 四、sso-sites包发布
* [sso-sites包发布文档](http://git.dtwave-inc.com/cadillac/sso-sites)

# 五、开发中经常用到或者需要注意的事项
### 文档地址
*   [koa文档](http://koa.bootcss.com/)
*   [express文档（寒毅封装过）](http://doc.dtos.dtwave-inc.com/altair/doc/module_develop.html)
### favicon，网页标题小图标
* spa.njk模板页，head标签加入以下代码

```javascript
<link rel="shortcut icon" href="{{staticPath}}favicon.ico" type="image/x-icon">
```
* favicon.ico丢到项目的cdn目录下

### 升级oner-server命令，升级sso-sites命令
* shu i oner-server@2.0.0-alpha36 --save -E
* shu i sso-sites --save-dev

### 本地起两个项目，修改项目端口号
* 修改webpack.config.js文件中的PORT端口
* 修改project.config.js文件中的port端口
* 修改project.config.js文件中的refererWhiteList白名单的本地域名
* oner-server文件夹中config.js文件中的_dev_


### 本地调试oner-server
* project.config.js文件中const env = require('oner-server/env')改为const env = require('../oner-server/env')
* 前台项目启动命令npm run watch-oner，快捷键：nw2
* oner-server启动debugger
    * Working directory：
        * 例：/Users/hse/hse/Work/datax-test
        * 选择工作目录
    * JavaScript file：
        * 例：/Users/hse/hse/Work/oner-server/oner-server
        * 入口文件，oner-server项目的oner-server文件
    * Environment variables：
        * CLIENT_ENV=development
        * NODE_ENV=development
        * ONER_SERVER_ENV=development

### 发布cdn注意事项
* project.config.js文件中client配置
    * name：匹配cdn的路径
    * version：匹配路径下的版本包
* package.json文件中
    * nodeEnv：影响注入页面的环境变量
        * production：生产环境
        * demo：demo环境
        * youboy：一呼百应环境
        * test：测试环境
* 例：一呼百应，发布cdn
    * name: 'youboy/account',
    * version: '1.1.0'，
    * nodeEnv：'production'











