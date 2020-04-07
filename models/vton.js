/**
 * @Author: Sam
 * @Date: 2020/4/7
 * @Version: 1.0
 **/
/**
 * vton schema and model
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const vton = new Schema({
    pose: {type: String, required: true},
    cloth: {type: String, required: true},
    result: {type: String, required: true},
    createAt: String
})

const dict = {
    'schema': vton,
    'model': mongoose.model('Vton', vton)
}

module.exports = dict
