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
const User = require('../../../models/user')
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

describe('User', () => {
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
        collection = db.collection('user')
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
            await User.deleteMany({})
            let user = new User()
            user.username = 'user1'
            user.password = sha1('123456')
            user.phone = '0894889596'
            user.email = 'xusam2412@gmail.com'
            user.name = 'Test User 1'
            await user.save()
            let user1 = new User()
            user1.username = 'user2'
            user1.password = sha1('123456')
            user1.phone = '0894889595'
            user1.email = '1007824874@qq.com'
            user1.name = 'Test User 2'
            await user1.save()
            user = await User.findOne({username: 'user1'})
            validID = user._id
        } catch (err) {
            console.log(err)
        }
    })

    describe('GET /user', () => {
        it('should return all the users', () => {
            return request(server)
                .get('/user')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body.code).to.equal(0)
                    expect(res.body.data).to.be.a('array')
                    expect(res.body.data.length).to.equal(2)
                    let result = _.map(res.body.data, (user) => {
                        return {
                            username: user.username
                        }
                    })
                    expect(result).to.deep.include({
                        username: 'user1'
                    })
                    expect(result).to.deep.include({
                        username: 'user2'
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    })

    describe('GET /user/one', () => {
        describe('when the content is invalid', () => {
            it('should return an error', () => {
                return request(server)
                    .get('/user/one?type=0&query=test1&status=0')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(-1)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when the content is valid', () => {
            describe('when type is 0', () => {
                it('should query for _id', () => {
                    return request(server)
                        .get(`/user/one?type=0&query=${validID}&status=0`)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'user1')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when type is 1', () => {
                it('should query for username', () => {
                    return request(server)
                        .get(`/user/one?type=1&query=user1&status=0`)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'user1')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when type is 2', () => {
                it('should query for phone', () => {
                    return request(server)
                        .get(`/user/one?type=2&query=0894889596&status=0`)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'user1')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when type is 3', () => {
                it('should query for email', () => {
                    return request(server)
                        .get(`/user/one?type=3&query=xusam2412@gmail.com&status=0`)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'user1')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })

    describe('POST /user', () => {
        describe('when the params are invalid', () => {
            describe('when the username is duplicated', () => {
                it('should return a message showing The username has been registered', () => {
                    let user = new User()
                    user.username = 'user1'
                    user.password = sha1('123456')
                    user.phone = '0894889594'
                    user.email = '20086454@mail.wit.ie'
                    user.name = 'Test User 3'
                    return request(server)
                        .post('/user')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .send(user)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(2)
                            expect(res.body.message).equals('The username has been registered')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })
})
