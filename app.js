var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var multer = require('multer')

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin')
var oauthRouter = require('./routes/oauth')
var fileRouter = require('./routes/file')

var app = express();

// uploaded file size limit
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// upload files
const upload = multer({dest: 'uploads/'})

var cors = require('cors')
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// File
app.post('/upload', upload.single('file'), fileRouter.upload)
app.post('/uploadmul', upload.array('files', 10), fileRouter.uploadmul)
app.get('/uploads/:filename', fileRouter.getImage)

// Oauth2
app.get('/loginGithub', oauthRouter.getGithubToken)
app.get('/loginGitlab', oauthRouter.getGitlabToken)
app.get('/loginGitee', oauthRouter.getGiteeToken)
app.get('/loginBitbucket', oauthRouter.getBitbucketToken)
app.get('/loginWeibo', oauthRouter.getWeiboToken)

// User
app.get('/user', userRouter.findAll)
app.get('/user/one', userRouter.findOne)
app.post('/user', userRouter.addUser)
app.post('/user/vton/add', userRouter.addVton)
app.delete('/user/vton/delete', userRouter.deleteVton)
app.post('/user/retrieval/add', userRouter.addRetrieval)
app.delete('/user/retrieval/delete', userRouter.deleteRetrieval)
app.put('/user/:id', userRouter.updateUser)
app.delete('/user/:id', userRouter.deleteUser)
app.post('/login', userRouter.login)
app.get('/token/:username', userRouter.getToken)
app.get('/activateAccount', userRouter.activateAccount)

// Admin
app.get('/admin', adminRouter.findAll)
app.get('/admin/:id', adminRouter.findOne)
app.post('/admin', adminRouter.addAdmin)
app.put('/admin/:id', adminRouter.updateAdmin)
app.delete('/admin/:id', adminRouter.deleteAdmin)
app.post('/admin/login', adminRouter.login)
app.get('/admin/token/:username', adminRouter.getToken)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// connect to database
const dotenv = require('dotenv')
dotenv.config()
const uri = `${process.env.MONGO_URI}${process.env.MONGO_DB}`
console.log(uri)
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

var db = mongoose.connection

db.on('error', (err) => {
  console.log('connection error', err)
})
db.once('open', function () {
  console.log(`connected to remote mongodb: ${uri}`)
})

module.exports = app;
