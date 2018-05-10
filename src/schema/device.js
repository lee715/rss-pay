
module.exports = function (Schema) {
  let deviceSchema
  deviceSchema = new Schema({
    uid: String,
    name: String,
    _placeId: Schema.Types.ObjectId,
    status: {
      type: String,
      'default': 'init'
    },
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
    },
    statusUpdated: {
      type: Date,
      'default': Date.now
    }
  }, {
    toJSON: {
      virtuals: true,
      getters: true
    }
  })
  deviceSchema.virtual('realStatus').get(function () {
    if (Date.now() - this.statusUpdated < 1000 * 60 * 3) {
      return this.status
    } else {
      return 'fault'
    }
  })
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
