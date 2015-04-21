var randomLister = "";


var NappDrawerModule = require('dk.napp.drawer');
var moment = require('moment');
var scanditsdk = require("com.mirasense.scanditsdk");

var drawer;

var drawer = NappDrawerModule.createDrawer({
	centerWindow: createCalendarView(),
	rightWindow: createMenu(),
	closeDrawerGestureMode : NappDrawerModule.CLOSE_MODE_PANNING_NAVBAR,
	openDrawerGestureMode : NappDrawerModule.OPEN_MODE_PANNING_NAVBAR,
	showShadow : true, //no shadow in iOS7
	rightDrawerWidth : 150,
	statusBarStyle : NappDrawerModule.STATUSBAR_WHITE, // remember to set UIViewControllerBasedStatusBarAppearance to false in tiapp.xml
	orientationModes : [Ti.UI.PORTRAIT]
});

drawer.setAnimationMode(NappDrawerModule.ANIMATION_PARALLAX_FACTOR_7);

drawer.addEventListener('windowDidOpen', function(e) {
	Ti.API.info("windowDidOpen");
});

drawer.addEventListener('windowDidClose', function(e) {
	Ti.API.info("windowDidClose");
});

//gets the data
var courseData = createCourses();


//new design

function createNewRightDrawer() {
	var win = Ti.UI.createWindow({
		backgroundColor: "#bbbbb"
	});

	var data = [];

	
	var data1 =	[
			{title : 'Check In'},
			{title:  'Email'},
			{title : 'Log Out'}
		];

	//populate the drawer wiht the new course names
	
	for(var i = 0; i < Alloy.Globals.courseData.length; i++){
		var currentCourse = Alloy.Globals.courseData[i];
		var courseView = createCourseDetails(currentCourse);
		data.push({title: currentCourse.section + " " + currentCourse.num, courseID: currentCourse._id, courseView : courseView});
		Titanium.API.log("Added Course: " + JSON.stringify(courseView));	
	}
	//static
	//var checkin = createCheckinWindow();
	//data.push({title: 'Check In', courseID: 'NAN', courseView: checkin});
	Alloy.Globals.courseViews = data;
	
	var tableView = Ti.UI.createTableView({
		data : data,
		style : Ti.UI.iPhone.TableViewStyle.PLAIN,
		separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
		separatorColor : 'transparent',
		top : 20, 
		height: 400
		
	});
	var tableView2 = Ti.UI.createTableView({
		data : data1,
		style : Ti.UI.iPhone.TableViewStyle.PLAIN,
		separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
		separatorColor : 'transparent',
		top : 420
		
	});
	tableView2.addEventListener("click", function(e) {
		
		if(e.rowData.title == 'Log Out'){
			Titanium.API.log("logout ");
			logout();
		}else if(e.rowData.title == 'Email'){			
			var email = Ti.UI.createEmailDialog({
				toRecipient: "grin.van@gmail.com", 
				messageBody: "asdf"
				});
			email.open();
		
		}else{
			Titanium.API.log("checkin");
			// Create a window.
			Alloy.Globals.centerView = drawer.centerWindow;
			var leftButton = Ti.UI.createButton({
				title : "Back"
			});
			leftButton.addEventListener("click", function() {
				drawer.centerWindow = Alloy.Globals.centerView;
			});
			var rightBtn = Ti.UI.createButton({
				title : "+"
			});
			rightBtn.addEventListener("click", function() {
				drawer.toggleRightWindow();
			});
			
			var window = Titanium.UI.createWindow({  
			        leftNavButton: leftButton,
			        rightNavButton: rightBtn,
			        title:'Check in',
			        navBarHidden:false
			});
			// Instantiate the Scandit SDK Barcode Picker view.
			picker = scanditsdk.createView({
			    width:"100%",
			    height:"100%"
			});
			// Initialize the barcode picker.
			picker.init("fFvmD4wd41NCJBmJPZFvSHAc35gnIeQJ1lwRx9cw6Pk", 0);
			 picker.setSuccessCallback(function(e) {
			 	
			 	var httpClient = Ti.Network.createHTTPClient({timeout: 10000});
		
				httpClient.onload = function(){
					var answer = JSON.parse(httpClient.responseText);
					if(answer.status == true){
						alert("Successful check in!");
						drawer.centerWindow = Alloy.Globals.centerView;
					}else{
						alert("Failed checkin :(");
					}
					
								
				};
				httpClient.onerror = function(){
				
				};
				httpClient.open('POST', 'http://ifdef.me:8080/api/courses/checkin?auth=' + Titanium.App.Properties.getString("user_auth_token"));
				httpClient.setRequestHeader('Content-Type', 'application/json');
				
				var data = {
					user_checkin_token: e.barcode	
				};
				httpClient.send(JSON.stringify(data));
		    });
			// Add it to the window and open it.
			window.add(picker);
			
			window.addEventListener('open', function(e) {
		        // Adjust to the current orientation.
		        // since window.orientation returns 'undefined' on ios devices 
		        // we are using Ti.UI.orientation (which is deprecated and no longer 
		        // working on Android devices.)
		        if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
		            picker.setOrientation(Ti.UI.orientation);
		        }   
		        else {
		            picker.setOrientation(window.orientation);
		        }
		        
		        picker.setSize(Ti.Platform.displayCaps.platformWidth, 
		                       Ti.Platform.displayCaps.platformHeight);
		        picker.startScanning();     // startScanning() has to be called after the window is opened. 
		    });
			
			
			var navController1;
			
			navController1 = Ti.UI.iOS.createNavigationWindow({
				window : window
			});
			drawer.centerWindow = navController1;
			drawer.toggleRightWindow();
			}
	});

	tableView.addEventListener("click", function(e) {
		
		Titanium.API.log("getting course by id: " + e.rowData.courseID);
		if(e.rowData.title == 'log out'){
			logout();
		}else{
			loadCourseByID(e.rowData.courseID);
		}
	});

	win.add(tableView);
	win.add(tableView2);
	return win;
}

