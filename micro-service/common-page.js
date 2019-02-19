const path = require('path')
const rp = require('request-promise')
const log = require('../common/log')
const util = require('../common/util')


module.exports = app => {
  const router = app.router
  const config = app.config

  router.all(util.handleRouterPre([
    '/nopermission',
    '/404',
    '/tenantchoose',
  ], config), async ctx => {
    log.info('~~~~~~ commonPage ~~~~~~')
    log.info(`commonPage url: ${ctx.request.url}`)
    // 通用页面项目的版本号

    // 跳去登录的地址
    let loginUrl = `${config('server.pathPrefix')}/login`

    // 私有化4.0平台，无权限往管理控制台跳
    if (config('configJson.apps.ent.pathPrefix')) {
      loginUrl = `${ctx.origin}${config('configJson.apps.ent.pathPrefix')}`
    }

    const sessionIdName = config.get('server.authorize.sessionIdName')
    // 注入便量
    let onerConfig = {
      loginUrl,
      productId: config('server.authorize.productId'),
      pageFunctionCode: config('server.authorize.pageFunctionCode') || '',
      sessionId: ctx.cookies.get(sessionIdName),
    }

    if (config('server.authorize.loginConfig')) {
      onerConfig = Object.assign(onerConfig, config('server.authorize.loginConfig'))
    }

    // 用户自定义是否鉴权
    if (app.freeAuthorize) {
      // 请求鉴权结果
      ctx.freeAuthorize = await app.freeAuthorize(ctx)
    }

    // ‘不免鉴权’ 或者 ‘不用户自定义免鉴权’ 就去获取 userId
    if (!config('server.authorize.disabled') || ctx.freeAuthorize === false) {
      const options = {
        method: 'GET',
        uri: `${config.sure('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/check/login/product/${config('server.authorize.productId')}`,
        json: true,
        qs: {
          sessionId: ctx.cookies.get(sessionIdName),
        },
      }
      const response = await rp(options)

      onerConfig.userId = response.content.userId
    }

    // 这里把 common.js 这种的 过滤掉
    let pageConfig = {
      icon: config('client.page.icon'),
      js: config('client.page.js').filter(d => d.replace(/\//g, '') !== 'common.js').concat(config('client.page.commonPage.js')),
      css: config('client.page.commonPage.css'),
    }

    pageConfig = util.handlePrefix(pageConfig, ctx, config)
    onerConfig = `var __onerConfig = window.__onerConfig || ${JSON.stringify(onerConfig)}`
    await ctx.render(config('client.page.njkPath'), {
      config,
      ctx,
      onerConfig,
      pageConfig,
    })
  })


  // 浏览器版本判断,低版本的要跳转了
  router.all(util.handleRouterPre('*', config), async (ctx, next) => {
    const minIE = config('server.minIE')
    if (minIE) {
      const userAgent = (ctx.req && ctx.req.headers['user-agent']) || ''
      log.info('~~~~~~ /lowversion ~~~~~~')

      const isOpera = userAgent.indexOf('Opera') > -1 // 判断是否Opera浏览器
      const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera // 判断是否IE浏览器
      if (isIE) {
        const reIE = new RegExp('MSIE (\\d+\\.\\d+);')
        reIE.test(userAgent)
        const fIEVersion = parseFloat(RegExp.$1)
        if (fIEVersion < minIE) {
          await ctx.render(path.join(__dirname, '../html', 'lowversion.njk'))
          return
        }
      }
    }

    await next()
  })
}

