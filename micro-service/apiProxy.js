const rp = require('request-promise')
const _ = require('lodash')
const util = require('../common/util')
const log = require('../common/log')

module.exports = async app => {
  const config = app.config
  const router = app.router


  const getOptions = (ctx, data, url, method = 'GET') => {
    const injectData = util.getInjectData(ctx)
    const query = _.assign({}, data, injectData)
    let apiPrefix = config('server.apiPrefix')

    // 先把前缀 replace 掉
    url = url.replace(config('server.pathPrefix'), '')

    if (typeof config('server.apiPrefix') === 'object') {
      // 遍历服务器前缀 替换url中的preK
      const apiPrefixObj = config('server.apiPrefix')
      let preK
      Object.keys(apiPrefixObj).forEach(k => {
        if (url.indexOf(`/${k}`) === 0) {
          preK = k
        }
      })

      apiPrefix = config(`server.apiPrefix.${preK}`)
      url = url.replace(preK, 'api')
    }

    // 如果是 'POST','PATCH','PUT' 就不要往 options 里添加 qs 对象了，超过 get 请求最大字符限制会报错
    const needQs = ['POST', 'PATCH', 'PUT'].indexOf(method.toLocaleUpperCase()) === -1

    const options = {
      method,
      uri: `${apiPrefix}${url}`,
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

    return options
  }


  router.post('/batch/api', async ctx => {
    const list = ctx.request.body.options || []
    const optionsList = list.map(opt => getOptions(ctx, opt.data, opt.url, opt.method))
    log.info('api optionsList: ', optionsList)

    // 批量发请求
    const resList = []
    const senApi = (options, index) => new Promise(async resolve => {
      try {
        const rs = await rp(options)
        resList[index] = rs
      } catch (err) {
        resList[index] = err
      }
      resolve()
    })
    const pros = []
    for (let i = 0; i < optionsList.length; i += 1) {
      pros.push(senApi(optionsList[i], i))
    }
    await Promise.all(pros)

    // log.info('api resList: ', resList)

    ctx.body = {
      success: true,
      content: resList,
    }
  })


  // 支持多后端
  let apiPre = ['/api/v*']
  if (typeof config('server.apiPrefix') === 'object') {
    apiPre = []
    _.forEach(config('server.apiPrefix'), (v, k) => {
      apiPre.push(`/${k}/v*`)
    })
  }

  log.info('监听的apiPrefix: ', apiPre)


  router.all(util.handleRouterPre(apiPre, config), async ctx => {
    log.info(`~~~~~~ ${ctx.url} ~~~~~~`)

    const check = util.isValidRequest(ctx, log)

    if (!check.valid) {
      ctx.body = {
        success: false,
        message: check.message,
      }
      return
    }

    const query = _.assign({}, ctx.request.body, ctx.request.query)
    const options = getOptions(ctx, query, ctx.url, ctx.req.method)

    log.info('api options: ', options)

    try {
      const rs = await rp(options)
      ctx.body = util.escapeResult(rs)
    } catch (e) {
      log.error(`api response catch: ${options.uri}, ${util.escapeHtml(e.message)}`)
      ctx.body = {
        success: false,
        message: util.escapeHtml(e.message),
      }
    }
  })
}