function loadCourseByID(id){
	var clickedCourse;
	Titanium.API.log("Course data from load course by ID: " + JSON.stringify(Alloy.Globals.courseData));
	for(var i = 0; i < Alloy.Globals.courseData.length; i++){
		if(Alloy.Globals.courseData[i]._id == id){
			clickedCourse = Alloy.Globals.courseData[i];
			
		}
	}
	
	Titanium.API.log("getting course by id" + JSON.stringify(clickedCourse));
	var courseNav = createCourseDetails(clickedCourse, drawer.centerWindow);
	drawer.centerWindow = courseNav;
	drawer.toggleRightWindow();
	
};

function createCourseDetails(courseData) {
	
	var rightBtn = Ti.UI.createButton({
		title : "+"
	});
	rightBtn.addEventListener("click", function() {
		drawer.toggleRightWindow();
	});
	var refreshButton1 = Ti.UI.createButton({
		title : "ref"
	});
	var refreshButton= Titanium.UI.createImageView({
	   image: "Shared/refresh.png",
	   height:20, 
	   width:20
	}); 
	refreshButton.add(image);
	
	refreshButton.addEventListener("click", function() {
			courseData = createCourses();
			drawer.close();
	});
	
	var wndNewWindow = Ti.UI.createWindow({
		leftNavButton  : refreshButton,
		rightNavButton : rightBtn,
		title : courseData.name,
		cID : courseData._id,
		backgroundColor : '#b3b3b3'
	});
	
	var newView = Ti.UI.createView();

	var emailButton = Ti.UI.createLabel({
		text: "Group Email",
		top: 120,
		left: Ti.App.SCREEN_WIDTH/2,
		height: 20
	});
	
	var image= Titanium.UI.createImageView({
	   image: "Shared/main.png",
	   height:30, 
	   width:30, 
	   left : 10,
	   top:115 
	}); 
 	
 	image.addEventListener('click', function(){
		Alloy.Globals.beforeLogin = drawer.centerWindow;
		var rightBtn =  Titanium.UI.createImageView({
		   image: "Shared/check.png",
		   height:20, 
		   width:20,
		   left : Ti.App.SCREEN_WIDTH - 60,
		});
	
		var refreshButton =  Titanium.UI.createImageView({
		   image: "Shared/x.png",
		   height:20, 
		   width:20,
		});
		
		rightBtn.addEventListener("click", function() {
			//send email
			var selected =  Alloy.Globals.selectedEmailData;
			var options = 	Alloy.Globals.selectedEmailOptions;
			Ti.API.log("Selected Emails " + JSON.stringify(Alloy.Globals.selectedEmailData));
			var emails = [];
			for(var r = 0; r < selected.length; r++ ){
				if(options.indexOf(r) !== -1){
					emails.push(selected[r].title);
				}
			}
			
			Ti.API.log("sending to " + emails);
			
			var emailDrawer = Ti.UI.createEmailDialog();
			emailDrawer.toRecipients = emails;
			emailDrawer.open();
		});

		refreshButton.addEventListener("click", function() {
			drawer.centerWindow = Alloy.Globals.beforeLogin;
			Alloy.Globals.selectedEmailData = [];
			Alloy.Globals.selectedEmailOptions =[0];
		});
		
		var emailList = Ti.UI.createWindow({
			modal: true,
			leftNavButton  : refreshButton,
			rightNavButton : rightBtn,
			title : courseData.name,
			cID : courseData._id,
			backgroundColor : '#b3b3b3',
			
		});
		var studentEmailData;
		var selectedOptions;
		if(!Alloy.Globals.selectedEmailData){
			Alloy.Globals.selectedEmailData = [];
			Alloy.Globals.selectedEmailOptions = [0];
		}
		
		studentEmailData = Alloy.Globals.selectedEmailData;
		selectedOptions = Alloy.Globals.selectedEmailOptions;	
		
		
		var cd = courseData.students;
		Ti.API.log("Course Data on email call: " +  JSON.stringify(cd));
		for(var i = 0; i < cd.length; i++){
			if(cd[i].email){
				var row = Ti.UI.createTableViewRow({hasCheck: selectedOptions.indexOf(i) !== -1, title: cd[i].email });
				row.hasCheck = true;
	  			studentEmailData.push(row);
  			}
		}
		
		Alloy.Globals.selectedEmailData = studentEmailData;
		var tblEmail = Ti.UI.createTableView();
		
		tblEmail.addEventListener('click', function(e) {
		  var state = e.rowData.hasCheck;
		  // reuse existing row (using its configuration, not its instance)
		  var row = Ti.UI.createTableViewRow({hasCheck: !state, title: e.rowData.title });
		  tblEmail.updateRow(e.index, row, {animated: true});
		  
		  if (state) {
		    selectedOptions.push(e.index);
		  } else {
		    selectedOptions.splice(selectedOptions.indexOf(e.index),1);
		   }
		   Ti.API.log("Course Data event: " +  JSON.stringify(tblEmail.data));
		   Alloy.Globals.selectedEmailOptions = selectedOptions;
		});
		
		var emailView = Ti.UI.createView({
			height: Ti.App.SCREEN_HEIGHT - 70, 
		});
		
		tblEmail.setData(studentEmailData);
		emailView.add(tblEmail);
		emailList.add(emailView);
		
		var navController1 = Ti.UI.iOS.createNavigationWindow({
			window: emailList
		});
		drawer.centerWindow = navController1;

 	});
	
	newView.add(image);
	wndNewWindow.add(newView);
	
	
	
	
	
	
	var courseNumbers = Ti.UI.createLabel({
		left : 50,
		top  : 40,
		text : courseData.section + " " + courseData.num 
	});
	
	if (courseData.announce.length > 0) {
		var courseAnnouncements = courseData.announce;

		var section1 = Ti.UI.createTableViewSection({
			headerTitle : 'Announcements'
		});
		
		for (var i = 0; i < courseAnnouncements.length; i++) {
			var announcement = courseAnnouncements[i];
			section1.add(Ti.UI.createTableViewRow({
				title : announcement.body
			}));
		}
	}
	wndNewWindow.addEventListener('swipe', function(e) {
		var data =  Alloy.Globals.courseViews;
		var left;
		var right;
		var leftAllowed = false;
		var rightAllowed = false;
		for(var i = 0; i < data.length; i++){
			if(wndNewWindow.cID == data[i].courseID){
				//this gets our position in our stack.
				Titanium.API.log("Our position: " + i);
				//time to set the next or previous view.
				if((i-1) >= 0){
					left = data[i-1].courseView;
					leftAllowed = true;
				}
				if((i+1) < data.length ){
					right = data[i+1].courseView;
					rightAllowed = true;
				}
				
			}
		}
		
	   if (e.direction == 'left') {
		  	if(leftAllowed){
		  		drawer.centerWindow = left;
		  	}
	   } else if (e.direction == 'right') {
			if(rightAllowed){
		   			drawer.centerWindow = right; 
		   	} 
	   }
	});
			//get all assignemnts
	if (courseData.assign.length > 0) {
		var courseAssignments = courseData.assign;

		var section2 = Ti.UI.createTableViewSection({
			headerTitle : 'Assignments'
		});
		for (var i = 0; i < courseAssignments.length; i++) {
			var assignment = courseAssignments[i];
			section2.add(Ti.UI.createTableViewRow({
				title : assignment.name
			}));
		}
	}

	var table = Ti.UI.createTableView({
		data : [section1, section2],
		top : 150
	});
	var navController1;
	wndNewWindow.add(table);
	navController1 = Ti.UI.iOS.createNavigationWindow({
		window : wndNewWindow
	});

	return navController1;
}


