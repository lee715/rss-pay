const sockSrv = require('../service/socket')
const redis = require('../service/redis')

module.exports = function (Schema) {
  let deviceSchema
  deviceSchema = new Schema({
    uid: String,
    name: String,
    _placeId: Schema.Types.ObjectId,
    disabled: {
      type: Boolean,
      'default': false
    },
    type: {
      type: String,
      'default': 'normal'
    },
    created: {
      type: Date,
      'default': Date.now
    }
  }, {
    toJSON: {
      virtuals: true,
      getters: true
    }
  })
  deviceSchema.methods.isReady = async function () {
    if (await this.getStatus() !== 'idle') return false
    await sockSrv.check(this.uid)
    return true
  }
  deviceSchema.methods.getStatus = function () {
    return redis.get(`devices:status:${this.uid}`)
  }
  deviceSchema.methods.getPayInfo = async function () {
    const PlaceModel = this.model('Place')
    if (!this._placeId) return null
    let res = this.toJSON()
    res.status = await this.getStatus()
    let place = await PlaceModel.findById(this._placeId).exec()
    res.placeName = place.name
    let placeFullInfo = await place.getFullInfo()
    res.times = placeFullInfo.times
    res.prices = placeFullInfo.prices
    return res
  }
  deviceSchema.statics.findByUid = function (uid) {
    return this.findOne({uid: uid}).exec()
  }

  deviceSchema.statics.findByPlaceId = function (_placeId) {
    return this.find({_placeId}).exec()
  }

  deviceSchema.statics.findByPage = function (_preId, count) {
    count = count || 100
    let query = _preId ? {_id: {$gt: _preId}} : {}
    return this.find(query).sort({_id: 1}).limit(count).exec()
  }
  return deviceSchema
}
