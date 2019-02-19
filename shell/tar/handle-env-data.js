const fs = require('fs')
const beautify = require('js-beautify').js_beautify

let env
const path = './project.config.js'
let data = fs.readFileSync(path).toString()

// 先干掉行内注释 '[空格]//'开头 回车 结尾，全部替换为空字符串
const replaceNote = txt => txt.replace(/ \/\/.*?\n/g, '')

// 替换一块儿环境变量数据，从头到尾一个一个找
const replaceEnvData = txt => {
  // 找到大块儿的 有环境区分的数据
  const start = txt.indexOf('nattyStorage.env(SERVER_ENV, {')
  const end = txt.indexOf('}),') + 3
  const cache = txt.substring(start, end)

  // 从有环境区分的数据中 找到指定环境的变量
  const rStart = cache.indexOf(`${env}:`)
  let realText = cache.substring(rStart)
  let rEnd
    // 不同类型的 value 结束符号不一样
  if (realText.indexOf(': [') > -1) {
    // 数组类型的
    rEnd = realText.indexOf('],\n') + 2
  } else if (realText.indexOf(': {') > -1) {
    // obj 类型的
    rEnd = realText.indexOf('},\n') + 2
  } else {
    // 其他
    rEnd = realText.indexOf(',\n') + 2
  }

  // 得到对应环境对应的 value 值
  realText = realText.substring(env.length + 1, rEnd)

  // 走到这儿就说明没找到对应环境变量的 value，写个空字符串进去就好了
  if (realText.indexOf('SERVER_ENV') > -1) {
    realText = "'',"
  }

  // 替换又一整坨环境变量数据成最终找到的那个正真的 value
  return txt.replace(cache, realText)
}


const go = obj => new Promise((resolve, reject) => {
  env = obj.env

    // 先去注释 （只能去行内注释，多行注释没支持到）
  data = replaceNote(data)

    // 一个一个的替换环境变量
  while (data.indexOf('nattyStorage.env(SERVER_ENV, {') > -1) {
      data = replaceEnvData(data)
    }

    // 保存成最终的文件
  fs.writeFileSync(obj.filePath, beautify(data, {
      indent_size: 2,
      indent_char: ' ',
    }))
  resolve()
})


module.exports = go
