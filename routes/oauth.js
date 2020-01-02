/**
 * @Author: Sam
 * @Date: 2020/1/2
 * @Version: 1.0
 **/
var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var config = require('../config')
var axios = require('axios')
var statusCode = require('../public/javascripts/status')
const superSecret = config.superSecret

/**
 * GET
 * getGithubToken - github oauth2
 * @param req
 * @param res
 */
router.getGithubToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let client_id = req.query.client_id
    let client_secret = req.query.client_secret
    let code = req.query.code
    axios.post(`https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`, {}, {
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        let resdata = response.data
        let accessToken = resdata.access_token
        if (accessToken) {
            axios.get(`https://api.github.com/user?access_token=${accessToken}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                let profile = response.data
                let account = {
                    username: profile.login,
                    name: profile.name,
                    avatar: profile.avatar_url,
                    type: statusCode.GITHUB
                }
                let token = jwt.sign({username: account.username}, superSecret, {
                    expiresIn: 3600
                })
                res.send(JSON.stringify({
                    code: statusCode.ERR_OK,
                    token: token,
                    account: account,
                    message: 'Successfully login, use your token'
                }, null, 5))
            })
        } else {
            res.send(JSON.stringify({
                code: statusCode.ERR_NOK,
                message: 'Invalid token'
            }, null, 5))
        }
    }).catch(e => {
        console.log(e)
    })
}

/**
 * GET
 * getGitlabToken - gitlab oauth2
 * @param req
 * @param res
 */
router.getGitlabToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let client_id = req.query.client_id
    let client_secret = req.query.client_secret
    let code = req.query.code
    let redirect_uri = req.query.redirect_uri
    axios.post(`https://gitlab.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`, {}, {
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        let resdata = response.data
        let accessToken = resdata.access_token
        if (accessToken) {
            axios.get(`https://gitlab.com/api/v4/user?access_token=${accessToken}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                let profile = response.data
                let account = {
                    username: profile.username,
                    name: profile.name,
                    avatar: profile.avatar_url,
                    type: statusCode.GITLAB
                }
                let token = jwt.sign({username: account.username}, superSecret, {
                    expiresIn: 3600
                })
                res.send(JSON.stringify({
                    code: statusCode.ERR_OK,
                    token: token,
                    account: account,
                    message: 'Successfully login, use your token'
                }, null, 5))
            })
        } else {
            res.send(JSON.stringify({
                code: statusCode.ERR_NOK,
                message: 'Invalid token'
            }, null, 5))
        }
    }).catch(e => {
        console.log(e)
    })
}

/**
 * GET
 * getGiteeToken - gitee oauth2
 * @param req
 * @param res
 */
router.getGiteeToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let client_id = req.query.client_id
    let client_secret = req.query.client_secret
    let code = req.query.code
    let grant_type = req.query.grant_type
    let redirect_uri = req.query.redirect_uri
    axios.post(`https://gitee.com/oauth/token?grant_type=${grant_type}&code=${code}&client_id=${client_id}&redirect_uri=${redirect_uri}&client_secret=${client_secret}`, {}, {
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        let resdata = response.data
        let accessToken = resdata.access_token
        if (accessToken) {
            axios.get(`https://gitee.com/api/v5/user?access_token=${accessToken}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                let profile = response.data
                let account = {
                    username: profile.login,
                    name: profile.name,
                    avatar: profile.avatar_url,
                    type: statusCode.GITEE
                }
                let token = jwt.sign({username: account.username}, superSecret, {
                    expiresIn: 3600
                })
                res.send(JSON.stringify({
                    code: statusCode.ERR_OK,
                    token: token,
                    account: account,
                    message: 'Successfully login, use your token'
                }, null, 5))
            })
        } else {
            res.send(JSON.stringify({
                code: statusCode.ERR_NOK,
                message: 'Invalid token'
            }, null, 5))
        }
    }).catch(e => {
        console.log(e)
    })
}

/**
 * GET
 * getBitbucketToken - bitbucket oauth2
 * @param req
 * @param res
 */
router.getBitbucketToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let access_token = req.query.access_token
    axios.get(`https://bitbucket.org/api/2.0/user?access_token=${access_token}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        let profile = response.data
        let account = {
            username: profile.username,
            name: profile.display_name,
            avatar: profile.links.avatar.href,
            type: statusCode.BITBUCKET
        }
        let token = jwt.sign({username: account.username}, superSecret, {
            expiresIn: 3600
        })
        res.send(JSON.stringify({
            code: statusCode.ERR_OK,
            token: token,
            account: account,
            message: 'Successfully login, use your token'
        }, null, 5))
    })
}

/**
 * GET
 * getWeiboToken - weibo oauth2
 * @param req
 * @param res
 */
router.getWeiboToken = (req, res) => {
    res.setHeader('Content-Type', 'application/json')

    let client_id = req.query.client_id
    let client_secret = req.query.client_secret
    let code = req.query.code
    let grant_type = req.query.grant_type
    let redirect_uri = req.query.redirect_uri
    axios.post(`https://api.weibo.com/oauth2/access_token?grant_type=${grant_type}&code=${code}&client_id=${client_id}&redirect_uri=${redirect_uri}&client_secret=${client_secret}`, {}, {
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        let resdata = response.data
        let accessToken = resdata.access_token
        let uid = resdata.uid
        if (accessToken && uid) {
            axios.get(`https://api.weibo.com/2/users/show.json?access_token=${accessToken}&uid=${uid}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                let profile = response.data
                let account = {
                    username: profile.screen_name,
                    name: profile.name,
                    avatar: profile.profile_image_url,
                    type: statusCode.WEIBO
                }
                let token = jwt.sign({username: account.username}, superSecret, {
                    expiresIn: 3600
                })
                res.send(JSON.stringify({
                    code: statusCode.ERR_OK,
                    token: token,
                    account: account,
                    message: 'Successfully login, use your token'
                }, null, 5))
            })
        } else {
            res.send(JSON.stringify({
                code: statusCode.ERR_NOK,
                message: 'Invalid token'
            }, null, 5))
        }
    }).catch(e => {
        console.log(e)
    })
}

module.exports = router
