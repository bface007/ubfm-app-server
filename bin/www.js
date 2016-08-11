/**
 * Created by bface007 on 24/07/2016.
 */
var app = require( '../app' ).app,
    http = require( 'http' ),
    socket = require( 'socket.io' ),
    sessionMiddleware = require( '../app' ).sessionMiddleware;

var server = http.createServer( app ),
    io = socket( server );

var port = normalizePort( process.env.OPENSHIFT_NODEJS_PORT || 8080 );
var host = process.env.VCAP_APP_HOST || 'localhost';


require( '../app/socket/io' )( io );

server.listen( port, host );
server.on( 'error', onError );
server.on( 'listening', onListening );

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}