# OutfitApp-Backend
The backend of the final year project Custom Outfit App.

[![pipeline status](https://gitlab.com/Sam1224/outfitapp-backend-test/badges/master/pipeline.svg)](https://gitlab.com/Sam1224/outfitapp-backend-test/commits/master)

[![coverage report](https://gitlab.com/Sam1224/outfitapp-backend-test/badges/master/coverage.svg)](https://gitlab.com/Sam1224/outfitapp-backend-test/badges/master/coverage.svg?job=coverage)

- [Github](https://github.com/Sam1224/OutfitApp-Backend)
- [Gitlab](https://gitlab.com/Sam1224/outfitapp-backend-test)
- [Gitlab CI/CD Pipeline](https://gitlab.com/Sam1224/outfitapp-backend-test/pipelines)

- [OutfitApp-Backend](#outfitapp-backend)
  * [Basic Inforamtion](#basic-inforamtion)
  * [Environment](#environment)
  * [Usage](#usage)
  * [Structure of Database](#structure-of-database)
  * [Brief Description of Functionality](#brief-description-of-functionality)
  * [Sample Test Execution](#sample-test-execution)
  * [Persistence Approach](#persistence-approach)
  * [Git Approach](#git-approach)
  * [DX (Developer eXperience) Approach](#dx--developer-experience--approach)
  * [References](#references)

## Basic Inforamtion
- ID: 20086454
- Name: Qianxiong Xu
- Major: BSc (Hons) in Software Systems Practice Year 1

## Environment
- OS: Windows 10
- Node: v10.16.3

## Usage
- Clone:
```
git clone https://github.com/Sam1224/OutfitApp-Backend.git
```
- Configure:
```
cd <your_dir>
npm install
```
- Run:
```
npm run build:release
npm run start:prod
```
- Test (if the test failed and get a notice like `...exceed 20000ms...`, go to `package.json` and find the `test script`, modify the value after `--timeout` into a larger value, like `40000`):
```
// test all two routes
npm run test
// test user router
npm run test:user
// test admin router
npm run test:admin
```
- Generate coverage report:
```
npm run test:report
```

## Structure of Database

There are 3 data models:

| Data Model | Schema |
| ---------- | ------ |
| User | [User Schema](./models/user.js) |
| Admin | [Admin Schema](./models/admin.js) |
| Vton | [Vton Schema](./models/vton.js) |
| Retrieval | [Retrieval Schema](./models/retrieval.js) |

![](./assets/MongoDB.png)

## Brief Description of Functionality
This repository is a backend of the Custom Outfit App, it could do some basic `CRUD` operations to operate data in database and provide RESTful APIs to the frontend.

It uses `jsonwebtoken` as a way of authentication, each api that needs authentication should put a token in the request body to be verified.

It could be roughly divided into 4 parts: `user`, `admin`, `file` and `oauth` (4 corresponded models), there are `26` RESTful apis in total, with `7 GET`, `13 POST`, `2 PUT` and `4 DELETE`. They are listed as follow:
- [`user`](./routes/user.js)
    - GET       -   findAll
        - Return a list of all users.
        - No need for jwt authentication.
        - `localhost:3000/user`
    - GET       -   findOne
        - Return one user by several type and query pairs.
        - No need for jwt authentication.
        - `localhost:3000/user/one?type=0&query=0&status=0`
        - Query pairs:
            - type=0&query=ID
                - &status=0 - activated users
                - &status=1 - unactivated users
                - <without status> - both activated and unactivated users
            - type=1&query=USERNAME
                - &status=0 - activated users
                - &status=1 - unactivated users
                - <without status> - both activated and unactivated users
            - type=2&query=PHONE
                - &status=0 - activated users
                - &status=1 - unactivated users
                - <without status> - both activated and unactivated users
            - type=3&query=EMAIL
                - &status=0 - activated users
                - &status=1 - unactivated users
                - <without status> - both activated and unactivated users
    - POST      -   addUser
        - Add a new user.
        - No need for jwt authentication.
        - `localhost:3000/user`
            - `username`:   'xxx'
            - `password`:   'xxx' (password will be encrypted by `sha1`)
            - `phone`:      'xxx'
            - `email`:      'xxx'
            - `name`:       'xxx'
    - PUT       -   updateUser
        - Update the personal information of a user identified by `id`.
        - Need jwt authentication.
        - `localhost:3000/user/:id`
            - `password`:   'xxx'
            - `name`:       'xxx'
            - `avatar`:     'xxx'
            - `token`:      'xxx'
    - POST      -   login
        - Login and get the jwt token.
        - The api invoked to get the jwt token, no need itself.
        - `localhost:3000/login`
            - `username`:   'xxx'
            - `password`:   'xxx'
    - GET       -   getToken
            - Get the jwt token for 3rd party OAuth2.
            - The api invoked to get the jwt token, no need itself.
            - `localhost:3000/token/:username`
    - DELETE    -   deleteUser
        - Delete one user identified by `id`.
        - Need jwt authentication.
        - `localhost:3000/user/:id`
            - `token`:      'xxx'
    - POST      -   addVton
        - Add one virtual try-on record to a user.
        - The images are saved in `base64` format.
        - No need for jwt authentication.
        - `localhost:3000/user/vton/add`
            - `_id`:        'xxx'
            - `username`:   'xxx'
            - `pose`:       'xxx'
            - `cloth`:      'xxx'
            - `result`:     'xxx'
    - DELETE    -   deleteVton
        - Delete one virtual try-on record from a user.
        - No need for jwt authentication.
        - `localhost:3000/user/vton/delete`
            - `_id`:        'xxx'
            - `username`:   'xxx'
            - `vtonid`:     'xxx'
    - POST      -   addRetrieval
        - Add one outfits retrieval record to a user.
        - The images are saved in `base64` format.
        - No need for jwt authentication.
        - `localhost:3000/user/retrieval/add`
            - `_id`:        'xxx'
            - `username`:   'xxx'
            - `cloth`:      'xxx'
            - `results`:    ['xxx', 'xxx', 'xxx', 'xxx', 'xxx']
    - DELETE    -   deleteRetrieval
        - Delete one outfits retrieval record from a user.
        - No need for jwt authentication.
        - `localhost:3000/user/retrieval/delete`
            - `_id`:        'xxx'
            - `username`:   'xxx'
            - `retrievalid`:     'xxx'
    
- [`admin`](./routes/admin.js)
    - GET       -   findAll
        - Return a list of all admins.
        - Need jwt authentication.
        - `localhost:3000/admin`
            - `token`:      'xxx'
    - GET       -   findOne
        - Return one seller identified by `id`.
        - Need jwt authentication.
        - `localhost:3000/admin/:id`
            - `token`:      'xxx'
    - POST      -   addAdmin
        - Add a new admin.
        - No need for jwt authentication.
        - `localhost:3000/admin`
            - `username`:       'xxx'
            - `password`:       'xxx'
            - `phone`:          'xxx'
            - `email`:          'xxx'
    - PUT       -   updateAdmin
        - Modify the password of an admin identified by `id`.
        - Need jwt authentication.
        - `localhost:3000/admin/:id`
            - `password`:       'xxx'
            - `token`:          'xxx'
    - POST      -   login
        - Login and get the jwt token.
        - The api invoked to get the jwt token, no need itself.
        - `localhost:3000/admin/login`
            - `username`:   'xxx'
            - `password`:   'xxx'
    - GET       -   getToken
            - Get the jwt token for 3rd party OAuth2.
            - The api invoked to get the jwt token, no need itself.
            - `localhost:3000/admin/token/:username`
    - DELETE    -   deleteAdmin
        - Delete one admin identified by `id`.
        - Need jwt authentication.
        - `localhost:3000/admin/:id`
            - `token`:  'xxx'
            
- [`file`](./routes/file.js)
    - GET       -   getImage
        - Get image.
        - No need for jwt authenticattion.
        - `localhost:3000/uploads/:filename`
    - POST      -   upload
        - Upload image.
        - No need for jwt authentication.
        - `localhost:3000/upload`
            - file
    - POST      -   uploadmul
        - Upload multiple images with a maximum of 10.
        - No need for jwt authentication.
        - `localhost:3000/uploadmul`
            - files(max:10)

- [`oauth`](./routes/oauth.js)
    - POST      -   getGithubToken
        - Github OAuth2 service.
        - No need for jwt authentication.
        - `localhost:3000/loginGithub?client_id=xxx&client_secret=xxx&code=xxx`
    - POST      -   getGitlabToken
        - Gitlab OAuth2 service.
        - No need for jwt authentication.
        - `localhost:3000/loginGitlab?client_id=xxx&client_secret=xxx&code=xxx&redirect_uri=xxx`
    - POST      -   getGiteeToken
        - Gitlee OAuth2 service.
        - No need for jwt authentication.
        - `localhost:3000/loginGitee?client_id=xxx&client_secret=xxx&code=xxx&redirect_uri=xxx&grant_type=xxx`
    - POST      -   getBitbucketToken
        - Bitbucket OAuth2 service.
        - No need for jwt authentication.
        - `localhost:3000/loginBitbucket?access_token=xxx`
    - POST      -   getWeiboToken
        - Weibo OAuth2 service.
        - No need for jwt authentication.
        - `localhost:3000/loginWeibo?client_id=xxx&client_secret=xxx&code=xxx&grant_type=xxx&redirect_uri=xxx`

## Sample Test Execution

- Test:

If the test failed and get a notice like `...exceed 20000ms...`, go to `package.json` and find the `test script`, modify the value after `--timeout` into a larger value, like `40000`
```
npm run test
```

- Sample test result:

The following code block includes the outputs of running test scripts.
~~~
D:\Project\JupyterNotebook\Blog\FinalYearProject\OutfitApp-Backend>npm run test

> outfitapp-backend@0.0.0 test D:\Project\JupyterNotebook\Blog\FinalYearProject\OutfitApp-Backend
> cross-env NODE_ENV=test mocha --timeout 20000 test/functional/api/*.js --exit



  User
body-parser deprecated undefined extended: provide extended option app.js:32:17
mongodb://sam:yyq19981212@ds021016.mlab.com:21016/heroku_lzpgpltq
    GET /user
connected to remote mongodb: mongodb://sam:yyq19981212@ds021016.mlab.com:21016/heroku_lzpgpltq
GET /user 200 33.613 ms - 874
      √ should return all the users (61ms)
    GET /user/one
      when the content is invalid
GET /user/one?type=0&query=test1&status=0 200 2.750 ms - 321
        √ should return an error
      when the content is valid
        when type is 0
GET /user/one?type=0&query=5e9cc58cf57b153ad46c719e&status=0 200 26.102 ms - 458
          √ should query for _id
        when type is 1
GET /user/one?type=1&query=user1&status=0 200 24.800 ms - 458
          √ should query for username
        when type is 2
GET /user/one?type=2&query=0894889596&status=0 200 27.316 ms - 458
          √ should query for phone
        when type is 3
GET /user/one?type=3&query=xusam2412@gmail.com&status=0 200 25.366 ms - 458
          √ should query for email
    POST /user
      when the params are invalid
        when the username is duplicated
POST /user 200 25.227 ms - 70
          √ should return a message showing The username has been registered (1248ms)
        when the phone number is duplicated
POST /user 200 48.274 ms - 74
          √ should return a message showing The phone number has been registered (53ms)
        when the email is duplicated
POST /user 200 74.366 ms - 67
          √ should return a message showing The email has been registered (77ms)
      when the params are valid
mail sent: 250 Mail OK queued as smtp5,HdxpCgCXnECQxZxeYjMEAA--.71S2 1587332502
POST /user 200 7204.661 ms - 59
        √ should return a message showing Successfully add user (7209ms)
GET /user 200 32.234 ms - 1324
    PUT /user/:id
      when there is no jwt token
PUT /user/5e9cc595f57b153ad46c71b3 200 0.990 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
PUT /user/5e9cc595f57b153ad46c71b5 200 0.758 ms - 119
          √ should return an invalid error
        when the token is valid
PUT /user/5e9cc596f57b153ad46c71b7 200 55.559 ms - 62
          √ should return a message showing Successfully update user (58ms)
GET /user/one?type=0&query=5e9cc596f57b153ad46c71b7&status=0 200 26.414 ms - 480
    DELETE /user/:id
      when there is no jwt token
DELETE /user/5e9cc596f57b153ad46c71b9 200 0.442 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
DELETE /user/5e9cc596f57b153ad46c71bb 200 0.404 ms - 119
          √ should return an invalid error
        when the token is valid
(node:15060) DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated. See: https://mongoosejs.com/docs/deprecations.html#-findandmodify-
DELETE /user/5e9cc596f57b153ad46c71bd 200 27.492 ms - 62
          √ should return a message of Successfully delete user
GET /user 200 26.050 ms - 456
    POST /login
      when the username is not registered
POST /login 200 29.646 ms - 68
        √ should return a message showing The username is not registered (39ms)
      when the username is registered
        when the password is wrong
POST /login 200 24.899 ms - 59
          √ should return a message showing The password is wrong
        when the password is correct
          when the account is inactivated
POST /login 200 25.208 ms - 73
            √ should return a message showing The account has not been activated
          when the account is activated
POST /login 200 25.866 ms - 243
            √ should return a token and a message showing Successfully login, use your token
    GET /token/:username
GET /token/Sam1224 200 2.868 ms - 246
      √ should return a token and a message showing Successfully login, use your token
    POST /user/vton/add
      when the params are invalid
        when the user does not exist
POST /user/vton/add 200 24.810 ms - 57
          √ should return a message showing The user not exists
      when the params are valid
(node:15060) DeprecationWarning: collection.update is deprecated. Use updateOne, updateMany, or bulkWrite instead.
POST /user/vton/add 200 6103.915 ms - 66
        √ should return a message showing Successfully add vton record (6112ms)
GET /user/one?type=0&query=5e9cc5a0f57b153ad46c71d3&status=0 200 1534.479 ms - 644359
    DELETE /user/vton/delete
      when the params are invalid
        when the user does not exist
DELETE /user/vton/delete 200 23.884 ms - 57
          √ should return a message showing The user not exists
      when the params are valid
DELETE /user/vton/delete 200 1282.804 ms - 69
        √ should return a message showing Successfully delete vton record (1285ms)
GET /user/one?type=0&query=5e9cc5baf57b153ad46c71e5&status=0 200 754.116 ms - 289560
    POST /user/retrieval/add
      when the params are invalid
        when the user does not exist
POST /user/retrieval/add 200 23.878 ms - 57
          √ should return a message showing The user not exists
      when the params are valid
POST /user/retrieval/add 200 5723.770 ms - 71
        √ should return a message showing Successfully add retrieval record (5733ms)
GET /user/one?type=0&query=5e9cc5cff57b153ad46c71f5&status=0 200 1833.157 ms - 756054
    DELETE /user/retrieval/delete
      when the params are invalid
        when the user does not exist
DELETE /user/retrieval/delete 200 24.123 ms - 57
          √ should return a message showing The user not exists
      when the params are valid
DELETE /user/retrieval/delete 200 1278.694 ms - 74
        √ should return a message showing Successfully delete retrieval record (1281ms)
GET /user/one?type=0&query=5e9cc5e8f57b153ad46c7207&status=0 200 453.635 ms - 177865

  Admin
    GET /admin
      when there is no jwt token
GET /admin 200 0.534 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
GET /admin 200 0.566 ms - 119
          √ should return an invalid error
        when the token is valid
GET /admin 200 25.712 ms - 621
          √ should return all admins
    GET /admin/:id
      when there is no jwt token
GET /admin/5e9cc5f5f57b153ad46c7213 200 0.707 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
GET /admin/5e9cc5f5f57b153ad46c7215 200 0.587 ms - 119
          √ should return an invalid error
        when the token is valid
GET /admin/5e9cc5f5f57b153ad46c7217 200 24.491 ms - 331
          √ should return the matching admin
    POST /admin
      when the params are invalid
        when the username is duplicated
POST /admin 200 24.405 ms - 70
          √ should return a message showing The username has been registered
        when the phone number is duplicated
POST /admin 200 50.549 ms - 74
          √ should return a message showing The phone number has been registered (54ms)
        when the email is duplicated
POST /admin 200 72.222 ms - 67
          √ should return a message showing The email has been registered (76ms)
      when the params are valid
POST /admin 200 102.099 ms - 60
        √ should return a message showing Successfully add admin (107ms)
GET /admin 200 25.986 ms - 914
    PUT /admin/:id
      when there is no jwt token
PUT /admin/5e9cc5f7f57b153ad46c7226 200 0.217 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
PUT /admin/5e9cc5f7f57b153ad46c7228 200 0.476 ms - 119
          √ should return an invalid error
        when the token is valid
PUT /admin/5e9cc5f7f57b153ad46c722a 200 51.075 ms - 63
          √ should return a message showing Successfully update admin (56ms)
GET /admin/5e9cc5f7f57b153ad46c722a 200 24.613 ms - 331
    DELETE /admin/:id
      when there is no jwt token
DELETE /admin/5e9cc5f7f57b153ad46c722c 200 0.330 ms - 65
        √ should a message showing Not login yet, please login
      when there is a jwt token
        when the token is invalid
DELETE /admin/5e9cc5f7f57b153ad46c722e 200 0.314 ms - 119
          √ should return an invalid error
        when the token is valid
DELETE /admin/5e9cc5f7f57b153ad46c7230 200 25.439 ms - 63
          √ should return a message showing Successfully delete admin
GET /admin 200 26.329 ms - 330
    POST /admin/login
      when the username is not registered
POST /admin/login 200 26.965 ms - 68
        √ should return a message showing The username is not registered
      when the username is registered
        when the password is wrong
POST /admin/login 200 25.234 ms - 59
          √ should return a message showing The password is wrong
        when the password is correct
POST /admin/login 200 24.621 ms - 243
          √ should return a token and a message showing Successfully login, use your token
    GET /admin/token/:username
GET /admin/token/Sam1224 200 0.667 ms - 246
      √ should return a token and a message showing Successfully login, use your token


  49 passing (2m)
~~~

## Persistence Approach
- App:
The whole project is deployed to [Heroku](https://www.heroku.com).
- MongoDB:
The MongoDB is deployed by using `mLab MongoDB sandbox` provided by [Heroku](https://www.heroku.com).
- Authentication:
The project uses `jsonwebtoken` as a way of authentication, each api that needs authentication should put a token in the request body to be verified.

## Git Approach
- This project adopts `Git bash` locally, while using `Github` as the remote repository for management.
- Url to the repository: https://github.com/Sam1224/OutfitApp-Backend
```
git clone https://github.com/Sam1224/OutfitApp-Backend.git
```
- The status of this repository is `public`.
- Please refer to the `git log` for my commiting records.

## DX (Developer eXperience) Approach
- Automated testing:
    - Using `mocha` and `lodash` to do automated testing.
    - There are `49` test cases in total.
- Code quality:
    - Using `eslint` to check and obey the `code standard`.
    - Using `nyc` to generate `code coverage report`.
- Others:
    - Using `babel` to `compile` and support `es6 grammar`.
    - Using `cross-env` to enable `platform independence`.
    - Using `nodemon` and `eslint-watch` to `watch` the `file changes` of a project and perform `hot reboot`.

## References
- [Mr. David Drohan's course](https://tutors-design.netlify.com/course/wit-wad-2-2019.netlify.com)
- [Node.js](https://nodejs.org/zh-cn/)
- [Node's official docs](https://nodejs.org/zh-cn/docs/)
- [MongoDB](https://www.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose](https://mongoosejs.com/)
- [Mongoose docs](http://www.nodeclass.com/api/mongoose.html#quick_start)
- [sha1](https://www.npmjs.com/package/js-sha1)
- [A blog of MongoDB about Schema and Model](https://www.jianshu.com/p/29c55aae3d6f)
- [mocha](https://mochajs.org/)
- [A blog about Mocha](http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html)
- [lodash](https://lodash.com/)
- [eslint](https://eslint.org/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [A blog about jwt](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
- [A blog about jwt](https://www.jb51.net/article/162523.htm)
- [A blog about jwt](https://segmentfault.com/a/1190000014062679?utm_source=tag-newest)
- [chai](https://www.chaijs.com/)
- [supertest](https://github.com/visionmedia/supertest)
- [Mongodb-Memory-Server](https://github.com/nodkz/mongodb-memory-server)
- [nyc](https://github.com/istanbuljs/nyc)
- [Postman](https://www.getpostman.com/)
- [TOC generator](https://ecotrust-canada.github.io/markdown-toc/)
- [nock](https://github.com/nock/nock)

