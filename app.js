var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var barajasRouter = require('./routes/barajas');
var juego7yMedioRouter = require('./routes/juego7ymedio'); 

var app = express();

app.use(session({
  secret: 'asdtGNKRfl-Fbyy',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/barajas', barajasRouter);
app.use('/juego7ymedio', juego7yMedioRouter); 

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
