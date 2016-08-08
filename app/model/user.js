/**
 * Created by bface007 on 25/07/2016.
 */
var mongoose = require( 'mongoose' ),
    bcrypt = require( 'bcrypt-nodejs' );

var userSchema = mongoose.Schema( {
    username : {
        type: String,
        unique: true,
        required: true,
        minlength: 4,
        maxlength: 25,
        trim: true
    },
    password : {
        type: String,
        required: true,
        select: false,
        trim: true,
        minlength: 8
    },
    registered: {
        type: Date,
        select: false
    },
    avatar : String,
    last_activity: Date,
    facebook : {
        id : {
            type: String
        },
        token        : {
            type: String
        },
        email : {
            type: String
        },
        name : String
    }
} );

userSchema.pre( 'save', function ( next ) {
    var user = this,
        now = new Date();

    if( ! user.registered )
        user.registered = now;

    // break out if the password hasn't changed
    if( ! user.isModified( 'password' ) )
        return next();

    bcrypt.genSalt( 5, function ( err, salt ) {
        if( err )
            return next( err );

        bcrypt.hash( user.password, salt, null, function ( err, hash ) {
            if( err )
                return next( err );

            user.password = hash;
            next();
        } )
    } )
} );

// checking if password is valid
userSchema.methods.isValidPassword = function( password ) {
    console.log( 'andddddd ?' );
    var isValid = false;
    try {
        isValid = bcrypt.compareSync( password, this.password );
    } catch ( e ) {
        console.log( e )
        console.log( password, " ==== "+ this );
    }
    return isValid;
};

module.exports = mongoose.model( 'User', userSchema );