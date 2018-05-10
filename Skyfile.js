/* global sneaky */
sneaky('ay', function () {
  this.description = 'Deploy to dev environment'
  this.user = 'root'
  this.host = '47.74.252.32'
  this.path = '~/server/bk-wx/'
  this.filter = `
+ config
+ config/default.json
+ src**
+ static**
+ view**
+ yarn.lock
+ package.json
+ app.js
+ apiclient_cert.p12
- *
`
  this.after('yarn && pm2 restart bk-wx')
  this.overwrite = true
  this.nochdir = true
})
