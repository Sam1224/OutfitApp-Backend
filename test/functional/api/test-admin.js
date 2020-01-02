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

    describe('GET /admin', () => {
        describe('when there is no jwt token', () => {
            it('should a message showing Not login yet, please login', () => {
                let admin = {}
                admin.token = null
                return request(server)
                    .get('/admin')
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(1)
                        expect(res.body.message).equals('Not login yet, please login')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when there is a jwt token', () => {
            describe('when the token is invalid', () => {
                it('should return an invalid error', () => {
                    let admin = {}
                    admin.token = '123'
                    return request(server)
                        .get('/admin')
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(-1)
                            expect(res.body.error.name).equals('JsonWebTokenError')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the token is valid', () => {
                it('should return all admins', () => {
                    let admin = {}
                    admin.token = token
                    return request(server)
                        .get('/admin')
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data).to.be.a('array')
                            expect(res.body.data.length).to.equal(2)
                            let result = _.map(res.body.data, (admin) => {
                                return {
                                    username: admin.username
                                }
                            })
                            expect(result).to.deep.include({
                                username: 'admin'
                            })
                            expect(result).to.deep.include({
                                username: 'admin1'
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })

    describe('GET /admin/:id', () => {
        describe('when there is no jwt token', () => {
            it('should a message showing Not login yet, please login', () => {
                let admin = {}
                admin.token = null
                return request(server)
                    .get(`/admin/${validID}`)
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(1)
                        expect(res.body.message).equals('Not login yet, please login')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when there is a jwt token', () => {
            describe('when the token is invalid', () => {
                it('should return an invalid error', () => {
                    let admin = {}
                    admin.token = '123'
                    return request(server)
                        .get(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(-1)
                            expect(res.body.error.name).equals('JsonWebTokenError')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the token is valid', () => {
                it('should return the matching admin', () => {
                    let admin = {}
                    admin.token = token
                    return request(server)
                        .get(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data).to.be.a('array')
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'admin')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })

    describe('POST /admin', () => {
        describe('when the params are invalid', () => {
            describe('when the username is duplicated', () => {
                it('should return a message showing The username has been registered', () => {
                    let admin = new Admin()
                    admin.username = 'admin'
                    admin.password = sha1('admin')
                    admin.phone = '0894889594'
                    admin.email = '20086454@mail.wit.ie'
                    return request(server)
                        .post('/admin')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .send(admin)
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
            describe('when the phone number is duplicated', () => {
                it('should return a message showing The phone number has been registered', () => {
                    let admin = new Admin()
                    admin.username = 'admin2'
                    admin.password = sha1('admin')
                    admin.phone = '0894889596'
                    admin.email = '20086454@mail.wit.ie'
                    return request(server)
                        .post('/admin')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .send(admin)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(3)
                            expect(res.body.message).equals('The phone number has been registered')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the email is duplicated', () => {
                it('should return a message showing The email has been registered', () => {
                    let admin = new Admin()
                    admin.username = 'admin2'
                    admin.password = sha1('admin')
                    admin.phone = '0894889594'
                    admin.email = 'xusam2412@gmail.com'
                    return request(server)
                        .post('/admin')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .send(admin)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(4)
                            expect(res.body.message).equals('The email has been registered')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
        describe('when the params are valid', () => {
            it('should return a message showing Successfully add admin', () => {
                let admin = new Admin()
                admin.username = 'admin2'
                admin.password = sha1('admin')
                admin.phone = '0894889594'
                admin.email = '20086454@mail.wit.ie'
                return request(server)
                    .post('/admin')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .send(admin)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(0)
                        expect(res.body.message).equals('Successfully add admin')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
            after(() => {
                let admin = {}
                admin.token = token
                return request(server)
                    .get('/admin')
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(0)
                        expect(res.body.data.length).to.equal(3)
                        let result = _.map(res.body.data, (admin) => {
                            return {
                                username: admin.username
                            }
                        })
                        expect(result).to.deep.include({
                            username: 'admin2'
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
    })

    describe('PUT /admin/:id', () => {
        describe('when there is no jwt token', () => {
            it('should a message showing Not login yet, please login', () => {
                let admin = {}
                admin.token = null
                admin.password = '123456'
                return request(server)
                    .put(`/admin/${validID}`)
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(1)
                        expect(res.body.message).equals('Not login yet, please login')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when there is a jwt token', () => {
            describe('when the token is invalid', () => {
                it('should return an invalid error', () => {
                    let admin = {}
                    admin.token = '123'
                    admin.password = '123456'
                    return request(server)
                        .put(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(-1)
                            expect(res.body.error.name).equals('JsonWebTokenError')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the token is valid', () => {
                it('should return a message showing Successfully update admin', () => {
                    let admin = {}
                    admin.token = token
                    admin.password = '123456'
                    return request(server)
                        .put(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.message).equals('Successfully update admin')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
                after(() => {
                    let admin = {}
                    admin.token = token
                    return request(server)
                        .get(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data.length).to.equal(1)
                            expect(res.body.data[0]).to.have.property('username', 'admin')
                            expect(res.body.data[0]).to.have.property('password', sha1('123456'))
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })

    describe('DELETE /admin/:id', () => {
        describe('when there is no jwt token', () => {
            it('should a message showing Not login yet, please login', () => {
                let admin = {}
                admin.token = null
                return request(server)
                    .delete(`/admin/${validID}`)
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(1)
                        expect(res.body.message).equals('Not login yet, please login')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when there is a jwt token', () => {
            describe('when the token is invalid', () => {
                it('should return an invalid error', () => {
                    let admin = {}
                    admin.token = '123'
                    return request(server)
                        .delete(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(-1)
                            expect(res.body.error.name).equals('JsonWebTokenError')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the token is valid', () => {
                it('should return a message showing Successfully delete admin', () => {
                    let admin = {}
                    admin.token = token
                    return request(server)
                        .delete(`/admin/${validID}`)
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.message).equals('Successfully delete admin')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
                after(() => {
                    let admin = {}
                    admin.token = token
                    return request(server)
                        .get('/admin')
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.data).to.be.a('array')
                            expect(res.body.data.length).to.equal(1)
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })

    describe('POST /admin/login', () => {
        describe('when the username is not registered', () => {
            it('should return a message showing The username is not registered', () => {
                let admin = {}
                admin.username = 'ss'
                admin.password = '123456'
                return request(server)
                    .post('/admin/login')
                    .send(admin)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.code).to.equal(5)
                        expect(res.body.message).equals('The username is not registered')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            })
        })
        describe('when the username is registered', () => {
            describe('when the password is wrong', () => {
                it('should return a message showing The password is wrong', () => {
                    let admin = {}
                    admin.username = 'admin'
                    admin.password = '123'
                    return request(server)
                        .post('/admin/login')
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(6)
                            expect(res.body.message).equals('The password is wrong')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
            describe('when the password is correct', () => {
                it('should return a token and a message showing Successfully login, use your token', () => {
                    let admin = {}
                    admin.username = 'admin'
                    admin.password = 'admin'
                    return request(server)
                        .post('/admin/login')
                        .send(admin)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.code).to.equal(0)
                            expect(res.body.message).equals('Successfully login, use your token')
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                })
            })
        })
    })
})