function logout(){
	var httpClient = Ti.Network.createHTTPClient({
		timeout : 10000
	});
	httpClient.onload = function() {
		alert("logout success!");
		var index = Alloy.createController('index').getView();
		Titanium.App.Properties.setString("user_auth_token", "");
		
		//this needs to close all other windows because they stay opne on actual phone.`
		drawer.close();
		index.open();
	};
	httpClient.onerror = function() {
		alert("Unfortunately, we have encountered an error getting out server to play nice.");
		
	};

	httpClient.open('post', 'http://ifdef.me:8080/api/logout');
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send(JSON.stringify({
		auth : Titanium.App.Properties.getString("user_auth_token")
	}));
};



function createMenu() {
	var win = Ti.UI.createWindow({
		backgroundImage : 'shared/bkg_main.jpg'
	});

	var data = [{
		title : "Calendar"
	}, {
		title : "Tasks"
	}, {
		title : "Grades"
	}, {
		title : "Courses"
	}, {
		title : "Check in"
	}, {
		title : "Settings"
	}, {
		title : "Log out"
	}];

	var tableView = Ti.UI.createTableView({
		data : data,
		style : Ti.UI.iPhone.TableViewStyle.PLAIN,
		separatorStyle : Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
		separatorColor : 'transparent',
		top : 20
	});

	tableView.addEventListener("click", function(e) {
		switch(e.index) {
		case 0:												//calendar

			var courseContent = createCalendarView(drawer.centerWindow);
			drawer.centerWindow = courseContent;
			
			break;
		case 1:												//tasks

			break;
		case 2:												//grades

			break;
		case 3:												//courses window

			break;
		case 4:												//checkin window
			Alloy.createController('checkin').getView();		
			break;
		case 5:												//settings
			break;
		case 6:													//logout
			//logout
			var httpClient = Ti.Network.createHTTPClient({
				timeout : 10000
			});
			httpClient.onload = function() {
				alert("logout success!");
				var index = Alloy.createController('index').getView();
				Titanium.App.Properties.setString("user_auth_token", "");
				
				//this needs to close all other windows because they stay opne on actual phone.`
				drawer.close();
				index.open();
			};
			httpClient.onerror = function() {
				alert("Unfortunately, we have encountered an error getting out server to play nice.");
				
			};

			httpClient.open('post', 'http://ifdef.me:8080/api/logout');
			httpClient.setRequestHeader('Content-Type', 'application/json');
			httpClient.send(JSON.stringify({
				auth : Titanium.App.Properties.getString("user_auth_token")
			}));
			break;

		}
	});

	win.add(tableView);
	return win;
}

