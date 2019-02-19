const path = require('path')
const fs = require('fs')
const os = require('os')
const rimraf = require('rimraf')
const log = require('../common/log')
const env = require('../common/env')
const util = require('../common/util')


const BROWSER_MOCK_DIR = 'mock'
const NODE_MOCK_DIR = 'oner-server-mock'

module.exports = app => {
  const router = app.router
  const config = app.config

  // 删除缓存目录
  rimraf.sync(path.join(os.tmpdir(), NODE_MOCK_DIR))
  // console.log('clear mock dir')

  // 创建缓存目录
  fs.mkdirSync(path.join(os.tmpdir(), NODE_MOCK_DIR))

  let fileId = 0

  const mock = (mockFilePath, ctx) => {
    // console.log(`Mock Module Path: ${mockFilePath}`)

    ctx.type = 'application/json'

    try {
      if (config('client.env') !== 'development') { // 测试或线上
        const fileContent = require(mockFilePath) // eslint-disable-line
        ctx.body = fileContent
      } else { // 本地开发
        fileId += 1

        // 读取文件内容
        const fileContent = fs.readFileSync(mockFilePath, 'utf8')

        const tmpFilePath = path.join(os.tmpdir(), NODE_MOCK_DIR, `${path.basename(mockFilePath, '.js')}-${fileId}.js`)

        // console.log('tmpFilePath:', tmpFilePath)

        // 写入临时文件
        fs.writeFileSync(
          tmpFilePath,
          fileContent,
          'utf8'
        )

        // 读取文件
        const json = require(tmpFilePath) // eslint-disable-line
        ctx.body = JSON.stringify(json)
      }
    } catch (e) {
      log.error(`mock error: ${util.escapeHtml(e.message)}`)
      ctx.body = JSON.stringify({
        success: false,
        message: 'Mock Error',
      })
    }
  }

  router.all(util.handleRouterPre('/mock/:method', config), ctx => {
    mock(path.join(env.CLIENT_DIR, BROWSER_MOCK_DIR, `${ctx.params.method}.js`), ctx)
  })

  router.all(util.handleRouterPre('/mock/:dir/:method', config), ctx => {
    mock(path.join(env.CLIENT_DIR, BROWSER_MOCK_DIR, ctx.params.dir, `${ctx.params.method}.js`), ctx)
  })
}
