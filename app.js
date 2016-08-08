/*eslint-env node*/

var express = require('express'),
    logger = require( 'morgan' ),
    bodyParser = require( 'body-parser' ),
    cors = require( 'cors' ),
    cookieParser = require( 'cookie-parser' ),
    session = require( 'express-session' ),
    flash = require( 'connect-flash' ),
    passport = require( 'passport' ),
    config = require( './configs/global' ),
    csrf = require( 'csurf' ),
    redis           = require( 'redis' ),
    redisStore = require( 'connect-redis' )( session ),
    uuid = require( 'node-uuid' ),
    redisClient = redis.createClient( {
      port : config.redis.port,
      password : config.redis.password,
      host : config.redis.host
    } );




// create a new express server
var app = express();

app.use( logger('dev') );

app.use( cors() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended : true } ) );

var sessionMiddleWare = session( {
    cookie: { maxAge : 1000 * 3600 * 24 * 7 },
    secret: config.secret,
    resave : false,
    saveUninitialized : false ,
    genId : function() {
        return uuid.v4();
    },
    store: new redisStore( {
        host : config.redis.host,
        port : config.redis.port,
        pass : config.redis.password
    } )
} );
app.use( sessionMiddleWare );
app.use( cookieParser() );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( flash() );

// DATABASE LAUNCH
// ==================================================
require( './app/model/db' );

redisClient.on( 'error', function ( err ) {
  console.log( 'redis ', err );
} );

require( './configs/passport' ) ( passport, redisClient );
app.use( passport.authenticate( 'remember-me' ) );


app.set( 'view engine', 'ejs' );

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use( express.static( __dirname + '/node_modules/superagent' ) );
app.use( express.static( __dirname + '/node_modules/validator' ) );
app.use( express.static( __dirname + '/node_modules/moment/min' ) );

app.locals.env = process.env.VCAP_APP_PORT ? "prod" : "dev";



// ROUTES
var apiRoutes = require( './app/route/api' )( app, express );
var frontRoutes = require( './app/route/front' )( app, express, passport, redisClient );
var backRoutes = require( './app/route/back' )( app, express, passport, redisClient );

app.use('/api', apiRoutes);

app.use( csrf() );

/**
 * use custom middleware to pass the CSRF token to all the templates using response.local
 */
app.use( function ( req, res, next ) {
  res.locals.csrfToken = req.csrfToken();
  next();
} );
app.use('/dashboard', backRoutes);

app.use('/', frontRoutes);






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


module.exports = {
    app: app,
    sessionMiddleware: sessionMiddleWare
};
