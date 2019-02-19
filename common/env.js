const nattyStorage = require('natty-storage')
const path = require('path')
// `client`端开发环境
const CLIENT_ENV = process.env.CLIENT_ENV === 'development' ? 'development' : 'production'


// 配置`ONER_SERVER_DEBUG=任意值`时，说明是在本地开发`oner-server`
const ONER_SERVER_ENV = process.env.ONER_SERVER_ENV || 'production'
const TYPE = process.env.TYPE
const DEBUG = process.env.DEBUG
// 获取项目本地配置
// 只要不是`client`端开发环境，就都是部署环境：测试，预发，生产
// TODO
const CLIENT_DIR = ONER_SERVER_ENV === 'development' ? process.cwd() : path.join(__dirname, '../../../..')
const packagePath = `${CLIENT_DIR}/package.json`

// 项目的`package.json`文件
const pkg = require(packagePath)

// `server`端开发环境，如果`NODE_ENV`没指定，则从项目配置中取，如果项目配置中也未配置，则认为是生产环境并警告
const SERVER_ENV = process.env.NODE_ENV || pkg.nodeEnv

// 配置文件 路径
const CONFIG_PATH = process.env.CONFIG_PATH || '/opt/conf/front/config.json'

// `server`端环境启动时参数不健全
// if (!SERVER_ENV) {
//   SERVER_ENV = 'production'
//   console.warn('"process.env.NODE_ENV" was not found.')
//   console.warn('"nodeEnv" was not found in package.json.')
// }


module.exports = {
  // 非常重要，供项目的`project.config.js`使用，保证项目和`oner-server`使用用一份`nattyStorage`，`env`才能正常工作
  nattyStorage,
  CLIENT_ENV,
  SERVER_ENV,
  CLIENT_DIR,
  TYPE,
  DEBUG,
  CONFIG_PATH,
  // `ONER_SERVER_DEBUG`的值说明
  //    true: 本地调试`oner-server`的状态，当前项目目录和`oner-server`目录是并列存放的，
  //          所以使用`../`来保证项目的`project.config.js`文件和`oner-server`的内部
  //          文件引用的是同一份`env-config.js`文件
  //   false: 非调试状态，直接引用`node_modules`中的`oner-server`模块即可
  ONER_SERVER_ENV,
}
