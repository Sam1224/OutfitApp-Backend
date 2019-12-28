var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.get('/user', userRouter.findAll)
app.get('/user/one', userRouter.findOne)
app.post('/user', userRouter.addUser)
app.put('/user/:id', userRouter.updateUser)
app.delete('/user/:id', userRouter.deleteUser)
app.post('/login', userRouter.login)
app.get('/token/:username', userRouter.getToken)

app.get('/admin', adminRouter.findAll)
app.get('/admin/:id', adminRouter.findOne)
app.post('/admin', adminRouter.addAdmin)
app.put('/admin/:id', adminRouter.updateAdmin)

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
const url = 'mongodb://sam:yyq19981212@ds021016.mlab.com:21016/heroku_lzpgpltq'
mongoose.connect(url)

var db = mongoose.connection

db.on('error', (err) => {
  console.log('connection error', err)
})
db.once('open', function () {
  console.log(`connected to remote mongodb: ${url}`)
})

module.exports = app;
