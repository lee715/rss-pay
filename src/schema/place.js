module.exports = function (Schema) {
  const Place = new Schema({
    name: String,
    province: String,
    city: String,
    district: String,
    company: String,
    email: String,
    bankName: String,
    bankAccount: String,
    // 客服人员id
    _salesmanId: Schema.Types.ObjectId,
    // 客服人员分成模式
    salesmanMode: {
      type: String,
      default: 'percent'
    },
    // 客服人员分成数额
    salesmanCount: {
      type: Number,
      default: 0
    },
    // 代理商id
    _agentId: Schema.Types.ObjectId,
    agentMode: {
      type: String,
      default: 'percent'
    },
    agentCount: {
      type: Number,
      default: 0
    },
    contacts: {
      type: Schema.Types.Mixed,
      default: []
    },
    password: String,
    created: {
      type: Date,
      default: Date.now
    }
  }, {
    toJSON: {
      virtuals: true,
      getters: true
    }
  })
  Place.virtual('location')
    .get(function () {
      return `${this.province}-${this.city}-${this.district}`
    })
  Place.statics.batch = function () {
    return this.find({}).exec()
  }
  return Place
}
