# 项目 project.config.js 配置项说明
### 配置项一览
------
## [client](#client-端配置项详解)

* [*name](#name)
	* String
	* 项目名

* [*version](#version)
	* String
	* 版本号

* [*port](#port-for-client)
	* Number
	* 开发环境，资源服务端口号
	* develop only

* [*spa](#spa)
	* Boolean
	* 是否单页应用

* [*page](#page)
	* Object
	* 页面个性化定制

## [server](#server-端配置项详解)
* [*port](#port-for-server)
	* Number
	* node 服务端口号
	* develop only

* [withoutVaild](#withoutVaild)
	* Boolean
	* 是否禁用前端验证

* [router](#router)
	* Object
	* 自定义路由
	* mpa only

* [privateCdn](#privateCdn)
	* Boolean
	* 是否为私有化部署

* [*refererWhiteList](#refererwhitelist)
	* Array<String>
	* 请求白名单

* [*apiPrefix](#apiprefix)
	* String or Obejct
	* 后端服务前缀

* [apiHeader](#apiheader)
	* Object
	* 自定义请求 header

* [autoInjectApiData](#autoinjectapidata)
	* Array<String>
	* 请求注入通用参数

* [plugins](#plugins)
	* Array<Function>
	* 自定义插件

* [*authorize](#authorize)
	* Object
	* 鉴权相关

* [showFunCode](#showfuncode)
	* Boolean
	* 是否页面注入用户功能点

* [fs](#fs)
	* Object
	* 文件服务相关

* [rootPath](#rootpath)
	* String
	* markdown根目录

* [keeper](#keeper)
	* Obejct
	* 配置中心

* [useWS](#useWS)
	* Boolean
	* 是否使用 websocket 服务

* [staticpath](#staticpath)
	* String
	* 私有化部署的时候，静态资源的请求前缀，一般不用配，适用于路由冲突


-----
### client 端配置项详解
-----
## *name
* String
* default : pkg.name
* 项目名称
* 影响cdn地址，需要与cdn路径匹配

## *version
* String
* default : pkg.version
* 项目版本号
* 影响cdn地址，需要与cdn项目路径下文件夹名称匹配

## *port (for client)
* Number
* default : 3000
* 开发环境静态资源服务运行端口号
* 尽在影响开发环境，生产环境静态资源托管在 cdn 上

## spa
* Boolean
* default : true
* 是否是单页面项目，还可能是多页应用(mpa)哦

## *page
* 单页应用(spa)
* Object
* 页面配置信息
* title
	* String
	* default : pkg.name
	* 页面标题
* css
	* Array<String>
	* default : []
	* 额外的样式文件
* js
	* Array<String>
	* default : []
	* 额外的脚本文件
* *njkPath
	* String
	* default : path.join(__dirname, 'template.njk')
	* html 模板文件路径
	* 不建议直接更改模板结构，不利于统一管理
* eg:

	```js
	{
		title: pkg.name,
		css: [],
		js: [],
		njkPath: path.join(__dirname, 'template.njk')
	}
	```

* 多页应用(mpa)
	* 大体同上
	* 多了单独页面配置
	* xxx (对应 xxx 页面)
		- title
		- xxx 页面的 title
		- css
		- xxx 页面的 css
		- js
		- xxx 页面的 js
	* eg:

	```js
	{
		// 通用配置
		title: pkg.name,
		css: [],
		js: [],

		// 针对 src/page-user 页面的单独配置
		user:{
			title: '用户信息',
			css:[
			'xxxx.xxx.xxx/xxx.css'
			],
			js:{
			'xxxx.xxx.xxx/xxx.js'
			}
		}
		// 针对 src/page-xxx 页面的单独配置
		xxx:{
			...
		}

		...

		njkPath: path.join(__dirname, 'template.njk')
	}
	```

------
### server 端配置项详解
-----
## *port (for server)
* Number
* default : 9999
* node 端口号
* 仅在开发环境使用，生产环境监听的是 .sock 文件


## *withoutVaild
* Boolean
* default : false
* 禁用前端验证开关，默认开启
* 启用后将不再对是否是 ajax 请求、请求的 refer 合法性做校验


## keeper
* Object
* default: {}
* 设置keeper模块是否启用，以及订阅和拉取的配置项

```js
{
	switch: true, // 开启，
	// subscribes: [], // 选择要监测更新的配置文件对应项，暂未开放，只支持与 pkg.name 同名的订阅
}
```

## router
* Object
* default : {}
* 多页应用(mpa)才用的到
* 页面 url 对应的是 page-页面名，比如：xxxxx/hello.html 对应 page-hello
* 如果我想把 page-hello 设置成首页咋整？

```js
{
	hello:'/'
}
```
## cdnHost
* String
* default : null
* 私有化部署的 cdn 前缀
* eg : '//cdn.powecn.com/'
* 想了解更多关于私有化部署请看[这里](http://git.dtwave-inc.com/cadillac/oner/blob/master/blog/%E5%89%8D%E7%AB%AF%E7%A7%81%E6%9C%89%E5%8C%96%E9%83%A8%E7%BD%B2.md)

## *refererWhiteList
* Array<String>
* default : []
* 请求白名单，只允许指定域下的请求，白名单外的请求均视为非法请求
* 发生产不要忘记配这个，很容易遗漏！！！

## *apiPrefix
* String or Array<String>
* node层代理api的域名(后端给)
* 具体使用看例子吧，eg:

```js
// 如果只有一个
apiPrefix:'http://192.168.1.110'

// 如果不止一个
apiPrefix:{
	// 对应oo的请求前缀这么写，/oo/v1/xxxx
	oo: nattyStorage.env(SERVER_ENV, {
		// 122的外网地址
		development: 'http://121.40.129.99:9021',
		// 122的内外地址
		test: 'http://10.168.10.113:9021',
		// TODO
		production: '',
	}),

	ll:nattyStorage.env(SERVER_ENV, {
	// 122的外网地址
	development: 'http://121.40.129.99:9021',
	// 122的内外地址
	test: 'http://10.168.10.113:9021',
	// TODO
	production: '',
	})

	// 如果有多个的话，务必每个接口请求  /api/v1/**** 中的 api 替换为对应的 key ，否则 node 端不知道这个请求该发给谁！！！
	// 如果有多个的话，务必每个接口请求  /api/v1/**** 中的 api 替换为对应的 key ，否则 node 端不知道这个请求该发给谁！！！
	// 如果有多个的话，务必每个接口请求  /api/v1/**** 中的 api 替换为对应的 key ，否则 node 端不知道这个请求该发给谁！！！

}
```
## apiHeader
* Object
* default : {}
* 向每一个请求的 header 里注入变量,eg：

```js
{
  k:v
}
```
## *autoInjectApiData
* Array<String>
* default : *
* node层api自动注入的参数，其实不是必填的，但大多数项目后端都需要
* 支持注入 userId(from cookie), tenantId(from cookie), productionId(from project.config.js)

## plugins
* Array[Function]
* default : []
* 项目自定义插件
* 一两句说不清楚，移步 /server/index.js 去看注释掉的代码吧，那是 demo

## authorize
* Object
* 鉴权模块配置，比较多，简单介绍了
* productId
	* String
	* 晓涛分配
	* [autoInjectApiData](#server.autoInjectApiData) 这里用的
* pageFunctionCode
	* String
	* 功能码，用于页面权限判断
	* 晓涛分配
* disabled
	* Boolean
	* 是否禁用用户中心相关的一切功能，登录、注册、鉴权...
* sessionIdName
	* String
	* 给 sessionId 重命名，4.0 的 sessionId 和 3.0 的冲突了, 4.0 的可以通过此配置项区别 3.0 的 sessionId
* useUserCenter
	* String
	* private：用私有化的用户中心的登录页
	* public：用通用的用户中心
* apiPrefix
	* String
	* 用户中心node层代理api域名,可以跟pathname，pathname 会替换掉 oner-server 内置的用户中心接口中的 /api/v1/uic
	* 计划取消掉
* apiHeader
	* 用户自定义header头
	* 这是啥？没有吧@思恩？
* loginUrlPrefix
	* String
	* 用户中心项目域名，使用用户中心的时候开启
* loginConfig
	* Object
	* 登录页个性化定制化配置项
		* redirect: '/'
		* String
		* 用于兼容登录成功后没有redirect参数的跳转操作
		* logoUrl
		* String
		* logo地址
		* bodyBgiUrl
		* String
		* 背景图地址
		* copyRight
		* String
		* 版权文案
		* loginAlign
		* String
		* 登录框位置：left center right
		* showRegister
		* Boolean
		* 是否使用注册功能
		* showForgetPass
		* Boolean
		* 是否使用忘记密码功能

## fs
* Object
* 文件模块配置
* apiPrefix
	* String
	* 文件上传模块node层代理api域名
	* 计划取消掉
* saveWithName
	* Boolean
	* 是否保存文件名及类型，设为true后，同名文件会被覆盖。否则就是保存成无类型的随机id文件

## rootPath
* String
* 我也不知道有啥用，@才龙
* 读取markdown文件显示到页面上功能会用到

## useWS
* Boolean
* 是否使用 webSocket 服务
* 配合 [@dtwave/oner-socket](http://git.dtwave-inc.com/cadillac/oner-socket/blob/master/README.md) 一起使用



-----
### 其他
-----
* 怎么区分环境？
  * 得益于 nattyStorage 小插件的便利

```js
  name: nattyStorage.env(SERVER_ENV, {
    development: '王开发',
    test: '王测试',
    production: '王线上',
  })
```

* 如何自定义免登?
	* 以自定义插件形式提供

```js
 // index.js

 module.exports = [function (app) {
  // const config = app.config
	// const router = app.router

	// 给 app 一个 freeAuthorize 字段，返回一个 promise
	app.freeAuthorize = ctx => new Promise((resolve, reject) => {
			// 拿到 url ，其实是 path ，
			const {url} = ctx

			// eg: /api/v1/xxxxx
			console.log(url)

			// 写规则，如果鉴权
			if (鉴权) {
				resolve(false)

			// 如果不鉴权
			} else {
				resolve(true)
			}
		})
	}]
```