/* global sneaky */
sneaky('ay', function () {
  this.description = 'Deploy to dev environment'
  this.user = 'root'
  this.host = '47.96.158.74'
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
- *
`
  this.after('yarn && pm2 restart app')
  this.overwrite = true
  this.nochdir = true
})

sneaky('hm', function () {
  this.description = 'Deploy to dev environment'
  this.user = 'root'
  this.host = '47.106.70.32'
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
- *
`
  this.after('yarn && pm2 restart weixin')
  this.overwrite = true
  this.nochdir = true
})
