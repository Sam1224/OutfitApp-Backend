/**
 * @Author: Sam
 * @Date: 2019/12/23
 * @Version: 1.0
 **/
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const admin = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  phone: {type: String, required: true}
}, {
  collection: 'admin'
})

module.exports = mongoose.model('Admin', admin)
