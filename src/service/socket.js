const Redis = require('ioredis')

const subRedis = new Redis()
const pubRedis = new Redis()

const listeners = {}

subRedis.on('message', (ch, msg) => {
  msg = JSON.parse(msg)
  let {uid, cmd} = msg
  let err = null
  if (!uid || !cmd) return null
  if (msg.errmsg) err = new Error(msg.errmsg)
  let lisKey = `${cmd}:${ch}`
  let lsns = listeners[lisKey]
  if (!lsns) return null
  for (let lsn of lsns) {
    lsn(err, msg)
  }
})

exports.start = async (uid, time) => {
  return new Promise((resolve, reject) => {
    const msg = {
      cmd: 'start',
      uid: uid,
      time: time
    }
    addListener(msg, (err, rt) => {
      if (err) return reject(err)
      resolve(rt)
    })
    setTimeout(() => {
      clearListener(msg)
      reject(new Error('StartTimeout'))
    }, 5000)
  })
}

exports.check = async (uid) => {
  return new Promise((resolve, reject) => {
    const msg = {
      cmd: 'check',
      uid: uid
    }
    addListener(msg, (err, rt) => {
      if (err) return reject(err)
      resolve(rt)
    })
    setTimeout(() => {
      clearListener(msg)
      reject(new Error('CheckTimeout'))
    }, 5000)
  })
}

const addListener = (msg, cb) => {
  let skey = `s:devices@${msg.uid}`
  let ckey = `c:devices@${msg.uid}`
  subRedis.subscribe(ckey)
  pubRedis.publish(skey, JSON.stringify(msg))
  let lisKey = `${msg.cmd}:${ckey}`
  if (!listeners[lisKey]) listeners[lisKey] = []
  listeners[lisKey].push(cb)
}

const clearListener = (msg) => {
  let ckey = `c:devices@${msg.uid}`
  let lisKey = `${msg.cmd}:${ckey}`
  delete listeners[lisKey]
}
