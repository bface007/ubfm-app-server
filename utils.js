/**
 * Created by bface007 on 24/07/2016.
 */
module.exports = {
    generateDBUri : generateDBUri,
    StringBuilder : StringBuilder,
    randomString  : randomString
};

function generateDBUri( dbUser, dbPassword, dbHost, dbName ) {
    return new StringBuilder()
                .append( "mongodb://" )
                .append( dbUser )
                .append( ":" )
                .append( dbPassword )
                .append( "@" )
                .append( dbHost )
                .append( dbName )
                .toString()
}

function StringBuilder() {
    var stringsArray = [];

    this.append = append;
    this.toString = toString;

    var _self = this;

    function append(string) {
        stringsArray.push(string);
        return _self;
    }

    function toString() {
        var toReturn = "";

        stringsArray.map(function (string) {
            toReturn += string;
        });

        return toReturn;
    }
}

function randomString( len ) {
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
}