const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const parse = require('url-parse')

// const util = require('./util')
const env = require('./env')
const util = require('./util')
// const envConfig = require('./env-config')

const nattyStorage = env.nattyStorage
const CLIENT_ENV = env.CLIENT_ENV
const SERVER_ENV = env.SERVER_ENV
const CLIENT_DIR = env.CLIENT_DIR
const DEBUG = env.DEBUG
const TYPE = env.TYPE
const CONFIG_PATH = env.CONFIG_PATH
// const ClientEnvConfig = envConfig.ClientEnvConfig
// const ServerEnvConfig = envConfig.ServerEnvConfig
// const isEnvConfig = envConfig.isEnvConfig

// 检查执行目录下是否有项目的私有配置，通常情况下是必须有的，没有哪个项目是不需要配置的
const projectConfigPath = `${CLIENT_DIR}/project.config`
if (!fs.existsSync(`${projectConfigPath}.js`)) {
  console.error(`Error: Project config file was not found from "${projectConfigPath}.js".`)
  process.exit(1)
}

// 读取项目私有配置
const projectConfig = require(projectConfigPath)

let configJson
try {
  configJson = require(CONFIG_PATH)
} catch (e) {
  if (SERVER_ENV === 'default') {
    console.error('config.json 读取失败')
    process.exit()
  }
  // console.error('/opt/conf/front/config.json  配置文件不存在')
}

// 初始化配置对象，所有的配置都存到这里
// 添加任何配置，可以同时包含`dev`和`pro`两个值，也可以只有一个不区分环境的值。
const config = nattyStorage({
  type: 'variable',
  key: 'config',
})

// 初始化配置
config.set('client', projectConfig.client)
config.set('server', projectConfig.server)
config.set('configJson', configJson)

// 追加配置
config.set('client.isDevelopment', CLIENT_ENV === 'development')
config.set('client.isProduction', CLIENT_ENV === 'production')
config.set('client.env', CLIENT_ENV)
config.set('client.dir', CLIENT_DIR)

// `server`端配置
config.set('server.env', SERVER_ENV)
config.set('server.debug', DEBUG)
config.set('server.type', TYPE)
config.set('server.ip', util.getIPAdress())


// url 前缀
let pathPrefix = config.get('server.pathPrefix')
if (pathPrefix) {
  // 不是 / 开头就开头加个 /
  if (pathPrefix.indexOf('/') !== 0) {
    pathPrefix = `/${pathPrefix}`
  }

  // 是 / 结尾就删除结尾的 /
  if (pathPrefix.endsWith('/')) {
    pathPrefix = pathPrefix.substring(0, pathPrefix.length - 1)
  }
  config.set('server.pathPrefix', pathPrefix)
} else {
  config.set('server.pathPrefix', '')
}

// 静态资源前缀,  server.pathPrefix + client.staticPrefix
if (config.get('client.staticPrefix')) {
  config.set('client.staticPrefix', `${config.get('server.pathPrefix')}/${config.get('client.staticPrefix').replace(/\./g, '').replace(/\//g, '')}`)
} else {
  config.set('client.staticPrefix', `${config.get('server.pathPrefix')}/static`)
}

// 配置中心相关设置
config.set('keeper', {
  url: nattyStorage.env(SERVER_ENV, {
    development: 'http://keeper.test.dtwave-inc.com/test',
    test: 'http://keeper.test.dtwave-inc.com/test',
    production: 'http://keeper-socket.dtwave-inc.com/production',
  }),
})

// 如果没有设置 logRoot ，就走默认的
if (!config.get('server.logRoot')) {
  // 日志文件打印目录
  config.set('logRoot', nattyStorage.env(SERVER_ENV, {
    development: path.join(__dirname, '../logs'),
    test: '/data/merak-server/logs/apps',
    production: '/data/merak-server/logs/apps',
  }))
} else {
  config.set('logRoot', config.get('server.logRoot'))
}


const authorizeUrl = parse(config.get('server.authorize.apiPrefix'))
// oner-server 内置的用户中心接口默认使用 v1
if (authorizeUrl.pathname === '') {
  config.set('server.authorize.pathname', '/api/v1/uic')
  // 如果用户有设置，就用用户设置的
} else {
  config.set('server.authorize.pathname', authorizeUrl.pathname)
  config.set('server.authorize.apiPrefix', authorizeUrl.origin)
}

// 通用页面版本号
config.set('commonPage.version', '1.1.1')

const g = (pathA, fallbackValue) => config.get(pathA, fallbackValue)


// 4.0  的登录页要改 sessionId 的名字
if (!config.get('server.authorize.sessionIdName')) {
  config.set('server.authorize.sessionIdName', 'sessionId')
}


_.assignIn(g, config)

module.exports = g

// 注意: `config.dump()`是异步输出
// console.log('All Server Config: ')
// config.dump()

// console.log(`~~~ config test: apiPrefix by SERVER_ENV(${SERVER_ENV}):`, g('server.apiPrefix'))
