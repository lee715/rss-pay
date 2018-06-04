module.exports = function (Schema) {
  const Order = new Schema({
    money: Number,
    time: Number,
    status: {
      type: String,
      default: 'PREPAY'
    },
    mode: {
      type: String,
      default: 'WX'
    },
    openId: String,
    uid: String,
    _agentId: Schema.Types.ObjectId,
    _placeId: Schema.Types.ObjectId,
    serviceStatus: {
      type: String,
      default: 'BEFORE'
    },
    created: {
      type: Date,
      default: Date.now
    },
    updated: {
      type: Date,
      default: Date.now
    }
  }, {
    toJSON: {
      virtuals: true,
      getters: true
    }
  })

  Order.statics.init = function (data) {
    return this.create(data)
  }

  Order.methods.switchPayStatus = function (status) {
    switch (status) {
      case 2:
        return this.update({status: 'REFUND'}).exec()
      case 1:
        return this.update({status: 'SUCCESS'}).exec()
      case 0:
        return this.update({status: 'PREPAY'}).exec()
    }
  }

  Order.methods.switchDeviceStatus = function (status) {
    switch (status) {
      case 1:
        return this.update({serviceStatus: 'STARTED'}).exec()
      case 0:
        return this.update({serviceStatus: 'BEFORE'}).exec()
    }
  }

  Order.methods.isPayed = function () {
    return this.status === 'SUCCESS'
  }

  return Order
}
