/**
 * Created by bface007 on 24/07/2016.
 */
var Message = require( '../model/message' ),
    User = require( '../model/user' );

module.exports = function (app, express) {
    var router = express.Router();

    router.use(function ( req, res, next) {
        req.routes_from = "api";
        console.log("Route from ", req.routes_from);
        next();
    });

    router
        .get( '/messages', function ( req, res ) {
            Message.find( {} ).populate( "__author" ).sort( "created" ).exec( function ( err, messages ) {
                if( err ) {
                    console.error("api get messages ", err);
                    return res.send(err);
                }

                res.json( messages );
            } )
        } )
        .post( '/users', function ( req, res ) {
            var newUser = new User();
            newUser.username = req.body.username;
            newUser.avatar = req.body.picture;
            newUser.role = "user";
            newUser.facebook.id = req.body.id;
            newUser.facebook.email = req.body.email;
            newUser.facebook.name = req.body.username;
            newUser.facebook.link = req.body.link;
            newUser.facebook.gender = req.body.gender;

            newUser.save( function (err) {
                if(err)
                    return res.send(err);
                res.json(newUser);
            } )
        } )
        .post( '/messages', function ( req, res ) {
            var newMessage = new Message();
            newMessage.content = req.body.content;
            newMessage.__author = req.body.userId;

            newMessage.save( function (err) {
                if(err)
                    return res.send(err);
                Message.findOne( { _id: newMessage._id } ).populate( "__author" ).exec( function (err, message) {
                    if(err)
                        return res.send(err);
                    res.json(message);
                } )
            } )
        } );
    
    return router;
};