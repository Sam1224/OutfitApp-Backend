/**
 * @Author: Sam
 * @Date: 2020/4/7
 * @Version: 1.0
 **/
/**
 * retrieval schema and model
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const retrieval = new Schema({
    cloth: {type: String, required: true},
    results: [{type: String, required: true}],
    createAt: String
})

const dict = {
    'schema': retrieval,
    'model': mongoose.model('Retrieval', retrieval)
}

module.exports = dict
