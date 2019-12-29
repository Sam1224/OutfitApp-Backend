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

/**
 * GET
 * findOne - get one admin
 * params:
 *  - id
 *  - body
 * @param req
 * @param res
 */
router.findOne = (req, res) => {
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

                Admin.find({_id: req.params.id}, (err, admin) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        res.send(JSON.stringify({code: statusCode.ERR_OK, data: admin}, null, 5))
                    }
                })
            }
        })
    }
}

/**
 * POST
 * addAdmin - add one admin
 * @param req
 * @param res
 */
router.addAdmin = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // params
    let username = req.body.username
    let password = req.body.password
    let phone = req.body.phone
    let email = req.body.email

    // jwt
    let token = req.body.token
    if (!token) {
        res.send(JSON.stringify({code: statusCode.USER_NL, message: 'Not login yet, please login'}, null, 5))
    } else {
        Admin.findOne({username: username}, (err, admin) => {
            if (err) {
                res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
            } else {
                // username duplication
                if (admin) {
                    res.send(JSON.stringify({code: statusCode.USERNAME_DUP, message: 'The username has been registered'}, null, 5))
                } else {
                    Admin.findOne({phone: phone}, (err, admin) => {
                        if (err) {
                            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                        } else {
                            // phone duplication
                            if (admin) {
                                res.send(JSON.stringify({code: statusCode.PHONE_DUP, message: 'The phone number has been registered'}, null, 5))
                            } else {
                                Admin.findOne({email: email}, (err, admin) => {
                                    if (err) {
                                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                    } else {
                                        // email duplication
                                        if (admin) {
                                            res.send(JSON.stringify({code: statusCode.EMAIL_DUP, message: 'The email has been registered'}, null, 5))
                                        } else {
                                            admin = new Admin()
                                            admin.username = username
                                            admin.password = sha1(password)
                                            admin.phone = phone
                                            admin.email = email

                                            // add admin
                                            admin.save((err) => {
                                                if (err) {
                                                    res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                                } else {
                                                    res.send(JSON.stringify({code: statusCode.ERR_OK, message: 'Successfully add admin'}, null , 5))
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
}

/**
 * PUT
 * updateAdmin - modify password
 * @param req
 * @param res
 */
router.updateAdmin = (req, res) => {
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

                Admin.find({_id: req.params.id}, (err, admin) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        if (admin.length === 0) {
                            res.send(JSON.stringify({code: statusCode.USER_NE, message: 'The admin not exists'}, null, 5))
                        } else {
                            admin = admin[0]
                            let password = req.body.password
                            if (password && password !== admin.password) {
                                password = sha1(password)
                            } else {
                                password = admin.password
                            }
                            admin.password = password

                            admin.save((err) => {
                                if (err) {
                                    res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                } else {
                                    res.send(JSON.stringify({code: statusCode.ERR_OK, message: 'Successfully update admin'}, null, 5))
                                }
                            })
                        }
                    }
                })
            }
        })
    }
}

/**
 * DELETE
 * deleteAdmin - delete one admin
 * params:
 *  - id
 * @param req
 * @param res
 */
router.deleteAdmin = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // jwt
    let token = req.body.token
    if (!token) {
        res.send(JSON.stringify({code: statusCode.USER_NL, message: 'Not login yet, please login'}, null, 5))
    } else {
        Admin.findByIdAndRemove(req.params.id, (err, admin) => {
            if (err) {
                res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
            } else {
                res.send(JSON.stringify({code: statusCode.ERR_OK, message: 'Successfully delete admin'}, null, 5))
            }
        })
    }
}

/**
 * POST
 * login - login and generate a token
 * @param req
 * @param res
 */
router.login = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    Admin.find({username: req.body.username}, (err, admin) => {
        if (err) {
            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
        } else {
            if (admin.length === 0) {
                res.send(JSON.stringify({code: statusCode.USER_NE, message: 'The username is not registered'}, null, 5))
            } else {
                admin = admin[0]
                if (admin.password !== sha1(req.body.password)) {
                    res.send(JSON.stringify({code: statusCode.USER_WP, message: 'The password is wrong'}, null, 5))
                } else {
                    let token = jwt.sign({username: admin.username}, config.superSecret, {
                        expiresIn: 3600
                    })
                    res.send(JSON.stringify({code: statusCode.ERR_OK, token: token, message:'Successfully login, use your token'}, null, 5))
                }
            }
        }
    })
}

module.exports = router