function createCalendarView(prev){
	var rightBtn = Ti.UI.createButton({
		title: 'Menu'
	});
	rightBtn.addEventListener("click", function() {
		drawer.toggleRightWindow();
	});
	
	var wndNewWindow = Ti.UI.createWindow({
		rightNavButton : rightBtn,
		title : "Temp View"
	});

	var navController2 = Ti.UI.iOS.createNavigationWindow({
		window : wndNewWindow
	});

	return navController2;
}

function createDashboard(){
	if (Titanium.Platform.name == 'ios') {
	var rightBtn = Ti.UI.createButton({
		title : "+"
	});
	rightBtn.addEventListener("click", function() {
		drawer.toggleRightWindow();
	});

	//create dashboard
	
	
	
		
		
	
	
	var win = Ti.UI.createWindow({
		Title : "Dashboard",
		rightNavButton : rightBtn
		
	});
	
	var relevantCourseData = Alloy.Globals.courseData;


	//now
	var sectionNow = Ti.UI.createTableViewSection();
	//create the view
	var headerViewNow = Ti.UI.createView({backgroundColor: '#b3b3b3'});
	var headerLabel = Ti.UI.createLabel({
	  text: 'Now',
	  left: 10
	});
	headerViewNow.add(headerLabel);
	sectionNow.setHeaderView(headerViewNow);
	
	//today
	var sectionToday = Ti.UI.createTableViewSection();
	//create the header view
	var headerViewToday = Ti.UI.createView({backgroundColor: '#b3b3b3'});
	var headerLabelToday = Ti.UI.createLabel({
	  text: 'Today',
	  left: 10
	});
	headerViewToday.add(headerLabelToday);
	sectionToday.setHeaderView(headerViewToday);
			
	//tomorrow		
	var sectionTomorrow = Ti.UI.createTableViewSection();
	//create the header view
	var headerViewTomorrow = Ti.UI.createView({backgroundColor: '#b3b3b3'});
	var headerLabelTomorrow = Ti.UI.createLabel({
	  text: 'Tomorrow',
	  left: 10
	});
	sectionTomorrow.setHeaderView(headerViewTomorrow);
		
		
	//tomorrow		
	var sectAnn = Ti.UI.createTableViewSection();
	//create the header view
	var sectHeaderAnnouncements = Ti.UI.createView({backgroundColor: '#b3b3b3'});
	var lblAnnouncements = Ti.UI.createLabel({
	  text: 'Announcements',
	  left: 10
	});
	sectHeaderAnnouncements.add(lblAnnouncements);
	sectAnn.setHeaderView(sectHeaderAnnouncements);	
	
	Titanium.API.log("courseDataLength " + Alloy.Globals.courseData.lenght);
	
	//gets all of the announcement, for right now, there is no real filtering,
	// ideally we just want to get the latest 5, or the ones from this week, or some other time. 
	// we can even make it so its linked from settings, and you can customize your time schedules.
	for(var i=0 ;i < Alloy.Globals.courseData.length;i++){
		var courseData = Alloy.Globals.courseData[i];
		
		var sectionName = courseData.sect +  " " + courseData.num;
		
		
		//get announcenemnts
		if (courseData.announce.length > 0) {
			Titanium.API.log("getting announcements form " + courseData.section +  " " + courseData.num);
			for (var j = 0; j < courseData.announce.length; j++) {
				var announcement = courseData.announce[j];
				sectAnn.add(Ti.UI.createTableViewRow({
					type  : 'ann',
					sect : sectionName,
					course: courseData.name,
					data  : announcement,
					title : announcement.body,
					hasChild: true
				}));
				
			}
		}		
		
		//ass now.
		if (courseData.assign.length > 0) {
			Titanium.API.log("getting assignments TODAY form " + courseData.section +  " " + courseData.num);
			for (var j = 0; j < courseData.assign.length; j++) {
				var assign = courseData.assign[j];
				//today view
					if(assign.dueDate == moment().format('MM/DD/YYYY')){
						sectionToday.add(Ti.UI.createTableViewRow({
						type  : 'assNow',
						sect : sectionName,
						course: courseData.name,
						data  : assign,
						title : assign.name,
						hasChild: true
					}));
				}
				//section tomorrow
					if(assign.dueDate == moment().add(1, 'days').format('MM/DD/YYYY')){
						sectionTomorrow.add(Ti.UI.createTableViewRow({
						type : 'assTomorrow',
						sect : sectionName,
						course: courseData.name,
						data  : assign,
						title : assign.name,
						hasChild: true
					}));
					
				}				
			}
		}
	}
	
		//gets just one course by id.
		var table = Ti.UI.createTableView({
			data : [sectAnn, sectionNow, sectionToday, sectionTomorrow]
		});
		
		
	//probably needs to be moved out from this place, but for now, this will just have to do. 	
	table.addEventListener('click', function(e) {
	    Titanium.API.log("getting announcements form " + JSON.stringify(e.rowData.data) + " Course Name: " + e.rowData.course); 
	    
	    var backButton = Ti.UI.createButton({
			title : "<--"
		});
		var section = e.rowData.sect;
		Titanium.API.log("Section: " + section);
		var annDetailsView = Ti.UI.createWindow({
			leftNavButton : backButton,
			title : "Announcement for " + e.rowData.sect,
			backgroundImage:'Shared/bkg_login.jpg' 
		});
		
		
		var timeStampLbl = Ti.UI.createLabel({
		  text: 'Added on: ' + moment(e.rowData.data.create).format("MM/DD/YY HH:MM:SS"),
		  top: Alloy.CFG.loginTop, 
		  left: Alloy.CFG.leftOffset
		});
		
		
		annDetailsView.add(timeStampLbl);
		var announcementContnt = Ti.UI.createLabel({
			text: e.rowData.data.body,
			top: Alloy.CFG.loginTop1,
			width: Alloy.CFG.loginWidth + 100,
			height: 200
			
		});
		
		var courseNameForAnnouncement = Ti.UI.createLabel({
			text: "By: " +  e.rowData.course,
			top: Alloy.CFG.loginTop + 250
		});
		
		annDetailsView.add(courseNameForAnnouncement);
		annDetailsView.add(announcementContnt);
		

	
		var navController2 = Ti.UI.iOS.createNavigationWindow({
			window : annDetailsView
		});
	
		Alloy.Globals.prev = drawer.centerWindow;
		drawer.centerWindow = navController2;

	});
	
	
	
	win.add(table);
	
	var navController = Ti.UI.iOS.createNavigationWindow({
			window : win
	});
	
	
	return navController;
	}
}


