const config = require('config')
const fs = require('fs')
const uuid = require('uuid')
const WxPay = require('weixin-pay')

const { mch_id, appid, body, detail, total_fee, key } = config.weixin
const {ip, host} = config

const wxpay = WxPay({
  appid: appid,
  mch_id: mch_id,
  partner_key: key,
  pfx: fs.readFileSync('apiclient_cert.p12')
})

module.exports = {

  refund: async (order, money) => {
    let param = {
      appid: appid,
      mch_id: mch_id,
      op_user_id: mch_id,
      out_refund_no: uuid.v4(),
      total_fee: money,
      refund_fee: money,
      out_trade_no: order
    }
    return new Promise((resolve, reject) => {
      wxpay.refund(param, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },

  unifiedorder: async (productId, openId) => {
    return new Promise((resolve, reject) => {
      wxpay.createUnifiedOrder({
        device_info: 'WEB',
        nonce_str: uuid.v4(),
        body: body,
        detail: detail || '',
        out_trade_no: productId,
        total_fee: total_fee,
        spbill_create_ip: ip,
        time_start: wxDate(),
        notify_url: `${host}/wx/notify`,
        trade_type: 'NATIVE',
        product_id: productId,
        openid: openId
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  },

  getBrandWCPayRequestParams: async (openId, order, cost) => {
    return new Promise((resolve, reject) => {
      wxpay.getBrandWCPayRequestParams({
        body: body,
        detail: detail || '',
        out_trade_no: order,
        total_fee: Math.round(cost),
        spbill_create_ip: ip,
        notify_url: `${host}/wx/notify`,
        openid: openId
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

function wxDate (date) {
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
  let str = date.toJSON()
  return str.replace(/-|T|:|.\d{3}Z/g, '')
}
