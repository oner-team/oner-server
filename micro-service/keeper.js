// const rp = require('request-promise')
// const _ = require('lodash')
const fs = require('fs')
const io = require('socket.io-client')
const _ = require('lodash')
const log = require('../common/log')

// 读取数据，render.js 模块里 渲染页面需要
exports.getData = app => {
  const pro = new Promise(resolve => {
    const config = app.config
    // 项目配置数据
    let keeper
    let keeperJS
    try {
      // 路径是下面这个
      const fsPath = `${config('client.dir')}/server/keeper.json`
      keeper = fs.readFileSync(fsPath)
      keeper = JSON.parse(keeper)
    } catch (error) {
      keeper = {}
    }

    try {
      /* eslint-disable global-require */ 
      keeperJS = require(`${config('client.dir')}/server/keeper.js`)(config('server.env'))
    } catch (error) {
      keeperJS = {}
    }
    resolve(_.assign(keeperJS, keeper))
  })

  return pro
}


/**
 * 数据保存到文件
 * @param {*} filePath 保存文件路径
 * @param {*} data 保存文件内容
 */
const writeFile = (filePath, data) => {
  const pro = new Promise(async (reslove, reject) => {
    // 异步固然好，但高并发就SB了，老老实实同步吧，很简单的 io 操作，基本上瞬间完成的
    const err = fs.writeFileSync(filePath, data)
    if (err) {
      reject(err)
      log.error(`文件写入失败: ${err}`)
      return
    }
    reslove(`文件写入成功：${filePath}`)
    log.info(`文件写入成功: ${filePath}`)
  })
  return pro
}

/**
 * 这个会被主进程 master.applyBefore 中调用
 */
exports.init = app => {
  const config = app.config

  // 如果启用 keeper
  if (config('server.keeper.switch')) {
    const fsPath = `${config('client.dir')}/server/keeper.json`
      // 1. 初始化链接
    const keeperUrl = `${config('keeper.url')}?pkgname=${config('client.name')}`
    const socket = io(keeperUrl, {
      autoConnect: false,
    })

      // 2. 更新事件，配置中心有更新这面就跟着渲染
    socket.on('update', (data = {}) => {
      writeFile(fsPath, data.value)
      log.info('配置信息: ', data)
    })

    socket.on('connect', () => {
      log.info('~~~~~~ KEEPER CONNECT ~~~~~~')
      let subscribes = [config.get('client.name')]
      const otherSubscribes = config('server.keeper.subscribes')
      if (otherSubscribes) {
        subscribes = subscribes.concat(otherSubscribes)
      }
      log.info(`subscribes: ${subscribes}`)
      log.info(`project name: ${config('client.name')}`)
        // 3. 订阅信息，但首次不会拿配置信息
      subscribes.forEach(sub => {
        socket.emit('subscribe', {
          keyName: sub,
          pkgName: config('client.name'),
        })
        socket.emit('get', {
          keyName: sub,
          pkgName: config('client.name'),
        })
      })
    })

    // 5. 断开连接
    socket.on('disconnect', () => {
      log.info('~~~~~~ KEEPER DISCONNECT ~~~~~~')
    })

    socket.open()
  }
}
