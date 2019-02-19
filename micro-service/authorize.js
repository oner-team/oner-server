const path = require('path')
const _ = require('lodash')
// const request = require('request')
const rp = require('request-promise')
const fs = require('fs')
const util = require('../common/util')
const log = require('../common/log')

module.exports = app => {
  const router = app.router
  const config = app.config

  // 用户中心私有化，登录页、注册页、忘记密码页，未登录不需要checkLogin
  router.get(util.handleRouterPre([
    '/login',
    '/register',
    '/register-private',
    '/find-password/*',
  ], config), async (ctx, next) => {
    const isAccountProject = config('server.isAccountProject')

    if (!isAccountProject) {
      const sessionIdName = config.get('server.authorize.sessionIdName')
      if (config('configJson.loginUri') && !ctx.request.query.code && ctx.url.indexOf('/login') !== -1) { // 是中信定制 并且直接进入/login路由
        ctx.cookies.set(sessionIdName, '') // 清掉我们的sessionId
        ctx.redirect(`${config('configJson.loginUri')}${ctx.origin}`)
        return
      } else if (config('configJson.oauth.logoutUri') && !ctx.request.query.code && ctx.url.indexOf('/login') !== -1) {
        ctx.cookies.set(sessionIdName, '') // 清掉我们的sessionId
        ctx.redirect(`${config('configJson.oauth.logoutUri')}${ctx.origin}`)
      }

      // 如果禁用注册，路由层禁用
      if (ctx.url.indexOf('/register') !== -1 && config('server.authorize.loginConfig.showRegister') === false) {
        ctx.redirect(`${config('server.pathPrefix')}/login`)
        return
      }

      // 如果禁用忘记密码，路由层禁用
      if (ctx.url.indexOf('/find-password') !== -1 && config('server.authorize.loginConfig.showForgetPass') === false) {
        ctx.redirect(`${config('server.pathPrefix')}/login`)
        return
      }

      // 如果私有化部署，就node端请求登录页，把登录页源码返回
      const query = config('server.authorize.loginConfig') || {}
      const productId = config('server.authorize.productId')
      const pageFunctionCode = config('server.authorize.pageFunctionCode') || ''
      let uri = config('server.authorize.loginUrlPrefix') + ctx.url
      // 用户中心的 pathPrefix 必须是 /account
      if (config('server.pathPrefix')) {
        // uri = `${config('server.authorize.loginUrlPrefix')}/account${ctx.url.replace(config('server.pathPrefix'), '')}`
        uri = `${config('server.authorize.loginUrlPrefix')}${ctx.url.replace(config('server.pathPrefix'), '/account')}`
      }
      const options = {
        uri,
        rejectUnauthorized: false,
        method: 'POST',
        json: true,
        body: Object.assign(query, {
          redirect: `${config('server.pathPrefix')}/`,
          productId,
          sessionIdName,
          pageFunctionCode,
          showTenantLogo: true,
          code: ctx.request.query.code || '',
        }),
      }
      const body = await rp(options)
      // 替换一下 pathPrefix  eg: /account => /ent
      ctx.body = body.replace('"pathPrefix":"/account"', `"pathPrefix":"${config('server.pathPrefix')}"`)
    } else {
      await next()
    }
  })

  // 埋cookie的接口
  router.all(util.handleRouterPre('/sso', config), async ctx => {
    log.info('~~~~~ /sso ~~~~~~')
    const sessionIdName = config.get('server.authorize.sessionIdName')
    // 可能会埋的 cookie 列表
    const needSetCookies = [sessionIdName, 'userId', 'tenantId', 'lastTenantId']

    _.forEach(needSetCookies, name => {
      if (ctx.query[name] || ctx.query[name] === 0) {
        ctx.cookies.set(name, ctx.query[name], {
          httpOnly: true,
        })
      }
    })

    const ssoImage = fs.readFileSync(path.join(__dirname, '../sso.png'))
    ctx.body = ssoImage
  })

  // 用户登出
  router.all(util.handleRouterPre('/logout', config), async ctx => {
    log.info('~~~~~ /logout ~~~~~')
    const sessionIdName = config.get('server.authorize.sessionIdName')
    const options = {
      uri: `${config('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/logout`,
      method: 'GET',
      qs: {
        sessionId: ctx.cookies.get(sessionIdName),
      },
      json: true,
    }
    await rp(options)
    ctx.cookies.set('userId', '')
    ctx.cookies.set(sessionIdName, '')
    ctx.cookies.set('tenantId', '')
    ctx.cookies.set('lastTenantId', '')

    let redirectUri = `${config('server.pathPrefix')}/login?redirect=/`
    if (config('configJson.loginUri')) {
      redirectUri = `${config('configJson.loginUri')}${ctx.origin}${config('server.pathPrefix')}`
    } else if (config('configJson.oauth.logoutUri')) {
      redirectUri = `${config('configJson.oauth.logoutUri')}${ctx.origin}${config('server.pathPrefix')}`
    }
    ctx.redirect(redirectUri)
  })

  // 私有化部署，转发来自account项目内的接口，跟account项目接口前缀一致
  // 只供私有化部署时用户中心项目使用，其他项目不走
  router.all(util.handleRouterPre('/user/center/*', config), async ctx => {
    log.info('~~~~~ /user/center/* ~~~~~')
    // 注入ip参数的接口
    const urlPre = ctx.req.url.split(`/user/center/${config('server.authorize.pathname').split('/api/')[1]}`)[1].split('?')[0]
    // 获取验证码的请求带上remoteAddress，都是post请求
    if (urlPre.indexOf('/verify/code') > -1 || urlPre.indexOf('/email/verify/code') > -1) {
      const clientIp = await util.getIp(ctx, log)

      ctx.request.body = _.assign({}, ctx.request.body, {
        remoteAddress: clientIp,
      })
    }

    const authorizeUrl = ctx.req.url.replace(config('server.pathPrefix'), '').replace(/^\/user\/center/, '/api')

    const options = {
      method: ctx.req.method,
      uri: `${config('server.authorize.apiPrefix')}${authorizeUrl}`,
      json: true,
      body: ctx.request.body,
      qs: ctx.request.query,
    }
    log.info('user center options: ', options)
    try {
      // ctx.body = await rp(options)
      const res = await rp(options)
      ctx.body = util.escapeResult(res)
    } catch (e) {
      log.error(`user center catch: ${config('server.authorize.apiPrefix')}${authorizeUrl}, ${e.message}`)
      ctx.body = util.handleError(e)
    }
  })

  // 对任何路由进行checkLogin，不通过跳到登录页
  router.all(util.handleRouterPre('*', config), async (ctx, next) => {
    // 中信定制
    if (ctx.request.query.code && ((config('configJson.oauth') && ctx.request.query.state) || ctx.request.query.state === 'oauth')) {
      ctx.redirect(`${config('server.pathPrefix')}/login?code=${ctx.request.query.code}&redirect=${ctx.path}`)
      return
    }

    // 用户自定义是否鉴权
    if (app.freeAuthorize) {
      // 请求鉴权结果
      ctx.freeAuthorize = await app.freeAuthorize(ctx)
    }
    // 私有化接入时，个人中心禁止二次鉴权
    const personalDisabled = ctx.request.body.personalDisabled
    if (personalDisabled) {
      ctx.global = ctx.request.body.global
    }
    // 登录未进入系统时、文件下载不鉴权
    const isLoginFs = ctx.url.indexOf('&fs_authorize=false') > -1
    // 如果禁用用户中心 or 是用户中心项目(但不是个人中心页面，以及个人中心接口) or 用户自定义不鉴权 就不鉴权
    const isAccount = config('server.isAccountProject') && ctx.path.indexOf('/personal-center') === -1 && ctx.path.indexOf('/personal/center') === -1
    if (config('server.authorize.disabled') || personalDisabled || isAccount || ctx.freeAuthorize || isLoginFs) {
      await next()
      return
    }
    try {
      const sessionIdName = config.get('server.authorize.sessionIdName')
      const options = {
        method: 'GET',
        uri: `${config.sure('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/check/login/product/${config('server.authorize.productId')}`,
        json: true,
        qs: {
          sessionId: ctx.cookies.get(sessionIdName),
        },
      }

      // 如果没有 userId 或者 session 直接返回超时，减轻后端接口压力
      if (!ctx.cookies.get(sessionIdName)) {
        log.info('~~~~~~ sessionId 缺失 ~~~~~~')
        await handleTimeout(ctx)
        return
      }

      log.info('check login options: ', options)

      const response = await rp(options)

      log.info('check login response: ', response)

      // 如果已登录且有进入权限，对租户信息进行判断
      if (response.content) {
        // 返回信息：userId，tenantId，productId
        ctx.global = response.content

        // 是account项目，个人中心页面鉴权
        if (config('server.isAccountProject') && !response.content.tenantId) {
          await handleTimeout(ctx)
          return
        }

        // 需要重新选择租户
        if (!ctx.global.tenantId && !ctx.request.query.chooseTenant && !ctx.request.body.chooseTenant) {
          const tenantList = await handleTenant(ctx)
          log.info('has permissions tenantList: ', tenantList)
          const length = tenantList.length
          log.info('tenantList length: ', length)
          if (length === 0) { // 无有进入系统权限的租户
            handleNoPermission(ctx)
            return
          } else if (length === 1) { // 有一个有权限进入系统的租户
            const result = await setProductTenant(ctx, tenantList[0].tenantId)
            log.info('setProductTenant response: ', result)
            if (result && !util.isAjaxRequest(ctx)) { // setProductTenant成功，并且是页面请求
              log.info('path: ', ctx.path || '/')
              ctx.redirect(ctx.path || '/')
              return
            }
          } else { // 有一个 或 多个租户 有进入权限
            handleManyTenant(ctx)
            return
          }
        }

        await next()
        // 否则返回登录超时 或者直接跳转登录页
      } else {
        await handleTimeout(ctx)
      }

      // 报错了也按登录超时处理
    } catch (e) {
      await handleTimeout(ctx)
      const error = `check login catch: ${e.message} ${e.stack}`
      log.error(error)
    }
  })

  // 用户中心需要鉴权的接口（个人中心）
  router.all(util.handleRouterPre('/personal/center/*', config), async (ctx, next) => {
    log.info('~~~~~ /personal/center/* ~~~~~')
    // 注入ip参数的接口
    const urlPre = ctx.req.url.split(`/personal/center/${config('server.authorize.pathname').split('/api/')[1]}`)[1].split('?')[0]
    // 获取验证码的请求带上remoteAddress，都是post请求
    if (urlPre === '/verify/code' || urlPre === '/email/verify/code') {
      const clientIp = await util.getIp(ctx, log)
      ctx.request.body = _.assign({}, ctx.request.body, {
        remoteAddress: clientIp,
      })
    }

    const authorizeUrl = ctx.req.url.replace(/^\/personal\/center/, '/api')

    const options = {
      method: ctx.req.method,
      uri: `${config('server.authorize.apiPrefix')}${authorizeUrl}`,
      json: true,
      body: ctx.request.body,
      qs: ctx.request.query,
    }
    log.info('personal center options: ', options)
    try {
      ctx.body = await rp(options)
    } catch (e) {
      log.error(`personal center catch: ${config('server.authorize.apiPrefix')}${authorizeUrl}, ${e.message}`)
      ctx.body = {
        success: false,
        message: `authorize error: ${config('server.authorize.apiPrefix')}${authorizeUrl}, ${e.message}`,
      }
    }
  })

  // 私有化部署，登录页、注册页、忘记密码页，未登录不需要checkLogin
  router.get(util.handleRouterPre('/personal-center/*', config), async (ctx, next) => {
    // 如果私有化部署，就node端请求登录页，把登录页源码返回
    const isAccountProject = config('server.isAccountProject')

    let uri = config('server.authorize.loginUrlPrefix') + ctx.url
    // 用户中心的 pathPrefix 必须是 /account
    if (config('server.pathPrefix')) {
      uri = `${config('server.authorize.loginUrlPrefix')}/account${ctx.url}`
    }

    if (!isAccountProject) {
      const options = {
        uri,
        method: 'POST',
        json: true,
        body: {
          personalDisabled: true,
          global: ctx.global,
        },
      }
      const body = await rp(options)
      ctx.body = body
    } else {
      await next()
    }
  })

  // 其他项目中转发来自用户中心的接口，需要先checkLogin
  router.all(util.handleRouterPre('/account/*', config), async (ctx, next) => {
    // 用户中心不走这个的
    const isAccount = config('server.isAccountProject')
    if (isAccount) {
      await next()
      return
    }

    log.info('~~~~~~ /authorize/* ~~~~~~')
    // 先去掉  pathPrefix
    let authorizeUrl = ctx.req.url.replace(config('server.pathPrefix'), '')

    // 再把 account 改成 api
    authorizeUrl = ctx.req.url.replace(config('server.pathPrefix'), '').replace(/^\/account/, '/api')


    const injectData = util.getInjectData(ctx)
    const ip = await util.getIp(ctx, log)
    const query = _.assign(
      {},
      ctx.request.body,
      ctx.request.query,
      injectData,
      { remoteAddress: ip }
    )
    // 如果是 'POST','PATCH','PUT' 就不要往 options 里添加 qs 对象了，超过 get 请求最大字符限制会报错
    const needQs = ['POST', 'PATCH', 'PUT'].indexOf(ctx.req.method.toLocaleUpperCase()) === -1

    const options = {
      method: ctx.req.method,
      uri: `${config('server.authorize.apiPrefix')}${authorizeUrl}`,
      json: true,
      body: query,
      qs: needQs ? query : {},
    }
    if (!options.headers) {
      options.headers = {}
    }

    // 支持用户自定义Header
    const apiHeader = config('server.apiHeader')
    if (apiHeader) {
      _.forEach(apiHeader, (v, k) => {
        options.headers[k] = ctx.header[k] || v
      })
    }

    // 透传 cookie
    options.headers.cookie = ctx.header.cookie


    // 注入 header 里的参数
    const injectHeader = util.getInjectData(ctx, 'header')
    _.forEach(injectHeader, (v, k) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers[k] = v
    })

    log.info('authorize options: ', options)

    try {
      const rs = await rp(options)
      ctx.body = util.escapeResult(rs)
    } catch (e) {
      log.error(`authorize catch: ${config('server.authorize.apiPrefix')}${authorizeUrl}, ${e.message}`)
      ctx.body = {
        success: false,
        message: `authorize error: ${config('server.authorize.apiPrefix')}${authorizeUrl}, ${e.message}`,
      }
    }
  })


  // 处理登录超时
  const handleTimeout = ctx => {
    const pro = new Promise(async resolve => {
      // 如果是api请求，返回登录超时
      if (util.isAjaxRequest(ctx)) {
        ctx.body = {
          code: 403,
          success: false,
          message: '登录超时，请重新登录',
        }
        // 如果是页面请求，跳转的登录页
      } else {
        // 私有化部署，往自己的 /login 跳
        let url = `${ctx.config('server.pathPrefix')}/login`
        const isAccount = config('server.isAccountProject')
        if (!isAccount) {
          url = `${ctx.config('server.pathPrefix')}/login?redirect=${ctx.href}`
          if (config('configJson.authorizeUri')) {
            url = `${config('configJson.authorizeUri')}${ctx.href}`
          } else if (config('configJson.oauth.authorizeUri')) {
            const options = {
              method: 'GET',
              uri: `${config.sure('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/user/login/pre_login`,
              json: true,
              qs: {
                authorizationLocation: config('configJson.oauth.authorizeUri'),
                clientId: config('configJson.oauth.clientId'),
                redirectUri: `${ctx.href}`,
              },
            }
            const res = await rp(options)
            url = res.content.result
          }
        }
        ctx.redirect(url)
      }
      resolve()
    })
    return pro
  }

  /**
   * 分析需不需要去重新选择租户
   * @param ctx
   * @returns {Promise}
   */
  const handleTenant = ctx => {
    const pro = new Promise(async resolve => {
      const userId = ctx.global.userId
      const options = {
        method: 'GET',
        uri: `${config.sure('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/user/${userId}/tenant/has_function_code`,
        json: true,
        qs: {
          productId: config('server.authorize.productId'),
          functionCode: config('server.authorize.pageFunctionCode'),
        },
      }
      const tenantInfo = await rp(options)
      resolve(tenantInfo.content)
    })

    return pro
  }

  /**
   * 该用户无有权限的租户 处理
   * @param ctx
   */
  const handleNoPermission = ctx => {
    // 如果是api请求
    if (util.isAjaxRequest(ctx)) {
      ctx.body = {
        code: 403,
        success: false,
        message: '该用户无访问权限，请重新登录',
      }
      // 如果是页面请求，跳转到无权限页面
    } else {
      ctx.redirect(`${config('server.pathPrefix')}/nopermission`)
    }
  }


  /**
   * 重新选择多租户租户
   * @param ctx
   */
  const handleManyTenant = ctx => {
    // 如果是api请求
    if (util.isAjaxRequest(ctx)) {
      ctx.body = {
        code: 403,
        success: false,
        message: '租户变化，请重新选择租户',
      }
      // 如果是页面请求，跳转的登录页
    } else {
      ctx.redirect(`${config('server.pathPrefix')}/tenantchoose?redirect=${ctx.url}`)
    }
  }

  /**
   * 重新选择租户时一个租户自动切换
   * @param ctx
   */
  const setProductTenant = (ctx, tenantId) => {
    const pro = new Promise(async resolve => {
      const productId = config('server.authorize.productId')
      const sessionIdName = config.get('server.authorize.sessionIdName')
      const options = {
        method: 'POST',
        uri: `${config.sure('server.authorize.apiPrefix')}${config.sure('server.authorize.pathname')}/user/login/product/${productId}/as/${tenantId}`,
        json: true,
        body: {
          userId: ctx.global.userId,
          sessionId: ctx.cookies.get(sessionIdName),
        },
      }
      log.info('setProductTenant options: ', options)
      const response = await rp(options)
      resolve(response.content.result)
    })

    return pro
  }
}
