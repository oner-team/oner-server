const log = require('../common/log')

module.exports = app => {
  const config = app.config

  const plugins = config('server.plugins')
  
  // 执行项目插件
  if (Array.isArray(plugins)) {
    plugins.forEach(plugin => {
      plugin(app)
    })
  }
}
