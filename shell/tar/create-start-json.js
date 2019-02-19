const fs = require('fs')

const pkg = require(`${process.cwd()}/package.json`)
const beautify = require('js-beautify').js_beautify

const startJson = {
  name: `${pkg.name}_${pkg.version}`,
  script: 'app.js',
  max_memory_restart: '300M',
  instances: 1,
  exec_mode: 'cluster',
  env: {},
}

const create = obj => {
  startJson.env.NODE_ENV = obj.NODE_ENV
  if (obj.isPrivate) {
    startJson.env.TYPE = 'private'
  }

  // 保存成最终的文件
  fs.writeFileSync(obj.filePath, beautify(JSON.stringify(startJson), {
    indent_size: 2,
    indent_char: ' ',
  }))
}


module.exports = create
