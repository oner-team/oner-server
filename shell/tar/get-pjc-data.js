const path = require('path')

try {
  config = require(path.join(process.cwd(), 'node_modules/@dtwave/oner-server/common/config'))
} catch (err) {
  config = require(path.join(process.cwd(), 'node_modules/@dtwave/oner-server/config'))
}
process.stdout.write('我是宇宙第一超级无敌变态长分割符')
process.stdout.write(`${typeof config(process.env.KEY) === 'object' ? JSON.stringify(config(process.env.KEY)) : config(process.env.KEY)}`)

// process.stdout.write(JSON.stringify(process.args))
