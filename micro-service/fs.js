/**
 * HDFS DOC: http://doc.dtos.dtwave-inc.com/base_service/file_service.html
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const formidable = require('formidable')
const request = require('request')
const rp = require('request-promise')
const XLSX = require('xlsx')
const _ = require('lodash')
const util = require('../common/util')
const log = require('../common/log')


// 临时目录
const TMP_PATH = path.join(os.tmpdir(), 'oner-server-upload')

// 解析xlsx

// const parseXLSX = ctx => new Promise(resolve => {
//   const form = new formidable.IncomingForm()
//   form.parse(ctx.req, (err, fields, files) => {
//     const workbook = XLSX.readFile(files.file.path, { type: 'binary' })
//     const data = []
//     const cols = []
//     const sheetNames = []
//     const tables = []
//     workbook.SheetNames.forEach(name => {
//       const worksheet = workbook.Sheets[name]
//       sheetNames.push(name)
//       data.push(XLSX.utils.sheet_to_json(worksheet, { header: 1 }))
//       tables.push(XLSX.utils.sheet_to_html(worksheet))
//       cols.push(makeCols(worksheet['!ref']))
//     })
//     resolve({ xlsx: { data, cols, sheetNames, tables }, workbook })
//   })
// })

// 上传
const upload = ctx => new Promise((resolve, reject) => {
  const config = ctx.config
  const tenantId = ctx.global.tenantId

  const form = new formidable.IncomingForm()

  form.encoding = 'utf-8'
  form.uploadDir = TMP_PATH
  form.keepExtensions = true
  // 根本不生效啊
  form.maxFieldsSize = 10 * 1024 * 1024

  form.parse(ctx.req, (error, fields, files) => {
    if (error) {
      reject(error)
      return
    }

    // const overwrite = typeof fields.overwrite === 'boolean' ? fields.overwrite : 'true'

    const readStream = fs.createReadStream(files.file.path)


    const dest = config('server.fs.saveWithName')
    ? `${config('client.name')}/tenant_${tenantId}/${files.file.name}`
    // 必须以`/`结束，表示指定上传的目录
    : `${config('client.name')}/tenant_${tenantId}/`

    const options = {
      url: config('server.fs.uploadUrl'),
      formData: {
        src: readStream,
        dest,
      },
      // 让下面的`body`变成`json`对象，且设置`header`的`Content-Type`为`application/json`
      json: true,
    }

    // 这个参数后端文档有坑，传布尔值不行，必须是字符串！要不不传
    if (config('server.fs.saveWithName')) {
      options.overwrite = 'true'
    }

    log.info('fs upload options: ', options)

    request.post(options, (uploadError, response, body) => {
      if (uploadError) {
        reject(uploadError)
      } else if (body.success) {
        resolve({
          id: body.content.id,
          dest: config('server.fs.saveWithName') ? dest : `${dest}${body.content.id}`,
        })
      } else {
        reject({
          message: body.errorMsg,
        })
      }
    })
  })
})

module.exports = app => {
  const router = app.router
  const config = app.config
  
  config.set('server.fs.uploadUrl', `${config('server.fs.apiPrefix')}/api/v1/file_service/upload`)
  config.set('server.fs.downloadApiUrl', '/api/v1/file_service/download')
  config.set('server.fs.downloadUrl', `${config('server.fs.apiPrefix')}${config('server.fs.downloadApiUrl')}`)

  router.post(util.handleRouterPre('/fs/upload', config), async ctx => {
    log.info('~~~~~~ /fs/upload ~~~~~~')

    const dirExists = fs.existsSync(TMP_PATH)
    if (!dirExists) {
      fs.mkdirSync(TMP_PATH)
    }

    try {
      const rs = await upload(ctx)
      ctx.body = {
        success: true,
        content: {
          id: rs.id,
          url: `${config('server.fs.downloadUrl')}?src=/${rs.dest}`,
          proxyUrl: `${config('server.pathPrefix')}/fs/download${config('server.fs.downloadApiUrl')}?src=/${rs.dest}`,
        },
      }
    } catch (e) {
      log.error(`fs upload catch: ${e.message}`)
      ctx.body = {
        success: false,
        error: {
          message: e.message,
        },
      }
    }
  })

  // 提供下载中转
  router.all(util.handleRouterPre('/fs/download/*', config), async ctx => {
    log.info('~~~~~~ /fs/download/* ~~~~~~')
    const url = ctx.url.replace(config('server.pathPrefix'), '').replace('/fs/download', '')
    // 注入三大参数
    const injectData = util.getInjectData(ctx)
    const options = {
      uri: `${config('server.fs.apiPrefix')}${url}`,
      resolveWithFullResponse: true,
      encoding: null,
      body: _.assign({}, ctx.request.body, injectData),
      qs: _.assign({}, ctx.request.query, injectData),
      headers: _.assign(
        {
          Accept: '*/*',
          cookie: ctx.header.cookie,
        },
        util.getInjectData(ctx, 'header'),
        config('server.apiHeader')
      ),
      json: true,
    }
    log.info('fs download options: ', options)
    const rs = await rp(options)
    const headers = ['content-type', 'content-disposition']
    headers.forEach(key => {
      ctx.response.set(key, rs.headers[key])
    })
    ctx.body = rs.body
  })

  // 解析xlsx
  // Upload组件中的action对应为'/fs/xlsx'
  // router.post('/fs/xlsx', async ctx => {
  //   log.info('~~~~~~ /fs/xlsx/* ~~~~~~')
  //   try {
  //     const { xlsx } = await parseXLSX(ctx)
  //     ctx.body = {
  //       success: true,
  //       content: {
  //         xlsx,
  //         // workbook,
  //       },
  //     }
  //   } catch (e) {
  //     log.error(`fs xlsx catch: ${e.message}`)
  //     ctx.body = {
  //       success: false,
  //       error: {
  //         message: e.message,
  //       },
  //     }
  //   }
  // })
}

// const makeCols = refstr =>
//     Array(XLSX.utils.decode_range(refstr).e.c + 1)
//         .fill(0)
//         .map((x, i) => { return ({ name: XLSX.utils.encode_col(i), key: i }) }
//     )
