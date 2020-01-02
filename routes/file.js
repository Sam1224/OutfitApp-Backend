/**
 * @Author: Sam
 * @Date: 2020/1/2
 * @Version: 1.0
 **/
var express = require('express')
var router = express.Router()
var fs = require('fs')
var statusCode = require('../public/javascripts/status')

/**
 * POST
 * upload - upload files
 * @param req
 * @param res
 */
router.upload = (req, res) => {
    let file = req.file
    let filepath
    if (file.originalname.endsWith('.jpg')) {
        filepath = `uploads/${file.filename}.jpg`
    } else if (file.originalname.endsWith('.png')) {
        filepath = `uploads/${file.filename}.png`
    } else {
        res.send(JSON.stringify({code: statusCode.INV_EXT, message: 'Invalid file type'}, null, 5))
        return
    }
    fs.rename(file.path, filepath, function(err) {
        if (err) {
            throw err
        }
    })
    res.send(JSON.stringify({code: statusCode.ERR_OK, filepath: filepath, message: 'Successfully uploading'}, null, 5))
}

module.exports = router
