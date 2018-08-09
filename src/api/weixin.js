const config = require('config')
const qs = require('querystring')
const urllib = require('urllib')
const db = require('limbo').use('anmoyi')
const wxSrv = require('../pay/weixin')
const sockSrv = require('../service/socket')

exports.getAuth = async ctx => {
  let {uid} = ctx.query
  let data = {
    appid: config.weixin.appid,
    response_type: 'code',
    scope: 'snsapi_base',
    state: 'snsapi_base',
    redirect_uri: `${config.host}/wx/oauthcode?uid=${uid}`
  }
  ctx.redirect(`${config.weixin.authUrl}?${qs.stringify(data)}`)
}

exports.getCode = async ctx => {
  let {uid, code} = ctx.query
  let data = {
    appid: config.weixin.appid,
    secret: config.weixin.secret,
    code: code,
    grant_type: 'authorization_code'
  }
  let rt = await urllib.request(`${config.weixin.tokenUrl}?${qs.stringify(data)}`, {dataType: 'json'})
  if (rt.data.errcode) ctx.throw(400, rt.data.errmsg)
  ctx.redirect(`${config.host}/${config.h5pay}?uid=${uid}&openId=${rt.data.openid}`)
}

exports.getPreArgs = async ctx => {
  let {uid, openId, pt} = ctx.query
  let [money, time] = pt.split(':')
  let device = await db.device.findByUid(uid)
  let {_placeId} = device
  let place = await db.place.findById(_placeId).exec()
  let {_agentId} = place
  let order = await db.order.init({money, time, openId, uid, _placeId, _agentId})
  let args = await wxSrv.getBrandWCPayRequestParams(openId, `${order._id}`, money * 100)
  ctx.body = args
}

exports.payIndex = async ctx => {
  let {uid, openId} = ctx.query
  console.log('payindex', uid, openId)
  let device = await db.device.findByUid(uid)
  let payInfo = await device.getPayInfo()
  payInfo.openId = openId
  try {
    await device.isReady()
  } catch (e) {
    e.type = 'payIndex:check'
    console.error(e)
    payInfo.status = 'fault'
  }
  await ctx.render('pay', payInfo)
}

// { appid: 'wxf52adc6b55f21cd5',
// bank_type: 'CFT',
// cash_fee: '1',
// fee_type: 'CNY',
// is_subscribe: 'N',
// mch_id: '1500195282',
// nonce_str: '4h5bQCjgPh5SD5SqNWrngEMLxw7FoE1i',
// openid: 'orer70rQpj1XDnLW0KMsqHQpamGM',
// out_trade_no: '5af920137ecb7d5bd8d15b63',
// result_code: 'SUCCESS',
// return_code: 'SUCCESS',
// sign: '2372374FD0694F0E3EE1C839AB7BEDFE',
// time_end: '20180514133523',
// total_fee: '1',
// trade_type: 'JSAPI',
// transaction_id: '4200000128201805149185036808' }
exports.payNotify = async ctx => {
  let {wxSucc, wxMsg} = ctx
  if (wxSrv.sign(wxMsg) !== wxMsg.sign) ctx.throw(403)
  if (wxMsg.result_code !== 'SUCCESS') return wxSucc()
  let _orderId = wxMsg.out_trade_no
  let order = await db.order.findById(_orderId).exec()
  if (!order) {
    console.log(`payNotify:order not found: ${JSON.stringify(wxMsg)}`)
    return wxSucc()
  }
  // 已处理，重复消息
  if (order.isPayed()) return wxSucc()
  try {
    await order.switchPayStatus(1)
    await sockSrv.start(order.uid, order.time)
    await order.switchDeviceStatus(1)
    wxSucc()
  } catch (e) {
    e.type = 'payNotify-error'
    console.error(e)
    await wxSrv.refund(_orderId, order.money)
    await order.switchPayStatus(2)
    wxSucc()
  }
}
