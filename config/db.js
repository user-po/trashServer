/**
 * 链接数据库
 */
const mongoose = require('mongoose')
const config = require('./index')
const log4j = require('./../utils/log')
mongoose.connect(config.URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},{autoIndex: false})
const db = mongoose.connection;

db.on('error',()=>{
    log4j.error('***数据库连接失败***')
})

db.on('open',()=>{
    log4j.info('***数据库连接成功***')
})