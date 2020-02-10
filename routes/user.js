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
const nodemailer = require('nodemailer')

const mailConfig = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: '18351818012@163.com',
        pass: 'EDUTHU5g5'
    }
}

const transporter = nodemailer.createTransport(mailConfig)

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
                res.send(JSON.stringify({
                    code: statusCode.USERNAME_DUP,
                    message: 'The username has been registered'
                }, null, 5))
            } else {
                User.findOne({phone: phone}, (err, user) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        // phone duplication
                        if (user) {
                            res.send(JSON.stringify({
                                code: statusCode.PHONE_DUP,
                                message: 'The phone number has been registered'
                            }, null, 5))
                        } else {
                            User.findOne({email: email}, (err, user) => {
                                if (err) {
                                    res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                } else {
                                    // email duplication
                                    if (user) {
                                        res.send(JSON.stringify({
                                            code: statusCode.EMAIL_DUP,
                                            message: 'The email has been registered'
                                        }, null, 5))
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
                                        let token = jwt.sign({username: username}, config.superSecret, {
                                            expiresIn: 3600
                                        })
                                        let url = `http://localhost:3000/activateAccount?username=${username}&token=${token}`
                                        var mail = {
                                            from: 'Qianxiong Xu<18351818012@163.com>',
                                            subject: '[Custom Outfit App]Activate Your Account',
                                            to: email,
                                            html: `<p>Dear ${name},</p><p>Thank you for registering account for <b>Custom Outfit App</b>, please click on <a href="${url}">${url}</a> within 1 hour to activate your account!</p><p>Best regards,</p><p>Custom Outfit App</p>`
                                        }
                                        transporter.sendMail(mail, (error, info) => {
                                            if (error) {
                                                return console.log(error)
                                            } else {
                                                console.log('mail sent:', info.response)
                                                user.save((err) => {
                                                    if (err) {
                                                        res.send(JSON.stringify({
                                                            code: statusCode.ERR_NOK,
                                                            error: err
                                                        }, null, 5))
                                                    } else {
                                                        res.send(JSON.stringify({
                                                            code: statusCode.ERR_OK,
                                                            message: 'Successfully add user'
                                                        }, null, 5))
                                                    }
                                                })

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

/**
 * GET
 * activateAccount - use the url in email to activate account
 * @param req
 * @param res
 */
router.activateAccount = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let username = req.query.username
    let token = req.query.token

    if (!token) {
        res.send(JSON.stringify({code: statusCode.INV_TOKEN, message: 'The token is invalid, fail to activate'}, null, 5))
    } else {
        jwt.verify(token, config.superSecret, (err, decoded) => {
            if (err) {
                res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
            } else {
                req.decoded = decoded

                if (decoded.username !== username) {
                    res.send(JSON.stringify({code: statusCode.INV_U_T, message: 'The token and username are not a pair'}, null, 5))
                } else {
                    User.find({username: username}, (err, user) => {
                        if (err) {
                            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                        } else {
                            if (user.length === 0) {
                                res.send(JSON.stringify({
                                    code: statusCode.USER_NE,
                                    message: 'The user not exists'
                                }, null, 5))
                            } else {
                                user = user[0]
                                user.status = 0

                                user.save((err) => {
                                    if (err) {
                                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                    } else {
                                        res.send(JSON.stringify({
                                            code: statusCode.ERR_OK,
                                            message: 'Successfully activate account'
                                        }, null, 5))
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
 * updateUser - modify password, avatar and name
 * params:
 *  - id
 *  - body
 * @param req
 * @param res
 */
router.updateUser = (req, res) => {
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

                User.find({_id: req.params.id}, (err, user) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        if (user.length === 0) {
                            res.send(JSON.stringify({
                                code: statusCode.USER_NE,
                                message: 'The user not exists'
                            }, null, 5))
                        } else {
                            user = user[0]
                            let password = req.body.password
                            if (password && password !== user.password) {
                                password = sha1(password)
                            } else {
                                password = user.password
                            }
                            user.password = password
                            user.name = req.body.name
                            user.avatar = req.body.avatar

                            user.save((err) => {
                                if (err) {
                                    res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                                } else {
                                    res.send(JSON.stringify({
                                        code: statusCode.ERR_OK,
                                        message: 'Successfully update user'
                                    }, null, 5))
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
 * deleteUser - delete one user
 * params:
 *  - id
 * @param req
 * @param res
 */
router.deleteUser = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    // jwt
    let token = req.body.token
    if (!token) {
        res.send(JSON.stringify({code: statusCode.USER_NL, message: 'Not login yet, please login'}, null, 5))
    } else {
        jwt.verify(token, config.superSecret, (err) => {
            if (err) {
                res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
            } else {
                User.findByIdAndRemove(req.params.id, (err) => {
                    if (err) {
                        res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
                    } else {
                        res.send(JSON.stringify({
                            code: statusCode.ERR_OK,
                            message: 'Successfully delete user'
                        }, null, 5))
                    }
                })
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

    User.find({username: req.body.username}, (err, user) => {
        if (err) {
            res.send(JSON.stringify({code: statusCode.ERR_NOK, error: err}, null, 5))
        } else {
            if (user.length === 0) {
                res.send(JSON.stringify({code: statusCode.USER_NE, message: 'The username is not registered'}, null, 5))
            } else {
                user = user[0]
                if (user.password !== sha1(req.body.password)) {
                    res.send(JSON.stringify({code: statusCode.USER_WP, message: 'The password is wrong'}, null, 5))
                } else if (user.status !== "0") {
                    res.send(JSON.stringify({code: statusCode.INACTIVATE, message: 'The account has not been activated'}, null, 5))
                }else {
                    let token = jwt.sign({username: user.username}, config.superSecret, {
                        expiresIn: 3600
                    })
                    res.send(JSON.stringify({
                        code: statusCode.ERR_OK,
                        token: token,
                        message: 'Successfully login, use your token'
                    }, null, 5))
                }
            }
        }
    })
}

/**
 * GET
 * getToken - generate a token for oauth2
 * @param req
 * @param res
 */
router.getToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let token = jwt.sign({username: req.params.username}, config.superSecret, {
        expiresIn: 3600
    })
    res.send(JSON.stringify({
        code: statusCode.ERR_OK,
        token: token,
        message: 'Successfully login, use your token'
    }, null, 5))
}

module.exports = router
