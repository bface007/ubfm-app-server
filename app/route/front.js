/**
 * Created by bface007 on 24/07/2016.
 */
var User = require( '../model/user' ),
    mongoose = require( 'mongoose' ),
    utils = require( '../../utils' );

module.exports = function (app, express, passport, redisClient ) {
    var router = express.Router();

    router.use( function ( req, res, next) {
        req.routes_from = "front";
        console.log("Route from ", req.routes_from);
        next();
    } );

    router
        .get( '/logout', function ( req, res ) {
        // clear the remember me cookie when logging out
        res.clearCookie( 'remember_me' );
        req.logout();
        res.redirect( '/' );
    } );

    router.use( function ( req, res, next ) {
        if( req.isAuthenticated() )
            return res.redirect('/dashboard');
        next();
    } );

    
    router
        .get( '/drop', function ( req, res ) {
            for(collection in mongoose.connection.collections){
                mongoose.connection.collections[collection].drop(function (err) {
                    if(err)
                        console.error(err);

                    console.log(collection + " dropped");
                });
            }
            res.json({ message: "Database dropped!"})
        } );

    router
        .get( '/', checkIfThereIsAlreadyOneUser, function ( req, res ) {
            res.render( 'pages/index', {
                pageTitle : 'Connexion',
                message : req.flash( 'loginMessage' ),
                appSide : req.routes_from
            } );
        })
        .get( '/first-init', function ( req, res ) {
            res.render( 'pages/signup', {
                pageTitle : 'Première utilisation',
                message : req.flash( 'signupMessage' ),
                appSide : req.routes_from
            } )
        } )
        .post( '/login', function ( req, res, next ) {
            passport.authenticate( 'local-login', function ( err, user, info ) {

                res.setHeader( 'X-CSRF-TOKEN', req.csrfToken() );

                if( err )
                    return next( err );

                if( ! user )
                    return res.json( {
                        success : false,
                        message : info.loginMessage,
                        input   : info.input
                    } );



                req.login( user, function ( err ) {
                    if( err )
                        return next( err );

                    if( req.body.remember_me )
                        req.flash( 'remember_me', 'remember_me' );

                    res.json( {
                        success : true
                    } )
                } )
                
            } )( req, res, next )
        })
        .post( '/signup', function ( req, res, next ) {
            passport.authenticate( 'local-signup', function ( err, user, info ) {

                res.setHeader( 'X-CSRF-TOKEN', req.csrfToken() );

                if( err )
                    return next( err );

                if( ! user )
                    return res.json( {
                        success : false,
                        message : info.signupMessage,
                        input   : info.input
                    } );

                res.json( {
                    success : true
                } )

            } )( req, res, next )
        } );

    return router;
};

function checkIfThereIsAlreadyOneUser( req, res, next ) {
    User.findOne( {}, function ( err, user ) {
        if( err ) {
            res.send( err );
            console.log( err );
        }

        if( ( user && req.path == '/' ) || ( !user && req.path == '/first-init' ))
            next();
        else if( ( user && req.path != '/' ) )
            res.redirect( '/' );
        else
            res.redirect( '/first-init' );
    } )
}


