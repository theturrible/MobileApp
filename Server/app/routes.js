// app/routes.js
module.exports = function(app, passport, jwt) {

    var UserModel          = require('../app/models/user_web');
    var CourseModel        = require('../app/models/course');
    var AuthModel          = require('../app/models/auth');
    var CheckInModel       = require('../app/models/checkIn');
    
    //some time crap idk it works
    var moment = require('moment');

    //node mail module
    var nodemailer = require('nodemailer');

    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'whiteboard491@gmail.com',
            pass: 'vcurams15'
        }
    });


    // =====================================
    // Web-based user account access =======
    // =====================================


    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', checkSession, function(req, res) {
        res.render('index_3.ejs'); // load the index.ejs file
    });


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', checkSession, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    //post for login authentication
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
    function confirmPassSU(req, res, next){
        if(req.body.compare !== req.body.password){
            return res.render('signup.ejs', { message : 'Passwords do not match!' });
        }else{
            return next();
        }
    }

    function confirmPassFP(req, res, next){
        if(req.body.compare !== req.body.password){
            return res.render('forgot.ejs', { message : 'Passwords do not match!' });
        }else{
            return next();
        }
    }

   

    app.get('/signup', checkSession ,function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });



    // process the signup form
    app.post('/signup', checkSession, confirmPassSU , passport.authenticate('local-signup', {
        //successRedirect : '/profile', // redirect to the secure profile section
        successRedirect : '/signup', // redirect to the secure profile section
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

    app.get('/verif', function(req, res) {
        var decoded = jwt.decode(req.query.token, app.get('tokenSecret'));
        
        UserModel.findById( decoded.id , function(err, user){
            if(err)
                return res.send(err);
            try{
                if(user.validated === 'true')
                        res.render('login.ejs', {
                            message : 'Already verified! You can login.'
                        });
                    user.validated = true;

                    user.save( function(err){
                        if(err)
                            return res.send(err);
                        res.render('login.ejs', {
                            message : 'You are now verified and may login'
                        });
                    });
            }catch(err){
                res.render('login.ejs', {
                    message : 'Link Expired'
                });
            }
        });
        
    });

    app.get('/forgot', function(req, res) {
        var decoded = jwt.decode( req.query.token, app.get('tokenSecret'));
        if(decoded.expire > moment().valueOf())
            res.render('forgot.ejs', {
                message : req.flash('loginMessage'),
                token   : req.query.token
            });
        res.render('login.ejs', {
            message : 'Password reset link expired'
        });
    });

    app.post('/forgot',  confirmPassFP , function(req, res) {
        var decoded = jwt.decode( req.body.token, app.get('tokenSecret'));

        UserModel.findOne({ 'local.email' : decoded.email}, function(err, user){
            if(err)
                return res.send(err);
            user.local.password = user.generateHash(req.body.password);

            user.save(function(err){
                if(err)
                    return res.send(err);
                res.render('login.ejs', {
                    message : 'Password has been reset!'
                });
            });
        });
    });

    app.post('/login/forgot', function(req, res) {  
        var expire = moment().add(1, 'day').valueOf();

        var token = jwt.encode({ 'email' : req.body.email, 'expire' : expire }, app.get('tokenSecret'));

        var textLink = "http://" + req.headers.host + "/forgot?token=" + token;

        var mailOptions = {
            from: 'Whiteboard ✔ <whiteboard491@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Whiteboard Password Resest ✔', // Subject line
            //text: ,  plaintext body
            generateTextFromHTML: true,
            html: '<b>Password Reset ✔</b><br />'
                + '<a href=\"'+ textLink.toString() + '\">Click here to reset your password.</a>'
                + '<br />' 
                + '<br /> Text link: ' + textLink
            };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return error;
            }else{
               res.render('login.ejs', {
                    message : 'Check your email to reset your password.'
               });
            }
        });
    });

    //Get the dashboard if logged in and are a Professor
    app.get('/dashboard', isLoggedIn, isProf, function(req, res) {
        return CourseModel.find({'professor': req.user.id }, function(err, course){
            if(err) 
                throw err;
            res.render('dashboard.ejs', {
                course: course,
                user : req.user,  //get the user out of session and pass to template
                message : req.flash('dashMessage')
            });
        });
    });

    //Get the addcourse page
    app.get('/AddCourse', isLoggedIn, isProf, function(req, res) {
        res.render('AddCourse.ejs', {
            user : req.user, // get the user out of session and pass to template
            message : req.flash('addCourseMessage')
        });
    });

    //Post a new course from webapp
    app.post('/AddCourse', isLoggedIn, isProf, function(req, res) {

        var newCourse            = new CourseModel();

        //console.log(req.user);

        newCourse.name           = req.body.name;
        newCourse.section        = req.body.section;
        newCourse.num            = req.body.num;
        newCourse.professor      = req.body.professor;
        newCourse.profName       = req.user.local.email;

        if(req.body.day1){
            newCourse.classDays.day1 = 'Monday';
        }
        if(req.body.day2){
            newCourse.classDays.day2 = 'Tuesday';
        }
        if(req.body.day3){
            newCourse.classDays.day3 = 'Wednesday';
        }
        if(req.body.day4){
            newCourse.classDays.day4 = 'Thursday';
        }
        if(req.body.day5){
            newCourse.classDays.day5 = 'Friday';
        }
        
        newCourse.startTime      = req.body.startTime;
        newCourse.duration       = req.body.duration;

        // save the user
        newCourse.save(function(err, course) {
            if (err) {
                res.render('AddCourse.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    message : 'Failed to add course'
                });
            }else{
                 res.redirect('/dashboard');
            }
        });
    });

    
    //Get course page by id
    app.get('/course/:id', isLoggedIn, isProf, function(req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            //console.log()
            if (!err && course.professor === req.user.id) {
                res.render('course.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    course : course,
                    message : req.flash('addCourseMessage')
                });
            } else {
                res.render('AddCourse.ejs', {
                    user : req.user, // get the user out of session and pass to template
                    message : 'Could not find course'
                });
            }
        });
    });

    app.post('/course/announce/:id', isLoggedIn, isProf, function(req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {

            var time = moment().format('LLLL');
            var announce = { 'body': req.body.message, 'create' : time };
            course.announce.push(announce);

            return course.save(function (err) {
                if (!err) {
                    //console.log("updated");
                    return  res.redirect('/course/'+req.params.id);
                } else {
                    //console.log(err);
                    return res.json({status : "error in save"});
                }
            });
        });
    });

    app.post('/course/assign/:id', isLoggedIn, isProf, function(req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            var time = moment().format('LLLL');
            var assign = { 
                            'name'    : req.body.name, 
                            'body'    : req.body.body,
                            'dueDate' : req.body.date,
                            'dueTime' : req.body.time,
                            'points'  : req.body.points,
                            'create'  : time
                         };

            //console.log(assign);

            course.assign.push(assign);

            return course.save(function (err) {
                if (!err) {
                    //console.log("updated");
                    return  res.redirect('/course/'+req.params.id);
                } else {
                    //console.log(err);
                    return res.json({status : "error in save"});
                }
            });
        });
    });

    app.get('/course/checkin/:id', isLoggedIn, isProf, function(req, res) {
        return CheckInModel.find({'courseId' : req.params.id }, function (err, checkIn) {
            if (!err) {
                res.render('checkin.ejs', {
                    req  : req,
                    user : req.user, // get the user out of session and pass to template
                    checkin : checkIn,
                    message : req.flash('addCourseMessage'),
                    moment: moment
                });
            }
        });
    });

    app.post('/course/checkin/:id', isLoggedIn, isProf, function(req, res) {
       var check = new CheckInModel();

       check.courseId = req.params.id;
       expire = moment().add(req.body.expire, 'm').format();
       check.expire = expire;
       check.create = moment().format();

       check.save(function (err,check) {
            if (!err) {
                var token = jwt.encode({ expire : expire, id :  check.id }, app.get('tokenSecret'));
                check.token = token;
                check.save(function (err) { 
                    if(!err){
                        return res.redirect('/course/checkin/' + check.courseId);
                    } else {
                        //console.log(err);
                        return res.json({status : "error in save"});
                    }
                });
                //console.log("updated");
            } else {
                //console.log(err);
                return res.json({status : "error in save"});
            }
        });  
    });

    app.get('/api/checkin', function (req, res){
        return CheckInModel.find(function (err, checkIns) {
        if (!err) {
            return res.send(checkIns);
        } else {
            return res.json({status : "error in find"});
        }
        });
    });

    app.post('/course/delete/:id', isLoggedIn, isProf, function (req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            try{
                return course.remove(function (err) {
                    if (err) {
                        return res.json({status : false});
                    } else {
                        //console.log(err);
                        return res.redirect('/dashboard');
                    }
                });
            }catch(err){
                return res.json({status : 'error caught in delete'});
            }
        });
    });
    

    // =====================================
    // LOGOUT ==============================
    // =====================================
    //Logout of web session
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    // =====================================
    //
    // API =================================
    //
    // =====================================

    // =====================================
    // /API/USERS ==========================
    // =====================================


    //IMPORTANT CHANGE
    // --Almost All /api/.. request will need to have an auth token supplied in the URL params to verify the request.
    //      any call below with isAuth middleware will need this!!! 
    //          -http://url.com/?auth=token     <-- Example

    var isAuth = function (req, res, next){
        //console.log(req.query.auth);
        AuthModel.findOne({ 'code' : req.query.auth } , function (err, auth) {
              if (err) { return res.json({ user_auth_status : "error: error in findOne()"}) }
              if (!auth) {
                 return res.json({ user_auth_status : "false" });
              }
              else {
                var decoded = jwt.decode(req.query.auth, app.get('tokenSecret'));
                if(decoded.expire > moment().valueOf())
                    return next();
                return res.json({user_auth_status: 'false'});
              }
        }); 
    }


    //GET ALL USERES
    // --returns all users, needs admin role check
    app.get('/api/users', isAuth, function (req, res){
            return UserModel.find(function (err, users) {
            if (!err) {
                return res.send(users);
            } else {
                return res.json({status : "error in find"});
            }
            });
    });


    //GET USER BY ID
    // --accepts _id of user as url extension
    // --returns: user schema in json
    app.get('/api/users/:id', isAuth, function (req, res){
        return UserModel.findById(req.params.id, function (err, user) {
            if (!err) {
                return res.send(200, user);
            } else {
                return res.json({status : "error in findbyid"});;
            }
        });
    });

    //UPDATE USER BY ID
    // --accepts ID as url parameter
    // --returns updated user json data if successful, else returns the err.

    //can add for new fields in user ie) FNAME and LNAME
    // --accepts JSON format of data for email, password, and role;
    app.put('/api/users/:id', isAuth, function (req, res){
        return UserModel.findById(req.params.id, function (err, user) {
            if(req.body.email){
                user.local.email = req.body.email;
            }

            if(req.body.FName){
                user.FName = req.body.FName;
            }

            if(req.body.LName){
                user.LName = req.body.LName;
            }

            if(req.body.password){
                user.local.password = user.generateHash(req.body.password);
            }

            if(req.body.role){
                 user.role = req.body.role;
            }

            if(req.body.courseId){
                user.courses.push(req.body.courseId);
            }

            return user.save(function (err) {
                if (!err) {
                    //console.log("updated");
                    return res.send(user);
                } else {
                    //console.log(err);
                    return res.json({status : "error in save"});
                }
            });
        });
    });

    //DELETE A USER BY ID
    //  --accepts ID as url parameter
    //  --returns user as json data, else returns err
    app.delete('/api/users/:id', isAuth, function (req, res) {
        return UserModel.findById(req.params.id, function (err, user) {
            return user.remove(function (err) {
            if (!err) {
                //console.log("removed");
                return res.json({status : true});
            } else {
                return res.json({status : "error in remove"});
            }
            });
        });
    });

    // =====================================
    // /API/COURSES ========================
    // =====================================

    app.get('/api/courses/student', isAuth, function (req, res){
        var authDecode = jwt.decode(req.query.auth, app.get('tokenSecret'));

        console.log(authDecode.id);

        UserModel.findById( authDecode.id, function (err, user){
            if(err)
                return res.json({ status : 'Error in find courses by student id'});
            return res.send(user.courses);
        });
    }); 

    //GET ALL COURSES
    // --returns json of all coourses
    app.get('/api/courses', isAuth, function (req, res){
        return CourseModel.find(function (err, courses) {
        if (!err) {
            return res.send(courses);
        } else {
            return res.json({status : "error in find"});
        }
        });
    });

    //POST A NEW COURES
    //  --accepts: json format, see below for example
    //  --returns: course id and information

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
    app.post('/api/courses', isAuth, function (req, res) {
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
                return res.json({status:'error in save'});
        });

        return res.send(newCourse);
    });


    //GET COURSE BY PROFESSORS USER ID
    // --accepts user id
    // --returns json course
    app.get('/api/courses/professor', isAuth, function (req, res){
        CourseModel.find({'professor': req.body.profId}, function(err, course){
            if(err) 
                return res.json({ status : false });
            return res.send(course);
        });
    });
   
    //GET A COURSE BY ID
    app.get('/api/courses/:id', isAuth, function (req, res){
        return CourseModel.findById(req.params.id, function (err, course) {
            if (!err) {
                return res.send(course);
            } else {
                return res.json({status : "error in findbyid"});;
            }
        });
    });

    //UPDATE A COURSE
    app.put('/api/courses/:id', isAuth, function (req, res){
        return CourseModel.findById(req.params.id, function (err, course) {
            if(req.body.name){
                course.local.name = req.body.name;
            }

            if(req.body.section){
                course.section = req.body.section;
            }

            if(req.body.num){
                course.num = req.body.num;
            }

            if(req.body.professor){
                course.professor = req.body.professor;
            }

            if(req.body.day1){
                 course.classDays.day1 = req.body.day1;
            }

            if(req.body.day2){
                 course.classDays.day2 = req.body.day2;
            }

            if(req.body.day3){
                 course.classDays.day3 = req.body.day3;
            }


            if(req.body.startTime){
                 course.startTime = req.body.startTime;
            }


            if(req.body.duration){
                 course.duration = req.body.duration;
            }

            if(req.body.announce){
                req.body.announce.create = moment().format('LLLL');;
                course.announce.push(req.body.announce);
            }

            return course.save(function (err) {
                if (!err) {
                    //console.log("updated");
                    return res.send(course);
                } else {
                    //console.log(err);
                    return res.json({status : "error in save"});
                }
            });
        });
    });

    //STUDENT: Add a course
    //POST
    // accepts:
    /* 
        - auth token in param
    json body
    {
        "courseId" : " _id "
    }
    */
    app.post('/api/user/addcourse', isAuth, function (req, res){
        var decoded = jwt.decode(req.query.auth, app.get('tokenSecret'));

        UserModel.findById(decoded.id, function (err, user){
            if(err)
                return res.json({status : 'error 1'});

            for(var i=0; i < user.courses.length; i++){
                if(user.courses[i].courseId === req.body.courseId )
                    return res.json({ status : 'dupe'});
            }

            user.courses.push({ courseId : req.body.courseId });
            user.save(function (err){
                if(err)
                    return res.json({status : 'error 2'});
                CourseModel.findById(req.body.courseId, function (err, course){
                    if(err)
                        return res.json({status : 'error 3'});

                    for(var i=0; i < course.students.length; i++){
                        if(course.students[i].studentId === decoded.id)
                            return res.json({ status : 'dupe'});
                    }

                    course.students.push({ studentId : decoded.id, email : decoded.email });
                    course.save(function (err){
                        if(err)
                            return res.json({status : 'error 4'});
                        return res.json({ courses : user.courses });
                    });
                });
            });
        });
    });

    //DELETE A COURSE BY ID
    //  --accepts id as url parameter
    //  --returns success or err
    app.delete('/api/courses/:id', isAuth, function (req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            try{
                return course.remove(function (err) {
                    if (!err) {
                        return res.json({status : true})
                    } else {
                        //console.log(err);
                        return res.json({status : 'error in remove'});
                    }
                });
            }catch(err){
                return res.json({status : 'error caught in delete'});
            }
        });
    });

    //GET ALL ANNOUNCEMENTS BY A COURSE ID
    app.get('/api/courses/announce/:id', isAuth, function (req, res){
        return CourseModel.findById(req.params.id, function (err, course) {
            if (!err) {
                return res.send(course.announce);
            } else {
                return res.json({status : "error in findbyid"});
            }
        });
    });

    //Delete an announcement by id
    //send id of course in params and id of announcement in json under title "announce" : "_id"
    app.delete('/api/courses/announce/:id', isAuth, function (req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            if (!err) {
                course.announce.pull({ _id : req.body.announce });
                return course.save(function (err) {
                    if (!err) {
                        //console.log("updated");
                        return res.send(course);
                    } else {
                        //console.log(err);
                        return res.json({status : "error in save"});
                    }
                });
            } else {
                return res.json({status : "error in findbyid"});
            }
        });
    });

    //GET ALL Assignments BY A COURSE ID    
    app.get('/api/courses/assign/:id', isAuth, function (req, res){
        return CourseModel.findById(req.params.id, function (err, course) {
            if (!err) {
                return res.send(course.assign);
            } else {
                return res.json({status : "error in findbyid"});
            }
        });
    });

    //Delete an assignment by id
    //send id of course in params and id of announcement in json under title "assign" : "_id"
    app.delete('/api/courses/assign/:id', isAuth, function (req, res) {
        return CourseModel.findById(req.params.id, function (err, course) {
            if (!err) {
                course.assign.pull({ _id : req.body.assign });
                return course.save(function (err) {
                    if (!err) {
                        //console.log("updated");
                        return res.send(course);
                    } else {
                        //console.log(err);
                        return res.json({status : "error in save"});
                    }
                });
            } else {
                return res.json({status : "error in findbyid"});
            }
        });
    });

    //Checks that a qr code token is valid for student check-in and saves it to the checkin doc
    app.post('/api/courses/checkin', isAuth, function (req, res){
        //console.log(req.body.user_checkin_token);
        var decoded = jwt.decode(req.body.user_checkin_token, app.get('tokenSecret'));
        var authDecode = jwt.decode(req.query.auth, app.get('tokenSecret'));

        var expire = moment(decoded.expire);
        //console.log(moment().valueOf() + " is now and expire is: " + expire);
        if(moment().valueOf() < expire.valueOf() ) {
           CheckInModel.findById(decoded.id , function(err, checkIn){
                if(err) 
                    return res.json({ status : false });
                for(var i=0; i < checkIn.students.length; i++){
                    if(checkIn.students[i].studentId === decoded.id){
                        return res.json({ status : 'dupe'});
                    }
                }

                var check = { 'studentId' : decoded.id, 'email' : authDecode.email };
                checkIn.students.push(check);
                checkIn.save(function(err){
                    if(!err)
                        return res.json({ status : true });
                });
            });
        } else {
            res.json({ 'status' : false });
        }
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
        /*
        var token = jwt.encode({ email: user.local.email, id: user.id, expire: expire }, app.get('tokenSecret'));

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
        */

        res.json({ status : req.flash('signupMessage') });

      })(req, res, next);
    });

    //API CALL TO LOGIN A USER
    // --accepts: JSON -> {"email":"user_email","password":"user_password(plain text)}
    // --returns  auth token and 'id' in JSON if good

    app.post('/api/login', function(req, res, next) {
      passport.authenticate('local-login', {session: false }, function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            //failed login return
            return res.json(401, { user_auth_status: req.flash('loginMessage') });
        }

        var expire = moment().add(7 ,'days').valueOf();

        //user has authenticated correctly thus we create a JWT token 
        //can set expiration in .encode if we need
        var token = jwt.encode({ email: user.local.email, id: user.id, expire: expire }, app.get('tokenSecret'));

        //return variable
        var auth = new AuthModel();

        //console.log(req);
        auth.user_id =  user.id;
        auth.code    =  token;

        // save the user
        auth.save(function(err) {
            if (err)
                return res.json({status: "mongo save error"});
        });


        //Success login return
        res.json(
                    {
                        user_auth_status: "true",
                        user_auth_token: token, 
                        user_id: user.id
                    }
                );

      })(req, res, next);
    });


    //  CHECK IF USER IS LOGGED IN
    //  {
    //      user_auth_token: "authtoken"    
    //  } 
    //
    //  --accepts json of auth token
    //  --returns true if active or false if not
    app.post('/api/logged', function(req, res){
        //console.log(JSON.stringify(req.body));
        AuthModel.findOne({ 'code' : req.body.user_auth_token } , function (err, auth) {
              if (err) { return res.json({ user_auth_status : "error: error in findOne()"}) }
              if (!auth) {
                 return res.json({ user_auth_status : "false" });
              }
              else {
                var decoded = jwt.decode(req.body.user_auth_token, app.get('tokenSecret'));
                if(decoded.expire > moment().valueOf())
                    return res.json({user_auth_status: 'true'});
                return res.json({user_auth_status: 'false'});
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

// route middleware to make sure a user is logged in
function checkSession(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated() && req.user.validated === 'true')
        res.redirect('/dashboard');

    // if they aren't redirect them to the home page
    return next();
}

function isProf(req, res, next) {
    if(req.user.role)
        if(req.user.role === "professor")
            return next();
   // res.redirect('/login');
   res.render('login.ejs', { message: 'Only professors may use the Web App' }); 
}


/*
Code dump
//CREATE A NEW USER
    //commented this out but leaving for reference. USE /API/SIGNUP
    
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