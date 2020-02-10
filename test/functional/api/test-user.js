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
      user.status = 0
      await user.save()
      let user1 = new User()
      user1.username = 'user2'
      user1.password = sha1('123456')
      user1.phone = '0894889595'
      user1.email = '1007824874@qq.com'
      user1.name = 'Test User 2'
      user1.status = 1
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
            .get('/user/one?type=1&query=user1&status=0')
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
            .get('/user/one?type=2&query=0894889596&status=0')
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
            .get('/user/one?type=3&query=xusam2412@gmail.com&status=0')
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
      describe('when the phone number is duplicated', () => {
        it('should return a message showing The phone number has been registered', () => {
          let user = new User()
          user.username = 'user3'
          user.password = sha1('123456')
          user.phone = '0894889596'
          user.email = '20086454@mail.wit.ie'
          user.name = 'Test User 3'
          return request(server)
            .post('/user')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(user)
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
          let user = new User()
          user.username = 'user3'
          user.password = sha1('123456')
          user.phone = '0894889594'
          user.email = 'xusam2412@gmail.com'
          user.name = 'Test User 3'
          return request(server)
            .post('/user')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .send(user)
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
      it('should return a message showing Successfully add user', () => {
        let user = new User()
        user.username = 'user3'
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
            expect(res.body.code).to.equal(0)
            expect(res.body.message).equals('Successfully add user')
          })
          .catch((err) => {
            console.log(err)
          })
      })
      after(() => {
        return request(server)
          .get('/user')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            expect(res.body.code).to.equal(0)
            expect(res.body.data.length).to.equal(3)
            let result = _.map(res.body.data, (user) => {
              return {
                username: user.username
              }
            })
            expect(result).to.deep.include({
              username: 'user3'
            })
          })
          .catch((err) => {
            console.log(err)
          })
      })
    })
  })

  describe('PUT /user/:id', () => {
    describe('when there is no jwt token', () => {
      it('should a message showing Not login yet, please login', () => {
        let user = {}
        user.token = null
        user.password = '123456'
        user.name = 'U1'
        user.avatar = null
        return request(server)
          .put(`/user/${validID}`)
          .send(user)
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
          let user = {}
          user.token = '123'
          user.password = '123456'
          user.name = 'U1'
          user.avatar = null
          return request(server)
            .put(`/user/${validID}`)
            .send(user)
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
        it('should return a message showing Successfully update user', () => {
          let user = {}
          user.token = token
          user.password = '123456'
          user.name = 'U1'
          user.avatar = null
          return request(server)
            .put(`/user/${validID}`)
            .send(user)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.code).to.equal(0)
              expect(res.body.message).equals('Successfully update user')
            })
            .catch((err) => {
              console.log(err)
            })
        })
        after(() => {
          return request(server)
            .get(`/user/one?type=0&query=${validID}&status=0`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.code).to.equal(0)
              expect(res.body.data.length).to.equal(1)
              expect(res.body.data[0]).to.have.property('username', 'user1')
              expect(res.body.data[0]).to.have.property('password', sha1('123456'))
              expect(res.body.data[0]).to.have.property('name', 'U1')
            })
            .catch((err) => {
              console.log(err)
            })
        })
      })
    })
  })

  describe('DELETE /user/:id', () => {
    describe('when there is no jwt token', () => {
      it('should a message showing Not login yet, please login', () => {
        let user = {}
        user.token = null
        return request(server)
          .delete(`/user/${validID}`)
          .send(user)
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
          let user = {}
          user.token = '123'
          return request(server)
            .delete(`/user/${validID}`)
            .send(user)
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
        it('should return a message of Successfully delete user', () => {
          let user = {}
          user.token = token
          return request(server)
            .delete(`/user/${validID}`)
            .send(user)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.code).to.equal(0)
              expect(res.body.message).equals('Successfully delete user')
            })
            .catch((err) => {
              console.log(err)
            })
        })
        after(() => {
          return request(server)
            .get('/user')
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

  describe('POST /login', () => {
    describe('when the username is not registered', () => {
      it('should return a message showing The username is not registered', () => {
        let user = {}
        user.username = 'ss'
        user.password = '123456'
        return request(server)
          .post('/login')
          .send(user)
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
          let user = {}
          user.username = 'user1'
          user.password = '123'
          return request(server)
            .post('/login')
            .send(user)
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
        describe('when the account is inactivated', () => {
          it('should return a message showing The account has not been activated', () => {
            let user = {}
            user.username = 'user2'
            user.password = '123456'
            return request(server)
                .post('/login')
                .send(user)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                  expect(res.body.code).to.equal(10)
                  expect(res.body.message).equals('The account has not been activated')
                })
                .catch((err) => {
                  console.log(err)
                })
          })
        })
        describe('when the account is activated', () => {
          it('should return a token and a message showing Successfully login, use your token', () => {
            let user = {}
            user.username = 'user1'
            user.password = '123456'
            return request(server)
                .post('/login')
                .send(user)
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

  describe('GET /token/:username', () => {
    it('should return a token and a message showing Successfully login, use your token', () => {
      return request(server)
        .get('/token/Sam1224')
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
