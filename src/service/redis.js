'use strict'

const config = require('config')
const redis = require('thunk-redis')

const client = module.exports = redis.createClient(config.redis_array)

client
  .on('error', function (err) {
    err.class = 'thunk-redis'
    if (err.code === 'ENETUNREACH') throw err
  })
  .on('close', function (err) {
    err = err || new Error('Redis client closed!')
    throw err
  })
client.isReady = new Promise(function (resolve, reject) {
  client.once('connect', () => {
    resolve()
  })
})
