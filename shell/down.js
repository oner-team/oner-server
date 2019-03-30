#!/usr/bin/env node

const fs = require('fs-extra')
const urlParse = require('url-parse')
const request = require('request')
const mkdirp = require('async-mkdirp')
const path = require('path')
const {
  getResourceList,
} = require('./util')
const env = require('../common/env')
const logger = require('../common/log')

const CLIENT_DIR = env.CLIENT_DIR

const STATICPATH = path.join(CLIENT_DIR, 'resource')

// 下载单个资源
const donwResource = async resource => {
  if (resource.indexOf('//') === 0) {
    resource = `http:${resource}`
  }
  const { pathname, hostname } = urlParse(resource)
  if (!hostname || !pathname) return // 剔除 类似 common.js
  const dirs = pathname.split('/')
  const fileName = dirs.splice(-1).toString()
  const saveDirPath = path.join(STATICPATH, ...dirs)
  // 有就不下载了
  if (!fs.existsSync(path.join(saveDirPath, fileName))) {
    await mkdirp(saveDirPath)
    request.get(resource)
      .on('error', error => logger.error(`下载失败：${resource} \n message:${error.message}`))
      .pipe(fs.createWriteStream(path.join(saveDirPath, fileName)), {
        encoding: null,
        end: true,
      })
      .on('finish', () => {
        //  todo 这里可以做第三方资源监察，并下载
        logger.info(`下载完成：${resource}`)
      })
  } else {
    logger.info(`${resource}  已存在`)
  }
}

const resourceList = getResourceList()
resourceList.map(donwResource)
// const downLoadResources = () => jsList.map(donwResource)
// module.exports = downLoadResources

