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
  return Grad
}
