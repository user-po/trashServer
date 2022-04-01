const mongoose = require("mongoose");
const { autoIncrement } = require("mongoose-plugin-autoinc");

const uuidSchema = mongoose.Schema({
  key: String,
  used:Boolean,
  "createTime": {
    type: Date,
    default: Date.now(),
  }, //创建时间
  "updateTime": {
    type: Date,
    default: Date.now(),
  }, //更新时间
});
uuidSchema.plugin(autoIncrement, "uuid");
module.exports = mongoose.model("uuid", uuidSchema);
