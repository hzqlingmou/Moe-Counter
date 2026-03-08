"use strict";

const logger = require("../utils/index").logger;
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    num: { type: Number, required: true }
  },
  { collection: 'tb_count', versionKey: false }
);

const mongodbURL = process.env.DB_URL || false;

if (!mongodbURL) {
  logger.error("DB_URL is not set");
  process.exit(1);
}

mongoose.connect(mongodbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info("连接 mongo 数据库成功")
})
.catch((error) => {
  logger.error("连接 mongo 数据库失败:" + error.message)
})

const Count = mongoose.connection.model("Count", schema);

function getNum(name) {
  return Count.findOne({ name }, "-_id -__v").exec();
}

function getAll() {
  return Count.find({}, "-_id -__v").exec();
}

function setNum(name, num) {
  return Count.findOneAndUpdate(
    { name },
    { name, num },
    { upsert: true }
  ).exec();
}

function setNumMulti(counters) {
  const bulkOps = counters.map((obj) => {
    const { name, num } = obj;
    return {
      updateOne: {
        filter: { name },
        update: { name, num },
        upsert: true,
      },
    };
  });

  return Count.bulkWrite(bulkOps, { ordered: false });
}

module.exports = {
  getNum,
  getAll,
  setNum,
  setNumMulti,
};