//loading all of the data for courses


function finishLoadingCourseData(){
	var relevantCourses = Alloy.Globals.relevantCourses;
	var allCourses = Alloy.Globals.courses;
	var relevantCourseData = [];
	
	for(var i = 0; i < relevantCourses.length; i++){
		var course = relevantCourses[i];
		
		Titanium.API.log("looking for course course " + JSON.stringify(course));
	
		for(var j = 0; j < Alloy.Globals.courses.length; j++){
			var currCourse = Alloy.Globals.courses[j];
			if(currCourse._id == course.courseId){
				Titanium.API.log("adding: " + currCourse._id + " courseID: " + course.courseId);
				relevantCourseData.push(currCourse);
			}
			
			

		}		
	}
	Alloy.Globals.courseData = relevantCourseData;
	drawer.fireEvent("allDone");
	
};

function createCourses() {
	var httpClient = Ti.Network.createHTTPClient({
		timeout : 10000
	});

	httpClient.onload = function() {
		Titanium.API.log("got courses.");
		//actual code
		var classes = JSON.parse(httpClient.responseText);
		Titanium.API.log("Firing loadComplete!");
		Alloy.Globals.courses = classes;
		drawer.fireEvent("loadComplete");		
	};
	httpClient.onerror = function() {
		alert("Unfortunately, we have encountered an error getting out server to play nice.");
		$.index.open();
	};

	httpClient.open('GET', 'http://ifdef.me:8080/api/courses?auth=' + Titanium.App.Properties.getString("user_auth_token"));
	Titanium.API.log(Titanium.App.Properties.getString("user_auth_token"));
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send();
	
	
}

