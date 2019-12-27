/**
 * @Author: Sam
 * @Date: 2019/12/27
 * @Version: 1.0
 **/
var express = require('express')
var Admin = require('../models/admin')
var router = express.Router()
var sha1 = require('sha1')
var jwt = require('jsonwebtoken')
var config = require('../config')
var statusCode = require('../public/javascripts/status')

/**
 * GET
 * findAll - get all admins
 * @param req
 * @param res
 */
router.findAll = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // jwt
    let token = req.body.token
    if (!token) {
        res.send(JSON.stringify({code: statusCode.USER_NL, message: 'Not login yet, please login'}, null, 5))
    } else {
        jwt.verify(token, config.superSecret, (err, decoded) => {
            if (err) {
                res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
            } else {
                req.decoded = decoded

                Admin.find((err, admins) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        res.send(JSON.stringify({code: statusCode.ERR_OK, data: admins}, null, 5))
                    }
                })
            }
        })
    }
}

module.exports = router
