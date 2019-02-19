## @dtwave/oner-server/3.2.0 @墨鱼 2019-02-18
- npm run tar 把 .svn 文件夹忽略掉

## @dtwave/oner-server/3.1.9 @墨鱼 2019-02-13
- 更新版本号以解决依赖^只安装到3.1.8问题

## @dtwave/oner-server/3.1.9-alpha3 @墨鱼 2019-01-31
- 增加多页面启动时，打印url时未自定义路由时的容错

## @dtwave/oner-server/3.1.9-alpha2 @七万 2019-01-30
- 修复 /login 路由跳转中信定制登录URL的语法错误

## @dtwave/oner-server/3.1.9-alpha1 @思恩 2019-01-30
- 私有化部署处理静态资源，如果是account项目，取配置文件config.json所配的accountDomain作为前缀

## @dtwave/oner-server/3.1.8 @墨鱼 2019-01-29
- 多页面启动，终端打印页面名称和页面访问url

## @dtwave/oner-server/3.1.7 @墨鱼 2019-01-28
- 根据配置开启X-Frame-Options

## @dtwave/oner-server/3.1.7-alpha2 @墨鱼 2019-01-24
- tar 过滤掉dist文件夹

## @dtwave/oner-server/3.1.7-alpha1 @七万 2019-01-23
- http://xxxx => //xxxx

## @dtwave/oner-server/3.1.6 @七万 2019-01-11 
- fix 3.1.5 ，authorize & common-page  appConfig 未替换完全

## @dtwave/oner-server/3.1.5 @墨鱼 2019-01-11
- 项目配置写进natty-storage，用的时候从config里取

## @dtwave/oner-server/3.1.4-alpha9 @七万
- 修复通用页面渲染路径

## @dtwave/oner-server/3.1.4-alpha8 @七万
- 修复通用页面路径跳转问题

## @dtwave/oner-server/3.1.4-alpha7 @思恩
- 修复项目自身资源引用cdn的协议问题 去掉ctx.protocol协议

## @dtwave/oner-server/3.1.4-alpha6 @七万
- 修复对接中信登录，用户中心accout路由冲突

## @dtwave/oner-server/3.1.4-alpha5 @七万
- 修复对接中信登录，登出后再次登录 url 错误

## @dtwave/oner-server/3.1.4-alpha4 @七万
- pathprefix 修复对接中信登录，登录页 url 错误

## @dtwave/oner-server/3.1.4-alpha3 @七万
- oner tar 移植进来，  npm run tar

## @dtwave/oner-server/3.1.4-alpha2 @七万
- 修复 alpha1 对没有 order 参数的资源也进行了排序

## @dtwave/oner-server/3.1.4-alpha1 @七万
- 可对 js css 资源进行排序，资源后面跟参数 order ，项目自身资源默认为 0，从大到小排列

## @dtwave/oner-server/3.1.3 @七万
- 新增 server.logRoot ，可自定义 log 文件目录，默认 /data/merak-server/logs/apps

## @dtwave/oner-server/3.1.2 @七万
- 修复多页中有单页时，没有替换掉对应页面js 中的 p="//cdn.dtwave.com

## @dtwave/oner-server/3.1.1-alpha5 @思恩
- 修改 alpha3 的细节

## @dtwave/oner-server/3.1.1-alpha4
- 修复一堆因 pathPrefix 引起的路径错误

## @dtwave/oner-server/3.1.1-alpha3 @思恩
- 添加批量发送请求处理接口
	- method: 'POST'
	- url: '/batch/api'
	- params：options
- params示例	

```
{
    options: [{
      method: 'GET',
      url: '/api/v1/tracking/projects/list',
      data: {
        currentPage: 1,
        pageSize: 10,
      },
    }, {
      method: 'GET',
      url: '/api/v4/resource/engine/lists_simple',
    }],
  }  

```


## @dtwave/oner-server/3.1.1-alpha2
- 修复 bug ，用户中心代理接口没有替换掉 pathPrefix

