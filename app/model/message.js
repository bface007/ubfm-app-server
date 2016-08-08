/**
 * Created by bface007 on 01/08/2016.
 */
var mongoose = require( 'mongoose' );

var messageScheme = mongoose.Schema( {
    content : {
        type: String,
        trim: true,
        required: true
    },
    created: Date,
    __author : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
} );

messageScheme.pre( 'save', function ( next ) {
    var message = this,
        now = new Date();
    
    if( ! message.created )
        message.created = now;

    next();
} );

module.exports = mongoose.model( 'Message', messageScheme );