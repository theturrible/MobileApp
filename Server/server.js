// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path 	 = require('path');
var server   = require('http').createServer(app)
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var jwt 		 = require('jwt-simple');
var io           = require('socket.io').listen(server); 
var configDB     = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('tokenSecret', 'vcurams');

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
}

// required for passport
app.use(session({ secret: 'ramsvcu' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport')(app, passport, jwt); // pass passport for configuration

// routes ======================================================================
require('./app/routes.js')(app, passport, jwt, io); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.start(port);
console.log('The magic happens on port ' + port);