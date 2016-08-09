/**
 * Created by bface007 on 24/07/2016.
 */
var Message = require( '../model/message' );

module.exports = function (app, express) {
    var router = express.Router();

    router.use(function ( req, res, next) {
        req.routes_from = "api";
        console.log("Route from ", req.routes_from);
        next();
    });

    router
        .get( '/messages', function ( req, res ) {
            Message.find( {} ).populate( "__author" ).sort( "-created" ).exec( function ( err, messages ) {
                if( err ) {
                    console.error("api get messages ", err);
                    return res.send(err);
                }

                res.json( messages );
            } )
        } );
    
    return router;
};