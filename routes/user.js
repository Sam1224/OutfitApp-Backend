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
