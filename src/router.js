'use strict'

const Router = require('koa-router')
const router = new Router()
const wxApi = require('./api/weixin')
const wxSrv = require('./pay/weixin')

router.get('/api/ticket', wxApi.getAuth)
router.get('/ticket', wxApi.getAuth)
router.get('/api/wx/oauthcode', wxApi.getCode)
router.get('/api/oauthcode', wxApi.getCode)
router.get('/api/wx/prepay', wxApi.getPreArgs)
router.get('/pay/v1/h5pay', wxApi.payIndex)
router.all('/wx/notify', wxSrv.wxXmlMw, wxApi.payNotify)

module.exports = router
