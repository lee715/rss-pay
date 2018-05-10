'use strict'

const config = require('config')
const Koa = require('koa')
const ejs = require('koa-ejs')
const path = require('path')
const bodyParser = require('koa-bodyparser')
const rawMidd = require('./middleware/raw')

require('./service/vfw')

const app = new Koa()

app
  .use(bodyParser())
  .use(rawMidd)

ejs(app, {
  root: path.join(__dirname, '../view'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false
})

const start = async () => {
  require('./service/mongo')
  require('./service/redis')
  const router = require('./router')
  app
    .use(router.routes())
    .use(router.allowedMethods())
  app.listen(config.port, () => console.log(`listen port ${config.port}`))
}
start()
