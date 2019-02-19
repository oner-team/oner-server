const winston = require('winston')
const _ = require('lodash')
const DailyRotateFile = require('winston-daily-rotate-file')
const moment = require('moment')
const fs = require('fs')
const config = require('./config')
const path = require('path')
const env = require('./env')

// 日志文件打印的项目文件夹目录
const logPath = config.get('logRoot') || '/data/merak-server/logs/apps'

// console.log('项目日志打印目录：', logPath)

// 递归创建目录，同步方法
const mkdirsSync = dirname => {
  if (fs.existsSync(dirname)) {
    return true
  } 
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname)
    return true
  }
}

mkdirsSync(logPath)

// console.log('项目日志目录创建成功。。。。。。')

// log 配置信息
const logConfig = {
  json: false,
  label: process.pid,
  filename: `${logPath}/${config('client.name').replace(/\//g, '-')}`,
  datePattern: '.yyyy-MM-dd.log',
  timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
}

const transports = [
  // 开发环境debug级别以内的级别都打印，其他环境只打印info级别以内的
  new DailyRotateFile(_.assign(_.cloneDeep(logConfig), {
    name: 'project-out',
    level: `${env.SERVER_ENV === 'development' ? 'debug' : 'info'}`,
    filename: `${logConfig.filename}-out`,
  })),
  // 这个地方是想把错误日志独立出来，merak-server-out 里也会打出来
  new DailyRotateFile(_.assign(_.cloneDeep(logConfig), {
    name: 'project-error',
    level: 'error',
    filename: `${logConfig.filename}-error`,
  })),
]

// 如果是开发环境，就把日志 console.log 出来
if (env.SERVER_ENV === 'development') {
  transports.push(new (winston.transports.Console)())
}

const logger = new winston.Logger({ transports })

logger.cli()

module.exports = logger
