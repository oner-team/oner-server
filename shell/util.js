const exec = require('child_process').exec
const config = require('../common/config')

const getResourceList = () => {
  let resourceList = []
  const pages = config('client.page')

  if (pages.js && pages.js.length > 0) {
    resourceList = resourceList.concat(pages.js)
  }
  if (pages.css && pages.css.length > 0) {
    resourceList = resourceList.concat(pages.css)
  }

  if (pages.icon) {
    resourceList.push(pages.icon)
  }

  Object.keys(pages).forEach(k => {
    const item = pages[k]
    if (item.js && item.js.length > 0) {
      resourceList = resourceList.concat(item.js)
    }
    if (item.css && item.css.length > 0) {
      resourceList = resourceList.concat(item.css)
    }
    if (item.icon) {
      resourceList.push(item.icon)
    }
  })

  const resource = config('client.resource')
  if (resource && resource.length > 0) {
    resourceList = resourceList.concat(resource)
  }

  return resourceList
}

const shell = (order, option = {}) => {
  const pro = new Promise((reslove, reject) => {
    exec(order, option, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        reslove(stdout)
      }
    })
  })
  return pro
}
module.exports = {
  shell,
  getResourceList,
}
