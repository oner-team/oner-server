const env = require('./env')
const util = require('./util')

const CLIENT_ENV = env.CLIENT_ENV
const SERVER_ENV = env.SERVER_ENV
const randomString = util.randomString

const mapKey = `_${randomString(6)}`
const envKey = `_${randomString(6)}:env`

console.log(`>>> env config mapKey: ${mapKey} <<<`)

// 父类
class EnvConfig {
  constructor(c = {}, path = '') {
    this[mapKey] = c
    console.log('+++ EnvConfig', path)
  }

  get(defaultValue) {
    return this[mapKey][this[envKey]] !== undefined ? this[mapKey][this[envKey]] : defaultValue
  }
}

const isEnvConfig = any => any instanceof EnvConfig

// `client`端环境参数类
class ClientEnvConfig extends EnvConfig {
  constructor(c = {}, path) {
    super(c, path)
    this[envKey] = CLIENT_ENV
  }
}

// `server`端环境参数类
class ServerEnvConfig extends EnvConfig {
  constructor(c = {}, path) {
    super(c, path)
    this[envKey] = SERVER_ENV
  }
}

module.exports = {
  ClientEnvConfig,
  ServerEnvConfig,
  isEnvConfig,
}
