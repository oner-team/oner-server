/**
 * HDFS DOC: http://doc.dtos.dtwave-inc.com/base_service/file_service.html
 */
const fs = require('fs')
const path = require('path')
const NodeCache = require('node-cache')
const log = require('../common/log')

const myCache = new NodeCache()

const MARKDOWN_DIR = 'estates-help'


module.exports = app => {
  const router = app.router
  const config = app.config().server
  router.get('/markdown', async ctx => {
    log.info('~~~~~~ /markdown ~~~~~~')
    const fileName = ctx.query.filename
    const filePath = `${path.join(config.rootPath, MARKDOWN_DIR, fileName)}.md`
    let res = ''
    let success = false

    try {
      if (myCache.get(fileName)) {
        res = myCache.get(fileName)
      } else {
        res = fs.readFileSync(filePath, 'utf8')
        myCache.set(fileName, res)
      }
      success = true
    } catch (e) {
      res = ''
      success = false
    }
    ctx.body = {
      success,
      content: res,
    }
  })
}
