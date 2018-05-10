'use strict'

const Router = require('koa-router')
const router = new Router()
const wxApi = require('./api/weixin')

router.get('/api/ticket', wxApi.getAuth)
router.get('/ticket', wxApi.getAuth)
router.get('/api/wx/oauthcode', wxApi.getCode)
router.get('/api/wx/prepay', wxApi.getPreArgs)
router.get('/pay/v1/h5pay', wxApi.payIndex)

module.exports = router
