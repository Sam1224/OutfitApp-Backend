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

const user = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    name: String,
    avatar: String,
    status: {type: Number, default: 1}
}, {
    collection: 'user'
})

module.exports = mongoose.model('User', user)
