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
var status = require('../public/javascripts/status')

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
            res.send(JSON.stringify({code: status.ERR_NOK, error: err}, null, 5))
        } else {
            res.send(JSON.stringify({code: status.ERR_OK, data: users}, null, 5))
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
    let type = req.params.type
    let status = req.params.status

    // construct query dict
    let query = {}

    if (type === status.USERNAME) {
        query.username = req.params.query
    } else if (type === status.PHONE) {
        query.phone = req.params.query
    } else if (type === status.EMAIL) {
        query.email = req.params.query
    } else if (type === status.NAME) {
        query.name = req.params.query
    } else {
        query._id = req.params.query
    }

    if (status === status.ACTIVATE) {
        query.status = 1
    } else {
        query.status = 0
    }

    User.find(query, (err, user) => {
        if (err) {
            res.send(JSON.stringify({code: status.ERR_NOK, error: err}, null, 5))
        } else {
            res.send(JSON.stringify({code: status.ERR_OK, data: user}, null, 5))
        }
    })
}

module.exports = router
