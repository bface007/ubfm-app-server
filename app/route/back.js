/**
 * Created by bface007 on 24/07/2016.
 */

var utils = require( '../../utils' ),
    Message = require( '../model/message' ),
    User = require( '../model/user' ),
    moment = require( 'moment' ),
    config = require( '../../configs/global' ),
    FCM = require( '../../fcm' );

module.exports = function (app, express, passport, redisClient ) {
    var router = express.Router();

    router.use(function ( req, res, next) {
        req.routes_from = "back";
        console.log("Route from ", req.routes_from);
        next();
    });
    
    router
        .get( '/', isLoggedIn, function ( req, res ) {
            if( req.flash( 'remember_me' ) && req.flash( 'remember_me' ) == 'remember_me' ) {
                var token = utils.randomString( 64 );
                redisClient.set( token, req.user.id );
                res.cookie( 'remember_me', token );
            }
            Message.find( { } ).populate( '__author' ).sort( '-created' ).exec( function ( err, messages ) {
                if( err )
                    return res.send( err );

                res.render( 'pages/dashboard', {
                    pageTitle : 'Tableau de bord',
                    appSide: req.routes_from,
                    user: req.user,
                    messages : messages,
                    moment : moment
                } );
            } );

        } )
        .get( '/users', isLoggedIn, function ( req, res ) {
            User.find( {} ).sort( '-registered' ).exec( function ( err, users ) {
                if( err )
                    return res.send(err);
                
                res.render( 'pages/dashboard-users', {
                    pageTitle : 'Utilisateurs',
                    appSide : req.routes_from,
                    user : req.user,
                    users : users,
                    moment : moment,
                    alerts: {
                        error: [req.flash( 'error' ), req.flash( 'input' )],
                        success : [req.flash( 'success' )]
                    }

                } );
            } );
        } )
        .post( '/users', isLoggedIn, function ( req, res, next ) {
            passport.authenticate( 'local-signup-ex', function ( err, user, info ) {

                if( err )
                    return res.send( err );

                if( ! user ) {
                    req.flash( 'error', info.signupMessage );
                    req.flash( 'input', info.username )
                }else {
                    req.flash( 'success', "L'utilisateur a bien été créé." )
                }

                return res.redirect('/dashboard/users');

            } )( req, res, next )
        } )
        .get( '/test-fcm', function ( req, res ) {
            var fcm = new FCM( config.cloud_messaging.server_key ),
                message = {
                    to: "/topics/discussion",
                    data : {
                        message : "serveur oklm",
                        created : new Date(),
                        user_id : "12458aefe"
                    }
                };
            fcm.send( message, function ( err, messageId ) {
                if( err )
                    console.error( err );
                console.info( messageId );
                res.json( messageId );
            } );
        } )
        .post( '/messages', isLoggedIn, function ( req, res ) {
            res.setHeader( 'X-CSRF-TOKEN', req.csrfToken() );

            if( ! req.body.content || req.body.content == "" )
                return res.json( {
                    success: false,
                    message: "INVALID_CONTENT_LENGTH"
                } );
            
            var newMessage = new Message();
            newMessage.content = req.body.content;
            newMessage.__author = req.user.id;
            
            newMessage.save( function ( err ) {
                if( err )
                    return res.send( err );
                res.json( {
                    success: true,
                    data : newMessage,
                    created : moment( newMessage.created ).format( "HH:mm" )
                } );
            } );
        } );

    return router;
};

function isLoggedIn( req, res, next ) {
    if( req.isAuthenticated() )
        return next();
    res.redirect('/');
}