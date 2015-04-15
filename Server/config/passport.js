// config/passport.js

//npm install -g tishadow -- titanium sim detects file changes and

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var BearerStrategy = require('passport-http-bearer').Strategy;

// load up the user model
var User            = require('../app/models/user_web');

var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'whiteboard491@gmail.com',
        pass: 'vcurams15'
    }
});

// expose this function to our app using module.exports
module.exports = function(app, passport, jwt) {

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
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'Invalid Email or password.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Invalid Email or password.')); // create the loginMessage and save it to session as flashdata

            if(user.validated === 'false')
                return done(null, false, req.flash('loginMessage', 'Please check your email for verfication link.'));
            // all is well, return successful user
            return done(null, user);
        });

    }));


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        //console.log(role);
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                var ext = email.split("@")[1];
                //console.log(ext);
                if(ext !== 'vcu.edu'){
                    return done(null, false, req.flash('signupMessage', 'That email is not an @vcu.edu domain.'))
                }else{
                    // create the user
                    var newUser            = new User();

                    // set the user's local credentials
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.role           = req.body.role;
                    newUser.validated      = false;

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        var token = jwt.encode({ id :  newUser.id }, app.get('tokenSecret'));

                        var textLink = "http://" + req.headers.host + "/verif?token=" + token;

                        var mailOptions = {
                            from: 'Whiteboard ✔ <whiteboard491@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: 'Whiteboard Email Verification ✔', // Subject line
                            //text: ,  plaintext body
                            generateTextFromHTML: true,
                            html: '<b>Signup Confirmation ✔</b><br />'
                                + '<a href=\"'+ textLink.toString() + '\">Click here to activate your account.</a>'
                                + '<br />' 
                                + '<br /> Text link: ' + textLink
                            };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                return done(error);
                            }else{
                                return done(null, newUser, req.flash('signupMessage','Verification has been sent to your email. Please follow the link to complete registration.'));
                            }
                        });
                    });
                }
            }

        });

        });

    }));

};
