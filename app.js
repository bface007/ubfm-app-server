/*eslint-env node*/

var express = require('express'),
    logger = require( 'morgan' ),
    bodyParser = require( 'body-parser' ),
    cors = require( 'cors' );




// create a new express server
var app = express();

app.use( logger('dev') );

app.use( cors() );
app.use( bodyParser.urlencoded( { extended : true } ) );
app.use( bodyParser.json() );

// DATABASE LAUNCH
// ==================================================
require( './app/model/db' );

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
