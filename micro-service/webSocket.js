const socket = require('socket.io')
const _ = require('lodash')

const sockets = {}
module.exports = app => {
  const router = app.router
  const config = app.config

  if (!config('server.useWS')) {
    return
  }
  const io = socket(app.server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
  })

  io.on('connection', client => {
    const { uuid } = client.handshake.query
    // 如果对象不存在就创建
    if (!sockets[uuid]) {
      sockets[uuid] = {
        client,
        status: 'keep',
        timer: null,
      }
    // 存在就更新
    } else {
      clearTimeout(sockets[uuid].timer)
      sockets[uuid].status = 'keep'
      sockets[uuid].client = client
    }
    
    // 失去连接
    client.on('disconnect', () => {
      // 修改各种状态
      sockets[uuid] = {
        client,
        status: 'break',
        timer: setTimeout(() => {
          delete sockets[uuid]
        }, 1000 * 60 * 60),
      }
    })
  })


  router.all('/sendMsg', ctx => {
    const query = _.assign(ctx.request.body, ctx.request.query)
    // 如果根据实例 id 查不到，说明被销毁了（页面关闭时长超过阈值）
    if (!sockets[query.socketId]) {
      ctx.body = {
        success: false,
        message: '客户端已被销毁',
      }  
      return

    // 如果实例状态是 break 说明被暂时销毁了（页面关闭时长没超过阈值）
    } else if (sockets[query.socketId].status === 'break') {
      ctx.body = {
        success: false,
        message: '客户端已关闭',
      }  
      return
    }

    // everything ok 就发消息
    sockets[query.socketId].client.emit(query.action, query.msg)
    
    ctx.body = {
      success: true,
      content: {
        msg: 'success',
      },
    }
  })
}
