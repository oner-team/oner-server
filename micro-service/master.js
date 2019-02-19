// const rp = require('request-promise')
// const _ = require('lodash')
const session = require('koa-session2')
const bodyParser = require('koa-bodyparser')
const fs = require('fs')
const nunjucks = require('nunjucks')
const minify = require('html-minifier').minify
const chalk = require('chalk')
const keeper = require('./keeper')
const util = require('../common/util')
const log = require('../common/log')


exports.applyBefore = async (app, router, config, server) => {
  app.router = router
  app.config = config
  app.server = server

  app.use(bodyParser())

  // 参考 https://github.com/Secbone/koa-session2
  // default "koa:sess"
  app.use(session({
    key: 'SESSIONID',
  }))

  // 去项目src下有哪些文件夹，分析出有哪些页面，保存到 process 上
  util.getAllPageUnderSrc(config).then(rs => {
    const isSPA = config('client.spa')
    const pageConfig = config('client.page')
    const serverPort = config('server.port')
    const serverRouter = config('server.router') || {}
    let pageList = []

    if (!isSPA) {
      // 多页项目的处理
      pageList = rs.map(page => {
        const pageName = page.replace('page-', '')
        const pageInfo = pageConfig[pageName] || {}
        const pageRoute = serverRouter[pageName] || `/${pageName}`

        return {
          page,
          title: pageInfo.title,
          route: `http://127.0.0.1:${serverPort}${pageRoute}`,
        }
      })
    }

    if (isSPA) {
      log.info(`src文件夹下解析出以下页面: \n\t\t${rs.join('\n\t\t')}`)
    } else {
      log.info('src文件夹下解析出以下页面: \n')
      pageList.forEach(item => {
        console.log(`\t\t${item.page}\t${item.title}\t${chalk.cyan(item.route)}`)
      })
    }

    process.srcDirs = rs
  })

  // 初始化 keeper
  keeper.init(app)

  // 给 ctx 对象绑定数据，供私有中间件使用
  app.use(async (ctx, next) => {
    ctx.router = router
    ctx.config = config

    // TODO 添加缓存 否则同一个页面会读取多次
    ctx.render = (url, data) => new Promise(resolve => {
      try {
        // console.log('read njk template')
        const rawString = fs.readFileSync(url, 'utf8')
        const html = nunjucks.renderString(rawString, data)
        resolve(minify(html, {
          removeEmptyAttributes: true,
          collapseWhitespace: true,
        }))
      } catch (e) {
        resolve(e.message)
      }
    }).then(html => {
      const disableIframe = config('server.disableIframe')
      if (disableIframe) {
        ctx.set('X-Frame-Options', 'DENY')
      }

      ctx.type = 'html'
      ctx.body = html
    })
    await next()
  })


  // 不响应favicon请求
  app.use(async (ctx, next) => {
    if (ctx.url === '/favicon.ico') {
      ctx.res.writeHead(200, { 'Content-Type': 'image/x-icon' })
      ctx.res.end()
    } else {
      await next()
    }
  })

  app.use(async (ctx, next) => {
    if (config('server.pathPrefix') && ctx.url.replace('/', '') === '') {
      ctx.redirect(`${config('server.pathPrefix')}/`)
      return
    }
    await next()
  })
}


exports.applyBehind = async app => {
  const router = app.router
  // 整合路由配置
  app.use(router.routes()).use(router.allowedMethods())

  // 合并临时文件夹
  await new Promise((async resolve => {
    try {
      await util.shell('rm -rf static-cache')
      await util.shell('mkdir static-cache')
    } catch (error) { }

    // 先把项目自身资源扔进去
    try {
      await util.shell('cp -r dist-private/* static-cache/')
    } catch (error) { }

    // 再把第三方资源扔进去
    try {
      await util.shell('cp -r resource/* static-cache/')
    } catch (error) { }

    // 最后把自定义资源扔进去
    try {
      await util.shell('cp -r resource-coustom/* static-cache/')
    } catch (error) { }

    resolve()
  }))
}
