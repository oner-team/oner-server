
const fs = require('fs-extra')
const urlParse = require('url-parse')
const path = require('path')
const config = require('../common/config')
const { getResourceList } = require('./util')

const CLIENT_DIR = config('client.dir')
const DISTPATH = path.join(CLIENT_DIR, '/dist')
const STATICPATH = path.join(CLIENT_DIR, '/dist-private', config('client.name'), config('client.version'))
const NO_NEED_REPLACE = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'eot',
  'woff',
  'ttf',
  'zip',
  'rar',
  'tgz',
  '7z',
  'mp3',
  'mp4',
  'wma',
  'rm',
  'wav',
  'ape',
]
// 路径替换
const replace = async dest => {
  try {
    const fileList = await fs.readdir(dest) // 获取dest路径下所有文件
    fileList.forEach(async item => { // 遍历dest路径下所有文件
      const filePath = path.join(dest, `/${item}`) // 获取文件所在路径
      const status = await fs.stat(filePath) // 获取文件状态
      if (status.isFile()) { // 文件
        let suffixName = item.split('.').pop()
        suffixName = suffixName.toLocaleLowerCase() // 得到文件后缀名
        if (NO_NEED_REPLACE.indexOf(suffixName) < 0) { // 是否需要检查，防止某些文件被修改，比如图片
          const data = await fs.readFile(filePath, 'utf8') // 读取文件内容
          const resourceList = getResourceList() // 所有资源列表
          let rData = data
          resourceList.forEach(async resource => { // 遍历资源列表
            const { pathname, hostname } = urlParse(resource)
            if (!hostname) return // 类似 common.js 忽略
            const reg = new RegExp(resource, 'g')
            if (reg.test(rData)) {
              rData = rData.replace(reg, `${config('client.staticPrefix')}${pathname}`)
              console.log(`已匹配到 ${item} 文件中的 ${resource} ，替换为 ${config('client.staticPrefix')}${pathname}`)
            }
          })
          // const name = `/${config('client.name')}/${config('client.version')}/`
          // rData = rData.replace(new RegExp(`//cdn.dtwave.com${name}`, 'g'), `${config('client.staticPrefix')}${name}`)
          if (rData !== data) { // 排除类似于图片的文件格式，不重写文件
            await fs.outputFile(filePath, rData)
          }
        }
      } else { // 文件夹
        replace(filePath)
      }
    })
  } catch (err) {
    console.error(err)
  }
}

// 复制dist文件夹
const cpDir = async (src, dest) => {
  try {
    if (!fs.existsSync(src)) {
      console.log(`${src}目录不存在，请先执行 npm run build 命令`)
      return
    }
    await fs.copy(src, dest)
    replace(dest)
  } catch (err) {
    console.log(err)
  }
}

cpDir(DISTPATH, STATICPATH)

