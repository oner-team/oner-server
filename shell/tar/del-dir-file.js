const fs = require('fs')

// 可以改进 目前只删除src/文件夹/的文件 
// 保留了所有目录结构
function delDir(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach(file => {
      const curPath = `${path}/${file}`
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) // 递归删除文件夹
      } else {
        fs.unlinkSync(curPath) // 删除文件
      }
    })
        // fs.rmdirSync(path);
  }
}

module.exports = delDir