## @dtwave/oner-server/3.1.1-alpha1
- 新增对 pathPrefix 的支持

## @dtwave/oner-server/3.1.0
- 改回了 3.0.6 的改动，破坏性升级升小版本号（开发环境不引入 main.css common.css）配合 webpack4.x 使用

## @dtwave/oner-server/3.0.6
- 改回了 3.0.5 的改动

## @dtwave/oner-server/3.0.5
- 单页的本地开发环境也不需要任何 css 资源引入。（其他环境仍然需要哦，eg: main.css）

## @dtwave/oner-server/3.0.4
- 修改 3.x 对 mpa 的适配

## @dtwave/oner-server/3.0.3
- 开发环境common.js带不带'/'都行
- 并且兼容4.0webpack

## @dtwave/oner-server/3.0.2
- 继续修复私有化项目自身静态资源没有带 项目名/版本号 前缀

## @dtwave/oner-server/3.0.1
- 修复私有化项目自身静态资源没有带 项目名/版本号 前缀

## @dtwave/oner-server/3.0.1-alpha1
- 修复私有化静态资源找不到/模板渲染自身资源少了‘/’问题

## @dtwave/oner-server/3.0.0
- 修复chunk文件前缀修改错误 main.js => common.js


## @dtwave/oner-server/3.0.0-alpha2
- 修复引入项目自身 cdn 路径

## @dtwave/oner-server/3.0.0-alpha1 @七万 @思恩 @才龙
- 完成了部署大改造

## @dtwave/oner-server/2.3.1-alpha2 @七万
- 给用户中心透传了 sessionIdName

## @dtwave/oner-server/2.3.1Alpha1 @七万
- 新增 server.authorize.sessionIdName 配置项

## @dtwave/oner-server/2.2.44Alpha4 @思恩
- fix 中信用户中心bug，
- 当account为https协议时，请求页面报错：unable to verify the first certificate
- rejectUnauthorized: false,

## @dtwave/oner-server/2.2.44Alpha3 @思恩
- fix 中信用户中心bug
- 个人中心页面超时，不去中信登录页

## @dtwave/oner-server/2.2.44Alpha2 @思恩
- fix 中信用户中心bug
- client.url.host 改为从配置项里拿

## @dtwave/oner-server/2.2.44Alpha1 @七万
- fix 中信用户中心bug


## @dtwave/oner-server/2.2.43Alpha2 @七万
- 添加 server.tip.404 配置项
- 把 koa-static-serve 中间件源码 copy 下来，修改了错误处理方式

## @dtwave/oner-server/2.2.43Alpha2 @七万
- 删除 server.tip.404 配置项
- dist 目录里扔一个 404.html 作为资源无法访问的返回

## @dtwave/oner-server/2.2.43Alpha1 @七万
- 增加 server.tip.404 配置项
- 静态资源服务404时显示的文案，for 斌总

## @dtwave/oner-server/2.2.42 @思恩
- fix 2.2.41 bug

## @dtwave/oner-server/2.2.41Alpha3 @七万
- fix 2.2.41aplha2 bug

## @dtwave/oner-server/2.2.41 @思恩
- 定制接入中信时，/login路由时，进入中信登录页

## @dtwave/oner-server/2.2.41Alpha2 @七万
- 代理用户中心系列接口，注入 remoteAddress


## @dtwave/oner-server/2.2.41Alpha1 @七万
- 修改获取ip逻辑

## @dtwave/oner-server/2.2.40 @李斌
- 改了登录接口地址  /user/login > /user/login/pre_login

## @dtwave/oner-server/2.2.39 @七万
- fix 38的bug

## @dtwave/oner-server/2.2.38 @思恩
- 航天科工统一登录接入，向下兼容

## @dtwave/oner-server/2.2.37 @七万
- 删除了默认引入的 common.js 和 common.css 

## @dtwave/oner-server/2.2.36 @七万
- api 请求匹配  /api/v*

