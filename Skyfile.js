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
- *
`
  this.after('yarn && pm2 restart app')
  this.overwrite = true
  this.nochdir = true
})
