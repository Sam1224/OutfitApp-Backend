/**
 * @Author: Sam
 * @Date: 2019/12/26
 * @Version: 1.0
 **/
var express = require('express')
var User = require('../models/user')
var router = express.Router()
var sha1 = require('sha1')
var jwt = require('jsonwebtoken')
var config = require('../config')
var statusCode = require('../public/javascripts/status')

/**
 * GET
 * findAll - get all users
 * @param req
 * @param res
 */
router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    User.find((err, users) => {
        if (err) {
            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
        } else {
            res.send(JSON.stringify({code: statusCode.ERR_OK, data: users}, null, 5))
        }
    })
}

/**
 * GET
 * findOne - get one user by _id
 * params:
 * - option group 1:
 *  - option 1: _id + type=0(default)
 *  - option 2: username + type=1
 *  - option 3: phone + type=2
 *  - option 4: email + type=3
 *  - option 5: name + type=4
 * - option group 2:
 *  - option 1: status=0(default)
 *  - option 2: status=1
 * @param req
 * @param res
 */
router.findOne = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // params
    let type = req.query.type
    let status = req.query.status

    // construct query dict
    let query = {}

    if (type === statusCode.USERNAME) {
        query.username = req.query.query
    } else if (type === statusCode.PHONE) {
        query.phone = req.query.query
    } else if (type === statusCode.EMAIL) {
        query.email = req.query.query
    } else if (type === statusCode.NAME) {
        query.name = req.query.query
    } else {
        query._id = req.query.query
    }

    if (status === statusCode.ACTIVATE) {
        query.status = 1
    } else {
        query.status = 0
    }

    User.find(query, (err, user) => {
        if (err) {
            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
        } else {
            res.send(JSON.stringify({code: statusCode.ERR_OK, data: user}, null, 5))
        }
    })
}

module.exports = router
