import express from 'express';
import http from 'http';
import path from 'path';
import config from './config/environment';

/* Util Setup (before main) */
setCustomLogger();

// Set Global Variables
global.appRoot = path.resolve(__dirname);
// Set Node Variables
// app.set('utilPath', path.join(config.root, 'client'));

// Init express
const app = express();

// Database Setup
const mongooseSetup = require('./config/mongoose.setup')();

// Express and Webpack Setup 
const expressSetup = require('./config/express').default(app);
// socektSetup();

// Router Setup
const routerSetup = require('./app.routes').default(app);

// Seed Data Setup
// const seedDataSetup = seedDatabaseIfNeeded();

setImmediate(startServer);
exports = module.exports = app;

// Start server
function startServer() {
    const server = http.createServer(app);
    app.angularFullstack = server.listen(config.port, config.ip, function () {
        // console.log("Welcome doyoon, Now server[" + process.env.NODE_ENV + " mode] is running at port 3000");
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}

function setCustomLogger() {
    require('console-stamp')(console, {
        pattern: 'HH:MM:ss',
        colors: {
            stamp: 'yellow',
            label: 'white',
        }
    });
}

function socektSetup() {
    // var socketio = require('socket.io')(server, {
    //   serveClient: config.env !== 'production',
    //   path: '/socket.io-client'
    // });
    // require('./config/socketio').default(socketio);
}


//FIXME: db configuration... info..
//FIXME: Run Cron Job
// const cron = require('./app/controllers/cron.web.server.controller');
// cron.run();

/* from angular fullstack */
// // Connect to MongoDB
// mongoose.connect(config.mongo.uri, config.mongo.options);
// mongoose.connection.on('error', function(err) {
//   console.error(`MongoDB connection error: ${err}`);
//   process.exit(-1); // eslint-disable-line no-process-exit
// });

// // Setup server
// var app = express();
// var server = http.createServer(app);
// var socketio = require('socket.io')(server, {
//   serveClient: config.env !== 'production',
//   path: '/socket.io-client'
// });
// require('./config/socketio').default(socketio);
// require('./config/express').default(app);
// require('./routes').default(app);

// // Start server
// function startServer() {
//   app.angularFullstack = server.listen(config.port, config.ip, function() {
//     console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
//   });
// }

// seedDatabaseIfNeeded();
// setImmediate(startServer);

// // Expose app
// exports = module.exports = app;