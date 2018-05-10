const config = require('config')
const qs = require('querystring')
const urllib = require('urllib')
const db = require('limbo').use('anmoyi')
const wxSrv = require('../pay/weixin')

exports.getAuth = async ctx => {
  let {uid} = ctx.query
  let data = {
    appid: config.weixin.appid,
    response_type: 'code',
    scope: 'snsapi_base',
    state: 'snsapi_base',
    redirect_uri: `${config.host}/api/wx/oauthcode?uid=${uid}`
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
  let rt = await urllib.request(`${config.weixin.tokenUrl}?${qs.stringify(data)}`, {json: true})
  console.log(rt)
  ctx.redirect(`${config.host}/${config.h5pay}?uid=${uid}&openId=${rt.openid}`)
}

exports.getPreArgs = async ctx => {
  let {uid, openId, pt} = ctx.query
  let [money, time] = pt.split(':')
  let device = await db.device.findByUid(uid)
  let {_placeId, _agentId} = device
  let order = await db.order.init({money, time, openId, uid, _placeId, _agentId})
  let args = await wxSrv.getBrandWCPayRequestParams(openId, `${order._id}`, money * 100)
  ctx.body = args
}

exports.payIndex = async ctx => {
  let {uid, openId} = ctx.query
  // let device = await db.device.findByUid(uid)
  await ctx.render('pay', {
    uid,
    openId,
    time: [2, 5],
    price: [1, 2],
    placeName: 'test',
    name: 'test',
    status: 'idle'
  })
}
