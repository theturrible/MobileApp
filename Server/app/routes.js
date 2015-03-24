// app/routes.js
module.exports = function(app, passport) {

    var UserModel          = require('../app/models/user_web');
    //var UserModel            = require('../app/models/user');

    // =====================================
    // Web-based user account access =======
    // =====================================

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index_3.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    // =====================================
    // API =================================
    // =====================================

    // =====================================
    // /API/USERS ==========================
    // =====================================

    //GET ALL USERES
    // --returns all users, needs admin role check
    app.get('/api/users', function (req, res){
        return UserModel.find(function (err, users) {
        if (!err) {
            return res.send(users);
        } else {
            return res.send(err);
        }
        });
    });

    //CREATE A NEW USER
    //commented this out but leaving for reference. USE /API/SIGNUP
    /*
    app.post('/api/users', function (req, res) {
        var newUser            = new UserModel();

        // set the user's local credentials
        newUser.local.email    = req.body.email;
        newUser.local.password = req.body.password;
        newUser.role           = req.body.role;

        // save the user
        newUser.save(function(err) {
            if (err)
                throw err;
                    return done(null, newUser);
        });

        return res.send(newUser);
    });
    */

    //GET USER BY ID
    // --accepts _id of user as url extension
    // --returns: user schema in json
    app.get('/api/users/:id', function (req, res){
        return UserModel.findById(req.params.id, function (err, user) {
            if (!err) {
                return res.send(user);
            } else {
                return res.send(err);
            }
        });
    });

    /*
    Example of getting a model by where email = req.body.email
    app.post('/api/users/login', function (req, res){
        console.log(req.body.email);
        return UserModel.findOne({'local.email': req.body.email}, function(err, user){
            if (!err) {
                console.log("FOUND: " + user.local.password);
            } else {
                console.log(err);
            }
            return res.send(user);
        });
    });
    */

    //UPDATE USER BY ID
    // --accepts ID as url parameter
    // --returns updated user json data if successful, else returns the err.

    //can add for new fields in user ie) FNAME and LNAME
    // --accepts JSON format of data for email, password, and role;
    app.put('/api/users/:id', function (req, res){
        return UserModel.findById(req.params.id, function (err, user) {
            if(req.body.email){
                user.local.email = req.body.email;
            }

            if(req.body.password){
                user.local.password = user.generateHash(req.body.password);
            }

            if(req.body.role){
                 user.role = req.body.role;
            }

                return user.save(function (err) {
                    if (!err) {
                        //console.log("updated");
                        return res.send(user);
                    } else {
                        //console.log(err);
                        return res.send(err);
                    }
                });
        });
    });

    //DELETE A USER BY ID
    //  --accepts ID as url parameter
    //  --returns user as json data, else returns err
    app.delete('/api/users/:id', function (req, res) {
        return UserModel.findById(req.params.id, function (err, user) {
            return user.remove(function (err) {
            if (!err) {
                //console.log("removed");
                return res.send('user removed');
            } else {
                console.log(err);
                return res.send(err);
            }
            });
        });
    });

    // =====================================
    // /API/USERS ACCESS FUNCTIONS +========
    // =====================================

    //API CALL TO CREATE A NEW USER
    // --accepts: JSON -> {"email":"user_email","password":"user_password(plain text),"role":"student or professor(depends on login location: app- student, web-professor)"}
    // --returns 'id' in JSON or unauthorized if it fails.
    app.post('/api/signup', passport.authenticate('local-signup'),
        function(req, res) {
            //res.json({ id: req.user.id, email: req.user.email });
            //returns id if successful
            res.json({ id: req.user.id });
        }
    );

    //API CALL TO LOGIN A USER
    // --accepts: JSON -> {"email":"user_email","password":"user_password(plain text)}
    // --returns 'id' in JSON or unauthorized if it fails.
    app.post('/api/login', passport.authenticate('local-login'),
        function(req, res) {
            //res.json({ id: req.user.id, email: req.user.email });
            //returns id if successful
            //console.log(req.user.local.email);
            res.json({ id: req.user.id });
        }
    );

    // --returns true if the user who ade api call is logged in on server side session, false otherwise or not logged in.
    app.get('/api/logged', function(req, res){
        //console.log(req);
        if(req.isAuthenticated())
            //console.log(req.user.local.email);
            return res.send(true);
        return res.send(false);
    });

    // --returns true if logout of user who made api call is logged out, false otherwise.
    app.get('/api/logout', function(req, res) {
        try{
            //console.log(req.user.local.email);
            req.logout();
        }catch(err){
            return res.send(err);
        }
        return res.send(true);
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}