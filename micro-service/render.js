const rp = require('request-promise')
const _ = require('lodash')
const nunjucks = require('nunjucks')
const fs = require('fs')
const path = require('path')
const keeper = require('./keeper')
const util = require('../common/util')

module.exports = async app => {
  const config = app.config
  app.use(async ctx => {
    // 是否是用户中心，用户中心需要的页面数据会跟其他页面有些差异
    const isAccountProject = config('server.isAccountProject')

    // 获取进入页面权限相关数据
    const pagePermissionInfo = await getPageEnterPermission(ctx, config, isAccountProject)

    // 如果不允许进入页面 就跳转到无权限页面
    if (!pagePermissionInfo.allowEnterPage) {
      ctx.redirect(`${config('server.pathPrefix')}/nopermission`)
      return
    }

    // 用户数据 userId, nickName, funCodesRes...
    const userConfig = pagePermissionInfo.userConfig

    // onerConfig 所有页面通用数据
    const onerConfig = getOnerConfig(ctx, config, isAccountProject)

    // timeStamp 测试环境用的静态资源时间戳
    const timeStamp = getTimeStamp(config)

    // njkData 页面注入自定义数据
    const njkData = getNjkData(ctx)

    // 获取页面上需要的 js css 和 title
    const pageConfig = util.getPageConfig(ctx, getOnerConfig(ctx, config, isAccountProject, 'object'))
    // 对于多页来说，如果没有找到对应页面就跳转404
    if (pageConfig === '404') {
      ctx.redirect(`${config('server.pathPrefix')}/404`)
      return
    }


    // 读取配置文件（/server/config.json），渲染到页面上
    const windowKeeper = await getKeeperData(app, ctx)
    const serverKeeper = ctx.keeper
    await ctx.render(config('client.page.njkPath'), {
      pageConfig,
      config,
      ctx,
      onerConfig,
      timeStamp,
      njkData,
      userConfig,
      windowKeeper,
      keeper: serverKeeper,
    })
  })
}


/**
 * 获取页面权限相关数据
 *
 * @param {*} ctx
 * @param {*} config
 * @param {*} isAccountProject
 * @return {*} rs {
 *  disableAuthorize : 是否禁用权限检查
 *  allowEnterPage ： 如果启用检查，这是是否允许进入
 *  funCodesRes ： 如果允许进入，这是功能点列表
 *  userConfig ： 如果允许有权限，就去拿用户信息
 * }
 */
const getPageEnterPermission = (ctx, config, isAccountProject) => new Promise(async (resolve, reject) => {
    // 是否禁用鉴权
  const disableAuthorize = config('server.authorize.disabled')
    // 是否是用户中心项目
  const isAccount = isAccountProject && ctx.path.indexOf('/personal-center') === -1

  const rs = {
    disableAuthorize,
    allowEnterPage: false,
  }

    // 禁用鉴权 && 不是个人中心页面的用户中心项目 or 用户自定义不鉴权 不检查权限
  if (disableAuthorize || isAccount || ctx.freeAuthorize) {
    rs.allowEnterPage = true

      // 否则检查权限
  } else {
    rs.allowEnterPage = true
      // 配置了pageFunctionCode，去校验权限
    if (config('server.authorize.pageFunctionCode')) {
        // 去拿功能点列表
      const uri = `${config.sure('server.authorize.apiPrefix')
            }${config('server.authorize.pathname')}` +
          `/product/${config.sure('server.authorize.productId')
            }/tenant/${ctx.global.tenantId
            }/user/${ctx.global.userId
            }/function`
      const options2 = {
        method: 'GET',
        uri,
        json: true,
      }
      const funCodesRes = await rp(options2)
      let pass = false
        // 遍历功能点列表看本项目功能点是否在列表内
      if (funCodesRes.success === true) {
        for (let i = 0, l = funCodesRes.content.length; i < l; i += 1) {
          if (funCodesRes.content[i].functionCode === config('server.authorize.pageFunctionCode')) {
            pass = true
            rs.functionCodes = funCodesRes.content.map(item => item.functionCode)
            break
          }
        }
      }
      if (!pass) rs.allowEnterPage = false
    }
      // // 如果有权限，或者不校验权限，那就去拿用户信息
    if (rs.allowEnterPage) {
      const options = {
        uri: `${config.sure('server.authorize.apiPrefix')}${config('server.authorize.pathname')}/user/${ctx.global.userId}/new`,
        method: 'GET',
        json: true,
        qs: {
          tenantId: ctx.global.tenantId,
        },
      }
      const userConfig = await rp(options)
        //
        // 拼用户信息
      if (userConfig.success) {
        delete userConfig.content.roleList
        rs.userConfig = _.assign(userConfig.content, {
          tenantId: ctx.global.tenantId,
          functionCodes: rs.functionCodes,
        })
        if (!config('server.showFunCode')) {
          delete rs.userConfig.functionCodes
        }
        rs.userConfig = `var __userConfig = window.__userConfig || ${JSON.stringify(rs.userConfig)}`
      }
    }
  }
  resolve(rs)
})

// 获取通用数据
const getOnerConfig = (ctx, config, isAccountProject, resultType = 'string') => {
  let onerConfig = {
    clientEnv: config('client.env'),
    serverEnv: config('server.env'),
  }

  // 如果是用户中心
  if (isAccountProject) {
    // 各项目的用户中心配置
    const userLoginConfig = ctx.request.body

    // 用户中心的通用配置
    const accountLoginConfig = config('server.loginConfig')

    onerConfig = _.assign(onerConfig, accountLoginConfig, userLoginConfig)
  }
  onerConfig.pathPrefix = config('server.pathPrefix')
  if (resultType === 'string') {
    return `var __onerConfig = window.__onerConfig || ${JSON.stringify(onerConfig)}`
  }
  return onerConfig
}

// 获取时间戳，仅测试环境需要
const getTimeStamp = config => {
  let timeStamp = ''
  if (config('server.env') === 'test') {
    timeStamp = new Date().getTime()
    timeStamp = `?timeStamp=${timeStamp}`
  }

  return timeStamp
}

// 获取用户自定义数据  TODO: keeper 引入了，可以考虑逐步干掉了
const getNjkData = ctx => {
  const njkData = {}
  if (ctx.njkData) {
    _.forEach(ctx.njkData, (v, k) => {
      njkData[k] = v
    })
  }
  return `var njkData = window.njkData || ${JSON.stringify(njkData)}`
}

// 获取配置中心数据
const getKeeperData = (app, ctx) => {
  const pro = new Promise(async resolve => {
    const data = await keeper.getData(app)
    ctx.keeper = data
    resolve(`var __keeper = window.__keeper || ${JSON.stringify(data)}`)
  })

  return pro
}
