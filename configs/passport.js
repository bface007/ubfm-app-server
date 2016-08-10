/**
 * Created by bface007 on 25/07/2016.
 */
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy,
    RememberMeStrategy = require( 'passport-remember-me' ).Strategy;

// load up the user model
var User            = require('../app/model/user'),
    validator       = require( 'validator' ),
    utils           = require( '../utils' );

module.exports = function ( passport, redisClient ) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use( 'local-signup', new LocalStrategy( {
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, function ( req, username, password, done ) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick( function () {

            if( ! validator.isAlphanumeric( username, 'en-GB' ) )
                return done( null, false, { 'signupMessage': 'Le nom d\'utilisateur ne doit comporter que des caractères alphanumériques sans accent et sans espace.', input: 'username' } );

            if( ! validator.isLength( username, { min: 4, max: 25 } ) )
                return done( null, false, { signupMessage: 'Le nom d\'utilisateur doit être entre 4 et 25 caractères', input: 'username' } );

            if( password != req.body.confirmed )
                return done( null, false, { 'signupMessage': 'Le mot de passe et la confirmation ne correspondent pas.', input: 'password+confirm' } );

            if( ! validator.isLength( password, { min: 8 } ) )
                return done( null, false, { signupMessage: 'Le mot de passe doit être d\'au moins 8 caractères', input: 'password' } );

            if( validator.contains( password, " " ) )
                return done( null, false, { signupMessage: 'Le mot de passe ne peut pas contenir d\'espace', input: 'password' } );
            
            User.findOne( { username: username }, function ( err, user ) {
                if( err )
                    return done( err );

                if( user )
                    return done( null, false, { 'signupMessage': 'Ce nom d\'utilisateur est déja pris', input: 'username' } );
                else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = password;

                    // save the user
                    newUser.save( function( err ) {
                        if ( err )
                            throw err;
                        return done( null, newUser );
                    } );
                }
            } );
        } );
    } ) );


    // =========================================================================
    // LOCAL SIGNUP EX ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use( 'local-signup-ex', new LocalStrategy( {
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, function ( req, username, password, done ) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick( function () {

            if( ! validator.isAlphanumeric( username, 'en-GB' ) )
                return done( null, false, { 'signupMessage': 'Le nom d\'utilisateur ne doit comporter que des caractères alphanumériques sans accent et sans espace.', input: 'username' } );

            if( ! validator.isLength( username, { min: 4, max: 25 } ) )
                return done( null, false, { signupMessage: 'Le nom d\'utilisateur doit être entre 4 et 25 caractères', input: 'username' } );

            if( password != req.body.confirmed )
                return done( null, false, { 'signupMessage': 'Le mot de passe et la confirmation ne correspondent pas.', input: 'password+confirm' } );

            if( ! validator.isLength( password, { min: 8 } ) )
                return done( null, false, { signupMessage: 'Le mot de passe doit être d\'au moins 8 caractères', input: 'password' } );

            if( validator.contains( password, " " ) )
                return done( null, false, { signupMessage: 'Le mot de passe ne peut pas contenir d\'espace', input: 'password' } );

            User.findOne( { username: username }, function ( err, user ) {
                if( err )
                    return done( err );

                if( user )
                    return done( null, false, { 'signupMessage': 'Ce nom d\'utilisateur est déja pris', input: 'username' } );
                else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = password;
                    newUser.role = req.body.role;

                    // save the user
                    newUser.save( function( err ) {
                        if ( err )
                            throw err;
                        return done( null, newUser );
                    } );
                }
            } );
        } );
    } ) );

    passport.use( 'local-login', new LocalStrategy( {
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function ( req, username, password, done ) {

        User.findOne( { username : username })
                .select( 'password' )
                    .exec( function ( err, user ) {
                        if( err )
                            return done(err);

                        console.log('there');

                        // if no user is found or password is wrong, return the message
                        if( ! user || ! user.isValidPassword( password ) ) {
                            console.log( 'and there' );
                            return done( null, false, { 'loginMessage': "Nom d'utilisateur ou mot de passe incorrecte", input: 'username' } );
                        }
                        console.log( 'and also there' );

                        // all is well, return successful user
                        return done( null, user );
        } );

    } ) );

    passport.use( new RememberMeStrategy( function ( token, done ) {
        consumeRememberMeToken( token, redisClient, function ( err, uid ) {
            if( err )
                return done( err );
            if( ! uid )
                return done( null, false );

            User.findById( uid, function ( err, user ) {
                if( err )
                    return done( err );
                if( ! user )
                    return done( null, false );

                done( null, user );
            } );
        } )
    }, function ( user, done ) {
        var token = utils.randomString( 64 );
        redisClient.set( token, user.id );
        done( null, token );
    } ) );
};

function consumeRememberMeToken( token, redisClient, fn ) {
    redisClient.get( token, function ( err, reply ) {
        if( err )
            return fn( err );

        if( ! reply )
            return fn( null, false );

        redisClient.del( token, function ( err, reply ) {} );

        fn( null, reply );
    } );
}