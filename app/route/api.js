/**
 * Created by bface007 on 24/07/2016.
 */
module.exports = function (app, express) {
    var router = express.Router();

    router.use(function ( req, res, next) {
        req.routes_from = "api";
        console.log("Route from ", req.routes_from);
        next();
    });
    
    return router;
};