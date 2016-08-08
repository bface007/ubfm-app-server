/**
 * Created by bface007 on 07/08/2016.
 */
var User = require( '../model/user' ),
    Message = require( '../model/message' );

module.exports = function ( io ) {
    io.on( 'connection', function ( socket ) {
        console.log( 'a user connected' );
        var userId = socket.request.session.passport.user;

        socket.on( 'have sent new message', function ( data ) {
            data = data.message;
            console.log( "socket.io >>> have sent new message ", data );
            Message.findOne( { _id: data._id } ).populate( '__author' ).exec( function ( err, message ) {
                if( err ) {
                    console.error( "socket.io >>> have sent new message : ", err );
                    return;
                }
                if( message )
                    io.emit( 'new message', message );
            } )
        } );

        socket.on( 'disconnect', function () {
            console.log('user disconnected')
        } );
    } )
};