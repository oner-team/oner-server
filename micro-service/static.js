// const rp = require('request-promise')
// const util = require('../util')
// const _ = require('lodash')
const fs = require('fs')
const koaStatic = require('./static-serve')
const path = require('path')
const log = require('../common/log')

module.exports = async app => {
  const router = app.router
  const config = app.config

  // 用来修复 main.js 里 chunk前缀
  app.use(async (ctx, next) => {
    // 如果不是 js 静态资源请求，直接跳过
    if (ctx.url.indexOf('.js') === -1) {
      await next()
      return
    }


    const replace = name => {
      if (ctx.url.endsWith(`/${name}.js`)) {
        const url = ctx.url.replace(config('client.staticPrefix'), '')
        const content = fs.readFileSync(path.join(config('client.dir'), 'static-cache', url))
        ctx.body = content.toString().replace('p="//cdn.dtwave.com', `p="//${ctx.host}${config('client.staticPrefix')}`)
        return true
      }
    }

    const arr = ['common', 'main'].concat(process.srcDirs.map(s => s.replace('page-', '')))
    let rs = false
    arr.forEach(n => {
      // 如果匹配上了
      if (replace(n)) {
        rs = true 
      }
    })

    if (!rs) {
      await next()
    }
  })

  app.use(koaStatic({
    rootDir: path.join(config('client.dir'), 'static-cache'),
    rootPath: config('client.staticPrefix'),
    maxage: 1000 * 60 * 60 * 24 * 3,
    notFoundText: config('server.tip.404') || 'file not found',
  }))
}
