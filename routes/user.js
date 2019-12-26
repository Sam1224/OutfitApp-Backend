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

/**
 * POST
 * addUser - add one user
 * @param req
 * @param res
 */
router.addUser = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // params
    let username = req.body.username
    let password = req.body.password
    let phone = req.body.phone
    let email = req.body.email
    let name = req.body.name
    let status = 1
    let outfits = []

    User.findOne({username: username}, (err, user) => {
        if (err) {
            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
        } else {
            // username duplication
            if (user) {
                res.send(JSON.stringify({code: statusCode.USERNAME_DUP, message: 'The username has been registered'}, null, 5))
            } else {
                User.findOne({phone: phone}, (err, user) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        // phone duplication
                        if (user) {
                            res.send(JSON.stringify({code: statusCode.PHONE_DUP, message: 'The phone number has been registered'}, null, 5))
                        } else {
                            User.findOne({email: email}, (err, user) => {
                                if (err) {
                                    res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                } else {
                                    // email duplication
                                    if (user) {
                                        res.send(JSON.stringify({code: statusCode.EMAIL_DUP, message: 'The email has been registered'}, null, 5))
                                    } else {
                                        user = new User()
                                        user.username = username
                                        user.password = sha1(password)
                                        user.phone = phone
                                        user.email = email
                                        user.name = name
                                        user.avatar = null
                                        user.status = status
                                        user.outfits = outfits

                                        // add user
                                        user.save((err) => {
                                            if (err) {
                                                res.send(JSON.stringify({code: ERR_NOK, error: err}, null, 5))
                                            } else {
                                                res.send(JSON.stringify({code: ERR_OK, message: 'Successfully add user'}, null , 5))
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

module.exports = router
