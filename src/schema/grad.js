module.exports = function (Schema) {
  const Grad = new Schema({
    name: String,
    price: String,
    time: String,
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

  Grad.statics.getAll = function () {
    return this.find({}).exec()
  }

  Grad.statics.getTimes = function () {
    return this.time.split(',')
  }

  Grad.statics.getPrices = function () {
    return this.price.split(',')
  }

  return Grad
}
