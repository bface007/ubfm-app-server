/**
 * Created by bface007 on 24/07/2016.
 */
var mongoose = require( 'mongoose' ),
    dbConfig = require( '../../configs/db' ),
    utils    = require( '../../utils' ),
    database_uri = utils.generateDBUri( dbConfig().user, dbConfig().password, dbConfig().host, dbConfig().db_name );

// create database connection
mongoose.connect( database_uri );

// DATABASE CONNECTION EVENTS
//===========================
// when succesfully connected
mongoose.connection.on('connected', function () {
    console.log("Mongoose default connection open to "+ database_uri);
});

// if the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log("Mongoose default connection error: "+ err);
});

// when the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// if the node process ends, close the mongoose connection
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});