## @dtwave/oner-server/2.2.35Alpha1 @七万
- /user/center/* 透传逻辑跟 /api/* 保持一致

## @dtwave/oner-server/2.2.34 @七万
- config.js 106 行 sure => get

## @dtwave/oner-server/2.2.33 @七万
- /fs/download 透传 cookie

## @dtwave/oner-server/2.2.32Alpha2 @思恩
- 修复2.2.32Alpha1版本转发用户中心接口问题

## @dtwave/oner-server/2.2.32Alpha1 @七万
- oner-server 内置用户中心接口，开放自定义接入版本

## @dtwave/2.2.32@思恩
- 解决托管发布拿不到ip的问题（到生产环境用户中心拿）

## @dtwave/2.2.31@七万
- 删除不必要的输出日志

## @dtwave/oner-server/2.2.30 @思恩
- 添加静态资源缓存时长

## @dtwave/oner-server/2.2.29 @七万
- 静态资源服务前缀替换掉所有 .

## @dtwave/oner-server/2.2.28 @七万
- 修改测试环境 keeper 连接地址
- 多服务地址，可以增加多层路径

## @dtwave/oner-server/2.2.27 @七万
- 恢复 isAjaxRequest

## @dtwave/oner-server/2.2.26 @七万
- 用户中心 authorize.js 146行 处理错误信息

## @dtwave/oner-server/2.2.25 @七万
- 2.2.24 有bug

## @dtwave/oner-server/2.2.24 @七万
- 新增 server.withoutVaild ，跳过前端请求验证

## @dtwave/oner-server/2.2.23 @七万
- mock 以及接口返回错误信息时对错误信息进行一次转义，上个版本没改彻底。
- mock 的错误信息不返回了
- 风险点，所有错误返回信息中的 < > 都会被转义掉 ！！！！！

## @dtwave/oner-server/2.2.22 @七万
- mock 以及接口返回错误信息时对错误信息进行一次转义

## @dtwave/oner-server/2.2.21 @七万
- apiheader 注入的值先从 ctx.header 里获取一次，获取不到再去获取设定的值

## @dtwave/oner-server/2.2.20
- 斌哥：接入外部系统登录鉴权页

## @dtwave/oner-server/2.2.19
- 不好意思，18 那个版本并不好使

## @dtwave/oner-server/2.2.18
- 模板渲染时可以通过 config('keeper.xxx.xxx') 获取到 keeper 的实时配置

## @dtwave/oner-server/2.2.17
- 透传 cookie 时可能会报的语法错误

## @dtwave/oner-server/2.2.16
- 修复 2.2.13 版本透传 cookie 把 header 里的其他值删除掉了

## @dtwave/oner-server/2.2.15
- 用户中心私有化，补全资源路径。主要是 static.js 里改 client.url.host

## @dtwave/oner-server/2.2.14
- 2.2.13 搞错了，把 cookie 的值打平放到 header 里了

## @dtwave/oner-server/2.2.13
- apiproxy 透传 cookie

## @dtwave/oner-server/2.2.12
- 增强对私有化部署的支持

## @dtwave/oner-server/2.2.11
- 非开发环境，并且 privateCdn 设置为 true，所有的资源加载都会走自身起的服务。
- 非开发环境，dist 目录下的所有资源都可以当做cdn资源访问
- mock数据本地开发从缓存里读，测试或线上从mock目录里读取
- 数据库更改mock数据，接口请求数据没有热更新

## @dtwave/oner-server/2.2.10
- 私有化静态资源路径可配
- server.staticPath  默认 static

## @dtwave/oner-server/2.2.9
- 添加一个注入变量showTenantLogo，用户登录时区分显不显示logo，做兼容用

## @dtwave/oner-server/2.2.8
- 继续修复上一个问题

## @dtwave/oner-server/2.2.7
- 继续修复登录未进入系统时，文件下载不用鉴权，定义的前缀account在url中出现过

## @dtwave/oner-server/2.2.6
- 登录未进入系统时，文件下载不用鉴权

## @dtwave/oner-server/2.2.5
- 单租户直接进入，不需要切换租户
- 定制化接入通用模块的系统，需要给 租户切换页面 注入定制化变量

## @dtwave/oner-server/2.2.4
- 租户变化的时候，修改是接口请求的提示文案

## @dtwave/oner-server/2.2.3
- 支持 登录 以及 切换租户 时筛选出有权限登录系统的租户

## @dtwave/oner-server/2.2.2
- keeper接入的端口改为8081

## @dtwave/oner-server/2.2.1
- 渲染 common page 页面，不鉴权的时候，不去请求获取userId注入页面

## @dtwave/oner-server/2.2.0
- 2.2.0正式版本，与2.2.0-alpha9内容一致

## @dtwave/oner-server/2.2.0-alpha9
- 修复私有接入时，不配showRegister、showForgetPaas时同配为false一样被拦截的问题

## @dtwave/oner-server/2.2.0-alpha8
- 修复接入个人中心不鉴权的问题

## @dtwave/oner-server/2.2.0-alpha7
- 私有化接入个人中心

## @dtwave/oner-server/2.2.0-alpha6
- 调试个人中心

## @dtwave/oner-server/2.2.0-alpha5
- 默认注入redirect: '/'，变量

## @dtwave/oner-server/2.2.0-alpha4
- 修改查询用户信息接口：需要部门信息

## @dtwave/oner-server/2.2.0-alpha3
- 不鉴权接口，injectData不注入userId、tenantId

## @dtwave/oner-server/2.2.0-alpha2
- logout时清cookie修复

## @dtwave/oner-server/2.2.0-alpha1
- 用户中心安全性变动改动：
- 1、去掉公有接入登录，只支持私有
- 2、check/login 变化
- 3、后续取userId、tenantId变化

## @dtwave/oner-server/2.1.24
- 修改获取用户信息接口：需要部门信息

## @dtwave/oner-server/2.1.23
- 路由匹配 ctx.url 修改为 ctx.path

## @dtwave/oner-server/2.1.22
- mock 数据支持线上环境

## @dtwave/oner-server/2.1.21
- 下载时，注入header三大参数自定义kv

## @dtwave/oner-server/2.1.20
- 下载时，注入header三大参数

## @dtwave/oner-server/2.1.19
- 修复文件下载代理路径读取错误
- 修复 log 日志 other 环境定义为 undefined
- 修复无权限页面倒计时结束后跳转路径问题

## @dtwave/oner-server/2.1.18
- 私有化接入渲染第二种注册页面（/register-private）

## @dtwave/oner-server/2.1.17
- 删除掉 16 版本非开发环境 render 渲染保存 html 逻辑
- 修复 log 日志非test/development 取不到 logRoot bug

## @dtwave/oner-server/2.1.16
- 支持多页应用中单页路由匹配
- 这个版本不要用，能启动，但一访问应用就会挂掉

## @dtwave/oner-server/2.1.15
- 私有化部署所有静态资源都放在dist目录下对应的变动
 - 新增`privateCdn`配置
 - 私有化部署静态资源重定向功能 (static TO dist)
 - 废除`cdnHost`配置
 - 启动服务时，会将template.njk编译成index.html，并放入对应项目的dist文件夹内

## @dtwave/oner-server/2.1.14
-  修复日志分割、收集功能的路径问题

## @dtwave/oner-server/2.1.13
-  添加日志分割、收集

## @dtwave/oner-server/2.1.12
-  用户中心接口注入ip，兼容jenkins和托管

## @dtwave/oner-server/2.1.11
1. 修改了 config('client.url.host') 从写死 0.0.0.0 到 node 动态获取本机 ip。增强了对开发环境局域网内其他机器访问的支持
2. api header 里加入 X-Dtwave-Access-UserId、X-Dtwave-Access-TenantId、X-Dtwave-Access-ProductId

## @dtwave/oner-server/2.1.10
- 针对 oenr-socket 做了些修改

## @dtwave/oner-server/2.1.9
- 支持 @dtwave/oner-server/oner-socket

## 2.1.8
- 加入自定义免鉴权功能

## 2.1.7 
- 解决免登时租户被切换的问题

## 2.1.6
- 恢复多页对 common.css 的引用

## 2.1.5
- 配好配置中心线上地址
- 删除掉多页应用多引的 common.css

## 2.1.4
- 支持线上监听端口方式起应用，handle pm2 直接起服务场景

## 2.1.3
- render.js 代码重构

## 2.1.2
- 修改keeper配置中心项（暂时只支持测试环境）

## 2.1.1
- 如果是用户中心项目，鉴权的时候return掉

## 2.1.0
- 文件结构大改，oner-server 中只做资源引用，不写逻辑
- fs 上传，返回两个下载链接，proxyUrl 为 oner-server 代理下载

## 2.0.9
- 修复 file download 不可用

## 2.0.8
- 对插件暴露 server 对象，可以自定义启动 socket 服务

## 2.0.7
- 修复单页会多加载 common.css

## 2.0.6
- 增加对局域网内其他机器访问本机服务的支持

## 2.0.5
- 修复 post 请求时会向 qs 对象里塞数据

## 2.0.4
- 提示lowversion页面再低版本ie上不兼容问题

## 2.0.3
- 添加lowversion模板页面

## 2.0.2
- 增加 server.showFunCode 选项，可以把用户的功能点列表注入到页面中 window.__onerConfig.functionCodes

## 2.0.1
- 调整 common.js main.js main.css 加载顺序
- checkLogin oner-server 层过滤无效请求
- 增加配置中心，使用方式见 ide 中 /server/keeper.js


## 2.0.0-alpha71
- 支持私有化 cdn host
- 新增配置项 server.cdnHost , eg: cdnHost:'//cdn.powecn.com/'

## 2.0.0-alpha70
- fix上一个版本，默认定位到register路由的问题

## 2.0.0-alpha69
- 支持account项目登录页隐藏注册和忘记密码的同时，拦掉路由直接访问注册页和忘记密码页

## 2.0.0-alpha68
- 私有化接入登录，添加favicon配置项

## 2.0.0-alpha67
- 修复上一个版本（2.0.0-alpha66）功能

## 2.0.0-alpha66
- 支持根据环境配置登录页的注册和忘记密码链接是否显示

## 2.0.0-alpha65
- 支持pageFunctionCode不配置时，不判断页面权限，只要有账号都可以进

## 2.0.0-alpha64
- 修复account之外的项目调用户中心接口不checkLogin的问题
- 私有化接入，提供额外的调用户中心接口的router
- 破坏性升级，9月28之后进行私有化部署的必须接入64版本及以上的oner-server

## 2.0.0-alpha63
- 多后端使用方式变更，使用方式详见 readme

## 2.0.0-alpha62
- 文件系统使用对接网关的接口，现在是 2017-09-22，文件系统还没有部署线上，请知晓。
- 支持带有文件名及文件类型形式的文件上传

## 2.0.0-alpha61
- 修复调试 oner-servere 路径错误

## 2.0.0-alpha60
- 登录私有化接入定制title

## 2.0.0-alpha59
- 托管改造初尝试

## 2.0.0-alpha58
- 上一版本改错了，尴尬，恢复

## 2.0.0-alpha57
- 修复执行logout后跳回用户中心的url，

## 2.0.0-alpha56
- 给注入到页面的__userConfig 添加tenantId

## 2.0.0-alpha55
- 测试版，勿用

## 2.0.0-alpha54
- 测试版，勿用

## 2.0.0-alpha53
- 多页应用添加 common.css

## 2.0.0-alpha52
- 去除一个console，跟 51 没啥区别

## 2.0.0-alpha51
- 支持配置多个后端 apiPrefix

## 2.0.0-alpha50
- mpa 初尝试

## 2.0.0-alpha49
- 增加logout功能
- 修改checkLogin接口uri 从check/login => check/login/secure

## 2.0.0-alpha48
- 47 有毛病，用这个吧

##2.0.0-alpha47
- 简单修复了老的用户中心跳转传参逻辑

## 2.0.0-alpha46
- 修复了登出之后再登录没有 redirect

## 2.0.0-alpha45
- 老的用户中心支持自定义 ico
- client.login.ico = 'xxxxxx.ico'

## 2.0.0-alpha44
- 修复了不个性化定制会报错
- 新的用户中心提供了简单的登出，更好使的以后慢慢做

## 2.0.0-alpha43
- 老的用户中心页面引入了 es6-shim

## 2.0.0-alpha42
- 39-41 都是错的，用这个吧

## 2.0.0-alpha41
- 修复 40 没有注入三大参数

## 2.0.0-alpha40
- 39测试没通过，修复39的bug

## 2.0.0-alpha39
- 提供了下载中转功能，在真正的 api 前追加 /file/

## 2.0.0-alpha38
- 两个端口号设置都集成到了 project.config.js 里，更直观

## 2.0.0-alpha37
- node 端添加对 nopermission 的支持

## 2.0.0-alpha36
- 登录超时逻辑重新梳理

## 2.0.0-alpha35
- 支持用户自定义 api header
    server:{
        apiHeader:{
            k:v
        }
    }

## 2.0.0-alpha34
- 修复不启用鉴权模块儿时，仍然会鉴权

## 2.0.0-alpha33
- 修复 injectData 会把 undefined 也给注入进去


## 2.0.0-alpha32
- 修复读取 markdown 的 filepath

## 2.0.0-alpha31
- 修复线上环境也会在静态资源后加时间戳
- 规范整个项目，符合 eslint 规范

## 2.0.0-alpha30
- 修复，登录超时后跳转登录页链接不对
- 可能有问题，有问题再说

## 2.0.0-alpha29
- 修复 因28的到来而影响到 26 用户中心页面注入个性化变量的功能

## 2.0.0-alpha28
- 修复 27 bug

## 2.0.0-alpha27
- 支持自定义数据渲染到页面
- 使用姿势：
    - 在 plugins 里自己写路由，最后写上  ctx.njkData = {xxx:xxx} 就好
    - index.njk 里加上 <script>{{njkData | safe}}</script>

- 这个分支有bug，用28吧

## 2.0.0-alpha26
- 支持用户中心私有化部署
- 凡是使用私有化部署用户中心的，千万不要污染这几个路由

```
    '/login',
    '/register',
    '/find-password/*',
    '/personal-center/*'
```

- 在 project.config.js 的 server 中加这么一段

```
    server:{
        authorize:{
            // private 私有化部署 public 非私有化部署
            useUserCenter:'private',

            // 是否禁用鉴权
            disabled:false,

            // 登录页地址，一定不能省! 完整的 host (域名+端口号)
            loginUrlPrefix: new ServerEnvConfig({
                development: 'http://account-v2.dtwave.com:9012',
                test: 'http://account-v2.dtwave.com:9012',
                production: 'https://account.dtwave-inc.com',
            }),

            // 登录页个性化定制
            loginConfig:{
                // 登录成功后的默认跳转
                "redirect": '/',

                // logo 图片地址
                "logoUrl":"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1502775238363&di=dac3440526cf5a32e94741ce732adffb&imgtype=0&src=http%3A%2F%2Flogok.org%2Fwp-content%2Fuploads%2F2014%2F03%2FNike-logo-orange.png",

                // body 背景图片地址
                "bodyBgiUrl":"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1502775147152&di=75434046baf1da0c196db56a5595a7ca&imgtype=0&src=http%3A%2F%2Fimg1.ph.126.net%2FB1huUdGLTt0O9Mj-_8C7oQ%3D%3D%2F6619180945491909682.jpg",

                // copyright
                "copyRight":"思恩是个大美女@前半句是假话",

                // 登录框位置 right center left
                "loginAlign":"right",

                // 是否使用注册功能
                "showRegister":false,

                // 是否使用忘记密码功能
                "showForgetPass":false
            }
        }
    }
```
