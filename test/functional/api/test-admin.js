/**
 * @Author: Sam
 * @Date: 2020/1/2
 * @Version: 1.0
 **/
const chai = require('chai')
const expect = chai.expect
const request = require('supertest')
const jwt = require('jsonwebtoken')
const sha1 = require('sha1')

const config = require('../../../config')

// mongod-memory-server
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const Admin = require('../../../models/admin')
const {MongoClient} = require('mongodb')

const _ = require('lodash')
let server
let mongod
let db, validID
// eslint-disable-next-line no-unused-vars
let url, connection, collection

// jwt parameters
let username = 'admin'
let token
let superSecret = config.superSecret

describe('Admin', () => {
    before(async () => {
        mongod = new MongoMemoryServer({
            instance: {
                port: 27017,
                dbPath: './test/database',
                dbName: 'outfitapp'
            }
        })
        // Async Trick - this ensures the database is created before
        // we try to connect to it or start the server
        url = await mongod.getConnectionString()
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        db = connection.db(await mongod.getDbName())
        collection = db.collection('admin')
        server = require('../../../bin/www')

        token = jwt.sign({username: username}, superSecret, {
            expiresIn: 3600
        })
    })

    after(async () => {
        try {
            await connection.close()
            await mongod.stop()
            await server.close()
        } catch (err) {
            console.log(err)
        }
    })

    beforeEach(async () => {
        try {
            await Admin.deleteMany({})
            let admin = new Admin()
            admin.username = 'admin'
            admin.password = sha1('admin')
            admin.phone = '0894889596'
            admin.email = 'xusam2412@gmail.com'
            await admin.save()
            let admin1 = new Admin()
            admin1.username = 'admin1'
            admin1.password = sha1('admin1')
            admin1.phone = '0894889595'
            admin1.email = '1007824874@qq.com'
            await admin1.save()
            admin = await Admin.findOne({username: 'admin'})
            validID = admin._id
        } catch (err) {
            console.log(err)
        }
    })
})
