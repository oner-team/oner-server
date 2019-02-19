const _ = require('lodash')
const fs = require('fs')
const rp = require('request-promise')
const exec = require('child_process').exec
const urlParse = require('url-parse')

const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'

const randomString = (n = 32) => {
  let str = ''
  for (let i = 0; i < n; i += 1) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

const isAjaxRequest = ctx => ctx.header['x-requested-with'] === 'XMLHttpRequest'

const isValidRequest = (ctx, logger) => {
  const config = ctx.config
  if (config('server.withoutVaild')) {
    return {
      valid: true,
    }
  }

  logger.info(`check url valid: ${ctx.url}`)

  // 如果是debug模式
  // if (config('server.isDevelopment')) {
  //   return {
  //     valid: true,
  //   }
  // }

  if (!isAjaxRequest(ctx)) {
    logger.error('isValidRequest(false): not ajax request')
    return {
      valid: false,
      message: 'invalid request: not ajax request',
    }
  }

  const refererWhiteList = config('server.refererWhiteList')
  if (_.isArray(refererWhiteList)) {
    if (!ctx.header.referer) {
      logger.error(`isValidRequest(false): no referer, ${ctx.url}`)
      return {
        valid: false,
        message: 'invalid request: no referer',
      }
    } else if (refererWhiteList.indexOf(ctx.header.host) === -1) {
      logger.error('isValidRequest(false): not allowed referer')
      logger.error(`referer: ${ctx.header.referer}`)
      return {
        valid: false,
        message: 'invalid request: not allowed referer',
      }
    }
  }

  logger.info('isValidRequest(true)')

  return {
    valid: true,
  }
}

// 根据请求分析出对应资源文件名，如果是错误的 url 则跳转到 404
const getPageConfig = (ctx, onerConfig = {}) => {
  const { config } = ctx
  // 页面的通用资源名称，对于spa来说就是main，对于多页应用来说就是对应的组件名
  let realName


  // 如果是单页应用
  if (config('client.spa')) {
    realName = 'main'

    // 如果是多页应用
  } else {
    // 解析url中的组件名，先把 pathPrefix 替换掉。如果没有就给个默认值 /
    let pageName = ctx.path.replace(config('server.pathPrefix'), '') || '/'

    if (pageName !== '/') {
      // const s = pageName.indexOf('/') + 1
      // let e = pageName.indexOf('.html') 
      // e = e > -1 ? e : pageName.length
      // pageName = pageName.substring(s, e)

      pageName = pageName.split('/').filter((d, i) => i > 0).join('/').replace('.html', '')
    }

    // url 中解析出来的page
    const urlPageName = pageName

    // 可能有自定义路径的情况存在，如果和自定义路由匹配上了，替换成他真正的名字
    const costomRouter = config('server.router') || {}
    // if(costomRouter){
    _.forEach(costomRouter, (v, k) => {
      if (v === pageName) {
        pageName = k
      }
    })
    // }


    // 拿到 src 下的所有 page ，起服务前做的
    const pageDirs = process.srcDirs
    pageDirs.forEach(dirName => {
      const name = dirName.replace('page-', '')
      if (name === pageName && !costomRouter[urlPageName]) {
        realName = name
      }
    })
  }

  // 如果没有名字，说明不存在对应组件
  if (!realName) {
    return '404'
  }

  return getPageJsCssTitle(config, realName, onerConfig, ctx)
}

// 根据 qs 中的 order 对资源进行排序，项目资源为 0 不可排序
const handleJsCssOrder = (arr, name) => {
  const withoutSort = arr.filter(a => typeof getQS(a).order === 'undefined')
  const preArr = arr.filter(a => typeof getQS(a).order !== 'undefined' && getOrder(a, name) > 0)
  const aftArr = arr.filter(a => typeof getQS(a).order !== 'undefined' && getOrder(a, name) < 0)

  const sort = (now, next) => {
    const nowOrder = getOrder(now, name)
    const nextOrder = getOrder(next, name)
    return nextOrder - nowOrder
  }


  return [...preArr.sort(sort), ...withoutSort, ...aftArr.sort(sort)]
}

const getOrder = (url, name) => {
  if (name === url) {
    return 0
  }
  const order = getQS(url).order || 1
  return order
}

// 解析 url 的 qs
const getQS = url => {
  if (url.indexOf('?') === -1) {
    return {}
  }
  const rs = {}
  const search = url.split('?')[1]
  search.split('&').forEach(kv => {
    const [key, value] = kv.split('=')
    rs[key] = value
  })
  return rs
}

// 获取页面的 title,icon 必要的 js 和 css
const getPageJsCssTitle = (config, name, onerConfig, ctx) => {
  let rs = {}
  rs.css = [
    `${name}.css`,
  ]
  const projectCss = config('client.page.css')
  if (projectCss) {
    rs.css = projectCss.concat(rs.css)
  }


  rs.js = [
    `${name}.js`,
  ]

  const projectJs = config('client.page.js')
  if (projectJs) {
    rs.js = projectJs.concat(rs.js)
  }

  rs.title = config('client.page.title')
  rs.icon = config('client.page.icon')


  if (!config('client.spa')) {
    const pageCss = config(`client.page.${name}.css`)
    if (pageCss) {
      rs.css = pageCss.concat(rs.css)
    }

    const pageJs = config(`client.page.${name}.js`)
    if (pageJs) {
      rs.js = pageJs.concat(rs.js)
    }

    const pageTitle = config(`client.page.${name}.title`)
    const pageIcon = config(`client.page.${name}.icon`)
    if (pageTitle) {
      rs.title = pageTitle
    }
    if (pageIcon) {
      rs.icon = pageIcon
    }
  }

  // 需要强行覆盖的， title, faviconUrl ，这段目前只有用户中心用到了 2017-11-14
  const needOverwriteConfig = ['title', 'faviconUrl']
  needOverwriteConfig.forEach(key => {
    if (onerConfig[key]) {
      rs[key] = onerConfig[key]
    }
  })

  rs = _.assign({
    faviconUrl: '//cdn.dtwave.com/public/ico/dtwave.ico',
  }, rs)

  // 对 js 和 css 排序
  rs.js = handleJsCssOrder(rs.js, `${name}.js`)
  rs.css = handleJsCssOrder(rs.css, `${name}.css`)

  return handlePrefix(rs, ctx, config)
}

// 处理静态资源
const handlePrefix = (data, ctx, config) => {
  const handler = pre => {
    const up = urlParse(pre)
    // 不走cdn
    if (config('server.env') === 'default' ||
      config('server.env') === 'development'
    ) {

      const isAccountProject = config('server.isAccountProject') // 是否是用户中心项目
      const accountDomain = config('configJson.accountDomain') // 配置文件配的accountDomain
      
      const prefix = isAccountProject ? accountDomain.replace(/http:|https:/, '') : ctx.origin.replace(/http:|https:/, '')

      // 第三方资源（来自cdn均视为cdn资源）
      if (up.hostname) {
        return `${prefix}${config('client.staticPrefix')}${up.pathname}`
      }
      // 开发环境的项目自身资源
      if (config('server.env') === 'development') {
        // 如果是 debug 模式 走 /static/magic/1.0.0/xxxx
        if (config('server.debug')) {
          return `${ctx.origin.replace(/http:|https:/, '')}${config('client.staticPrefix')}/${config('client.name')}/${config('client.version')}/${up.pathname.replace(/\//g, '')}`
        }
        // 否则走webpack服务 http://127.0.0.1:3000/static/xxxx
        return `${ctx.protocol}://${ctx.hostname}:${config('client.port')}/static/${up.pathname.replace(/\//g, '')}`
      }

      // 非开发环境
      return `${prefix}${config('client.staticPrefix')}/${config('client.name')}/${config('client.version')}/${up.pathname.replace(/\//g, '')}`
    }

    // 走 CDN
    // cdn 资源
    if (up.hostname) {
      return pre
    }
    // 项目自身资源
    return `//cdn.dtwave.com/${config('client.name')}/${config('client.version')}/${up.pathname.replace(/\//g, '')}`
  }
  if (data.js) {
    data.js = data.js.map(handler)
  }

  if (data.css) {
    data.css = data.css.filter(c => {
      // 多页的本地开发模式不需要引用 hello.css common.css ..
      if (config('server.env') === 'development' && !config('server.debug')) {
        return urlParse(c).hostname
      }
      return true
    }).map(handler)
  }

  if (data.icon) {
    data.icon = handler(data.icon)
  }
  return data
}

// 查询 src 页面下有哪些页面，涉及到 fs 操作，不要频繁调用！！！
const getAllPageUnderSrc = config => {
  const pro = new Promise(reslove => {
    const dirs = fs.readdirSync(`${config('client.dir')}/src`)
    const rs = []
    dirs.forEach(name => {
      if (name.startsWith('page-')) {
        rs.push(name)
      }
    })
    reslove(rs)
  })

  return pro
}

const getInjectData = (ctx, type) => {
  const config = ctx.config
  const injectData = {}
  if (!config('server.isAccountProject')) {
    if (type === 'header' && ctx.global) {
      injectData['X-Dtwave-Access-Key'] = ctx.global.accessKey
    }
    if (config('server.autoInjectApiData', []).indexOf('userId') > -1 && ctx.global && ctx.global.userId) {
      if (type === 'header') {
        injectData['X-Dtwave-Access-UserId'] = ctx.global.userId
      } else {
        injectData.userId = ctx.global.userId
      }
    }

    if (config('server.autoInjectApiData', []).indexOf('tenantId') > -1 && ctx.global && ctx.global.tenantId) {
      if (type === 'header') {
        injectData['X-Dtwave-Access-TenantId'] = ctx.global.tenantId
      } else {
        injectData.tenantId = ctx.global.tenantId
      }
    }

    if (config('server.autoInjectApiData', []).indexOf('productId') > -1 && config('server.authorize.productId')) {
      if (type === 'header') {
        injectData['X-Dtwave-Access-ProductId'] = config('server.authorize.productId')
      } else {
        injectData.productId = config('server.authorize.productId')
      }
    }
    const sessionIdName = config.get('server.authorize.sessionIdName')
    if (config('server.autoInjectApiData', []).indexOf('sessionId') > -1 && ctx.cookies.get(sessionIdName)) {
      if (type === 'header') {
        injectData['X-Dtwave-Access-SessionId'] = ctx.cookies.get(sessionIdName)
      } else {
        injectData.sessionId = ctx.cookies.get(sessionIdName)
      }
    }
  }

  return injectData
}

const getIPAdress = () => {
  const interfaces = require('os').networkInterfaces()
  for (const devName in interfaces) {
    const iface = interfaces[devName]
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}

// 对请求意外情况的处理
const handleError = error => {
  const { statusCode: code, message } = error
  if (code > 200 && typeof error.response === 'object' && typeof error.response.body === 'object') {
    return error.response.body
  }
  return {
    success: false,
    code,
    content: {},
    message,
  }
}

// 对错误返回进行转义
const escapeResult = rs => {
  if (!rs.success && rs.message) {
    rs.message = escapeHtml(rs.message)
  }
  return rs
}

// 特殊字符处理
const escapeHtml = string => {
  const matchHtmlRegExp = /["'&<>]/
  const str = `${string}`
  const match = matchHtmlRegExp.exec(str)

  if (!match) {
    return str
  }

  let escape
  let html = ''
  let index = 0
  let lastIndex = 0

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      // case 34:
      //   // "
      //   escape = '&quot;'
      //   break
      // case 38:
      //   // &
      //   escape = '&amp;'
      //   break
      // case 39:
      //   // '
      //   escape = '&#x27;' // modified from escape-html; used to be '&#39'
      //   break
      case 60:
        // <
        escape = '&lt;'
        break
      case 62:
        // >
        escape = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escape
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}

const getIp = (ctx, log) => new Promise(async resolve => {
  const { req } = ctx
  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  ip = ip.replace(/f|:/g, '')
  ip = ip.split(',')[0]

  if (!ip) { // 托管拿ip拿不到，暂时先调商机接口拿
    log.error('ip 没拿到啊！')
    // const ipOptions = {
    //   method: 'GET',
    //   uri: 'https://account.dtwave.com/getIp',
    //   json: true,
    // }
    // try {
    //   const ipRes = await rp(ipOptions)
    //   ip = ipRes.content.ip
    // } catch (error) {
    //   log.error(error)
    // }
  }
  // localhost 获取到的ip是 '1' ,这里加个容错
  if (ip.indexOf('.') === -1) {
    ip = '127.0.0.1'
  }
  resolve(ip || '127.0.0.1')
})


const shell = (order, option = {}) => {
  const pro = new Promise((reslove, reject) => {
    exec(order, option, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        reslove(stdout)
      }
    })
  })
  return pro
}

// 处理 router 前缀
const handleRouterPre = (str, config) => {
  const pathPrefix = config('server.pathPrefix')
  if (typeof str === 'string') {
    return `${pathPrefix}${str}`
  }
  return str.map(s => `${pathPrefix}${s}`)
}

module.exports = {
  shell,
  getInjectData,
  randomString,
  isValidRequest,
  isAjaxRequest,
  getPageConfig,
  getAllPageUnderSrc,
  getIPAdress,
  handleError,
  escapeHtml,
  escapeResult,
  getIp,
  handlePrefix,
  handleRouterPre,
}
