const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')

const pkg = require(`${process.cwd()}/package.json`)
const shell = require('../util').shell

// 处理 project.config.js
const HandleEnvData = require('./handle-env-data')
// 生成 pm2.json
const createStartJson = require('./create-start-json')
// 删除src目录下面文件目录/文件夹或者文件
const delDirFile = require('./del-dir-file')

const begin = ({ isPrivate, NODE_ENV }) => {
  // 压缩包要保存的根目录
  const rootPath = 'tgz'
  // 当前压缩包的名字
  const folderName = `${pkg.name}_${pkg.version}`
  // 复制之前的准备工作，创建文件夹
  const copyBefore = () => {
    const pro = new Promise(async (reslove, reject) => {
      // 检查 tgz 目录是否存在，不存在的话就创建
      if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath)
      }

      // 检查 tgz/pgk.name_pkg.version 目录是否存在，先删除再创建
      if (fs.existsSync(`${rootPath}/${folderName}`)) {
        const order = `rm -rf ${folderName}`
        await shell(order, {
          cwd: rootPath,
        })
      }
      const tgzRootPath = `${rootPath}/${folderName}`
      fs.mkdirSync(tgzRootPath)
      reslove(tgzRootPath)
    })
    return pro
  }

  // 复制文件
  const copyFile = async isPrivate => {
    const allFiles = fs.readdirSync(process.cwd())

    // 要忽略的文件和文件夹
    const ignore = {
      files: ['package-lock.json', '.git', '.vscode', '.DS_Store', '.idea', '.svn'],
      folders: ['node_modules', 'tgz', 'dist'],
    }

    const copyFiles = {
      files: allFiles.filter(item => item.indexOf('.') > -1 && ignore.files.indexOf(item) === -1),
      folders: allFiles.filter(item => item.indexOf('.') === -1 && ignore.folders.indexOf(item) === -1),
    }


    // 需要复制的文件
    const files = copyFiles.files
    // 需要复制的文件夹
    const folders = copyFiles.folders

    // 拼复制命令，注意要去除换行符
    const order = `
      ${files.map(f => `cp ${f} ${rootPath}/${folderName}`).join(' && ')} 
      && 
      ${folders.map(f => `cp -r ${f} ${rootPath}/${folderName}`).join(' && ')}
      `.replace(/\n/g, ' ')

    return shell(order)
  }

  const npmInstall = () => shell('npm i --registry=http://r.dtwave-inc.com --production', {
    cwd: `${rootPath}/${folderName}`,
  })

  // 压缩
  const tar = async () => {
    // 先做删除src/目录下面文件目录/文件夹或者文件
    delDirFile(`${rootPath}/${folderName}/src`)

    // 如果已经存在 tgz ，先删掉
    if (fs.existsSync(`${rootPath}/${folderName}.tgz`)) {
      const order = `rm -f ${folderName}.tgz`
      await shell(order, {
        cwd: rootPath,
      })
    }

    const order = `tar -zcf ${folderName}.tgz ${folderName}`
    return shell(order, {
      cwd: rootPath,
    })
  }

  // 删除临时目录
  const deleteFolder = () => {
    const order = `rm -rf ${folderName} _cdn_tmp`
    return shell(order, {
      cwd: rootPath,
    })
  }

  const go = async ({ isPrivate, NODE_ENV }) => {
    console.log('1. 开始创建临时文件夹')
    const tgzRootPath = await copyBefore()

    console.log('2. 临时文件夹妥了，开始复制文件')
    await copyFile(isPrivate)

    console.log('3. 文件复制完成，开始安装依赖，比较慢，耐心等！！！')
    await npmInstall()

    // 私有化部署需要 pjc 脱敏，生成 pm2.json
    if (isPrivate) {
      console.log('3.1 依赖安装完成，开始处理 project.config.js')
      await HandleEnvData({
        env: NODE_ENV,
        filePath: path.join(tgzRootPath, 'project.config.js'),
      })

      console.log('3.2 处理完成，开始生成 pm2.json')
      createStartJson({
        NODE_ENV,
        isPrivate,
        filePath: path.join(tgzRootPath, 'pm2.json'),
      })
      console.log('4. pm2.json 生成成功，开始压缩')
    } else {
      console.log('4. 依赖安装完成，开始压缩')
    }

    await tar()

    console.log('5. 压缩完成，开始删除临时目录')
    await deleteFolder()

    console.log('6. 打包完成')
    process.exit()
  }

  go({
    isPrivate,
    NODE_ENV,
  })
}

const obj = [
  {
    name: '否',
    value: 'n',
  },
  {
    name: '是',
    value: 'y',
  },
]

const start = () => {
  inquirer.prompt({
    type: 'list',
    name: 'isPrivate',
    message: '是否私有化打包？',
    choices: obj,
  }).then(answers => {
    let isPrivate
    let NODE_ENV

    // 私有化打包，要脱敏，生成 pm2.json 启动文件
    if (answers.isPrivate === 'y') {
      isPrivate = true
      NODE_ENV = 'default'
      // 否则就是 merak 打包，直接打包
    }
    begin({
      isPrivate,
      NODE_ENV,
    })
  })
}

start()