function getRelevantCourses(){
		
	//now lets get all courseID's that the user has.
	
	var httpClient = Ti.Network.createHTTPClient({timeout: 1000});
	httpClient.onload = function() {		
		//course IDs
		var courseID  = JSON.parse(httpClient.responseText);
		Alloy.Globals.relevantCourses = courseID;
		drawer.fireEvent("relevantComplete");
		//by this point, we should have all the courses loaded.
		Titanium.API.log("relevant courses populated " + httpClient.responseText);
	};
	httpClient.onerror = function() {
		alert("Unfortunately, we have encountered an error getting out server to play nice.");
	};
	
	var url = 'http://ifdef.me:8080/api/courses/student?auth=' + Titanium.App.Properties.getString("user_auth_token");
	httpClient.open('GET', url);
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send();
}

drawer.addEventListener('loadComplete', function(e) {
	Titanium.API.log("Got Fire Complete");
	getRelevantCourses();
	
});

drawer.addEventListener('relevantComplete', function(e) {
	Titanium.API.log("Got Fire in relevant");
	Titanium.API.log("CourseData: " + JSON.stringify(Alloy.Globals.courses));
	finishLoadingCourseData();	
});
drawer.addEventListener('finalComplete', function(e) {
	drawer.centerWindow = mainWindow;	
	finishLoadingCourseData();
});
drawer.addEventListener	('allDone', function(e) {
	Titanium.API.log("allDone");	
	//lets finish all of the apps..
	drawer.rightWindow = createNewRightDrawer();
	drawer.centerWindow = Alloy.Globals.courseViews[0].courseView;
	drawer.open();
	
});