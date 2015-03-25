// app/routes.js
module.exports = function(app, passport, jwt) {

    var UserModel          = require('../app/models/user_web');
    var CourseModel        = require('../app/models/course');
    var AuthModel          = require('../app/models/auth');
    
    //some time crap idk it works
    var moment = require('moment');

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

    app.post('/login',  passport.authenticate('local-login', {
        //successRedirect : '/profile', // redirect to the secure profile section
        successRedirect : '/dashboard', // redirect to the secure profile section
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
    app.get('/profile', isLoggedIn, isProf, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/dashboard', isLoggedIn, isProf, function(req, res) {
        res.render('dashboard.ejs', {
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
            return res.send(200, users);
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
                return res.send(200, user);
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
                        return res.send(200, user);
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
                return res.send(200, 'user removed');
            } else {
                console.log(err);
                return res.send(err);
            }
            });
        });
    });

    // =====================================
    // /API/COURSES ========================
    // =====================================

    //GET ALL COURSES
    // --returns json of all coourses
    app.get('/api/courses', function (req, res){
        return CourseModel.find(function (err, courses) {
        if (!err) {
            return res.send(200, courses);
        } else {
            return res.send(err);
        }
        });
    });

    //POST A NEW COURES
    //  --accepts: json format, see below for example
    //  --returns: course id and information
    app.post('/api/courses', function (req, res) {
        var newCourse            = new CourseModel();

        //console.log(req);

        newCourse.name           = req.body.name;
        newCourse.section        = req.body.section;
        newCourse.num            = req.body.num;
        newCourse.professor      = req.body.professor;
        newCourse.classDays.day1 = req.body.day1;
        newCourse.classDays.day2 = req.body.day2;
        newCourse.classDays.day3 = req.body.day3;
        newCourse.startTime      = req.body.startTime;
        newCourse.duration       = req.body.duration;

        // save the user
        newCourse.save(function(err, course) {
            if (err)
                return err;
        });

        return res.send(200, newCourse);
    });
    /* 
    //JSON template for creating a new course
    {
        "name":"Mobile Application Development",
        "section":"CMSC",
        "num":"491",
        "professor": "550b1179174221f00a084c57",
        "day1":"Tuesday",
        "day2":"Thursday",
        "startTime":"2:00PM",
        "duration":"75"
    }
    */

    //UPDATE A COURSE


    //DELETE A COURSE BY ID
    //  --accepts id as url parameter
    //  --returns success or err
    app.delete('/api/courses/:id', function (req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            try{
                return course.remove(function (err) {
                    if (!err) {
                        //console.log("removed");
                        return res.send(200, 'course removed');
                    } else {
                        //console.log(err);
                        return res.send(400);
                    }
                });
            }catch(err){
                return res.send(400);
            }
        });
    });

    // =====================================
    // /API/USERS ACCESS FUNCTIONS =========
    // =====================================

    //API CALL TO CREATE A NEW USER
    // --accepts: JSON -> {"email":"user_email","password":"user_password(plain text),"role":"student or professor(depends on login location: app- student, web-professor)"}
    // --returns auth token and 'id' in JSON if good
    app.post('/api/signup', function(req, res, next) {
      passport.authenticate('local-signup', {session: false }, function(err, user, info) {
        if (err) { return res.json({status:"error in authentication"}) }
        if (!user) {
            return res.json({ status: 'no user' });
        }

        var expire = moment().add(7 ,'days').valueOf();

        //user has authenticated correctly thus we create a JWT token 
        //can set expiration in .encode if we need
        var token = jwt.encode({ username: user.local.email, expire: expire }, app.get('tokenSecret'));

        var auth            = new AuthModel();

        //console.log(req);
        auth.user_id =  user.id;
        auth.code    =  token;

        // save the user
        auth.save(function(err) {
            if (err)
                return res.json({status: "mongo save error"});
        });

        res.json({auth: token, id: user.id});


      })(req, res, next);
    });

    //API CALL TO LOGIN A USER
    // --accepts: JSON -> {"email":"user_email","password":"user_password(plain text)}
    // --returns  auth token and 'id' in JSON if good

    app.post('/api/login', function(req, res, next) {
      passport.authenticate('local-login', {session: false }, function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.json(401, { status: 'false' });
        }

        var expire = moment().add(7 ,'days').valueOf();

        //user has authenticated correctly thus we create a JWT token 
        //can set expiration in .encode if we need
        var token = jwt.encode({ username: user.local.email, expire: expire }, app.get('tokenSecret'));

        var auth            = new AuthModel();

        //console.log(req);
        auth.user_id =  user.id;
        auth.code    =  token;

        // save the user
        auth.save(function(err) {
            if (err)
                return res.json({status: "mongo save error"});
        });

        res.json({auth: token, id: user.id});

      })(req, res, next);
    });


    //CHECK IF USER IS LOGGED IN
    //  --accepts json of auth token
    //  --returns true if active or false if not
    app.post('/api/logged', function(req, res){

        AuthModel.findOne({ 'code' : req.body.auth } , function (err, auth) {
              if (err) { return res.json({ status : "error: error in findOne()"}) }
              if (!auth) {
                 return res.json({ status : "false" });
              }
              else {
                var decoded = jwt.decode(req.body.auth, app.get('tokenSecret'));
                if(decoded.expire > moment().valueOf())
                    return res.json({status: 'true'});
                return res.json({status: 'false'});
              }
        });         
    });

    //LOGOUT A USER
    // --accepts json of auth token
    // --returns true if success logout
    app.post('/api/logout', function(req, res) {
        AuthModel.findOne({ 'code' : req.body.auth } , function (err, auth) {
            try{
                return auth.remove(function (err) {
                    if (!err) {
                        //console.log("removed");
                        return res.json({status: 'true'});
                    } else {
                        //console.log(err);
                        return res.json({status: 'error in remove'});
                    }
                });
            }catch(err){
                return res.json({error: 'caught error in remove'});
            }
        });
    });

    //GET ALL AUTH TOKENS
    // need to set admin role for this
    app.get('/api/auths', function (req, res){
        return AuthModel.find(function (err, auths) {
        if (!err) {
            return res.send(auths);
        } else {
            return res.json({error: 'err in find'});
        }
        });
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

function isProf(req, res, next) {
    if(req.user.role)
        if(req.user.role === "professor")
            return next();
   // res.redirect('/login');
   res.render('login.ejs', { message: 'Only professors may use the Web App' }); 
}
