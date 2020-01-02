/**
 * @Author: Sam
 * @Date: 2019/12/23
 * @Version: 1.0
 **/
/**
 * User schema
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const origin = new Schema({
  url: {type: String, required: true},
  types: {type: String, default: '0'}
})

const result = new Schema({
  url: {type: String, required: true},
  types: {type: String, default: '0'}
})

const outfit = new Schema({
  images: [{
    origin: [origin],
    results: [result]
  }],
  category: {type: String, default: '0'},
  createAt: String
})

const user = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  phone: {type: String, required: true},
  email: {type: String, required: true},
  name: String,
  avatar: String,
  status: {type: String, default: '1'},
  outfits: [outfit]
}, {
  collection: 'user'
})

module.exports = mongoose.model('User', user)
