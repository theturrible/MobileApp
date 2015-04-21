var leftMenuView = Ti.UI.createView({
	backgroundColor:'white',
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
});

var centerView = Ti.UI.createView({
	backgroundColor:'white',
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
});

var rightMenuView = Ti.UI.createView({
	backgroundColor:'#ddd',
	width: Ti.UI.FILL,
	height: Ti.UI.FILL
});


	// create a menu
	var leftTableView = Ti.UI.createTableView({
		font:{fontSize:12},
		rowHeight:40,
		data:[
			{title:'Toggle Left View'},
			{title:'Change Center Windowr'}, 
			{title:'Default Window'} 
		]
	});
	leftMenuView.add(leftTableView);
	leftTableView.addEventListener("click", function(e){
		Ti.API.info("isAnyWindowOpen: " + drawer.isAnyWindowOpen());
		switch(e.index){
			case 0:
				drawer.toggleLeftWindow(); //animate back to center
				alert("You clicked " + e.rowData.title + ". Implement menu structure.. ");
				break;
			case 1:
				drawer.setCenterWindow(Ti.UI.createView({backgroundColor:"red"}));
				drawer.toggleLeftWindow(); //animate back to center
				break;
			case 2:
				drawer.setCenterWindow(centerView);
				drawer.toggleLeftWindow(); //animate back to center
				break;
		}
	});

// Action Bar - FAKE example
var actionBar = Ti.UI.createView({
	top:0,
	height:"44dp",
	backgroundColor:"#333"
});
var leftToolbarBtn = Ti.UI.createButton({
	title:"Left",
	left: "6dp",
	backgroundColor:"transparent",
	color: "#FFF"
});
leftToolbarBtn.addEventListener("click", function(){
	drawer.toggleLeftWindow();
});
var rightToolbarBtn = Ti.UI.createButton({
	title:"Right",
	right: "6dp",
	backgroundColor:"transparent",
	color: "#FFF"
});
rightToolbarBtn.addEventListener("click", function(){
	drawer.toggleRightWindow();
});
var centerLabel = Ti.UI.createLabel({
	text:"NappDrawer",
	font:{
		fontSize:"14dp",
		fontWeight:"bold"
	},
	color: "#FFF"
});
actionBar.add(leftToolbarBtn);
actionBar.add(rightToolbarBtn);
actionBar.add(centerLabel);
centerView.add(actionBar);



// create interface
var scrollView = Ti.UI.createScrollView({
	layout:"vertical",
	left:0,right:0,top:"44dp",
    contentHeight:'auto',
    contentWidth:"100%",
    showVerticalScrollIndicator: true,
    showHorizontalScrollIndicator: false
});

/*********************
 * 
 * Scroll view
 * 
 */

function createNewRightDrawer() {
	var win = Ti.UI.createView({
		
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
			
			var window = Titanium.UI.createView({  
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
			
			drawer.centerWindow = win;
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







centerView.add(scrollView);


// CREATE THE MODULE
var NappDrawerModule = require('dk.napp.drawer');
var drawer = NappDrawerModule.createDrawer({
	fullscreen:false, 
	leftWindow: leftMenuView,
	centerWindow: centerView,
	rightWindow: rightMenuView,
	fading: 0.2, // 0-1
	parallaxAmount: 0.2, //0-1
	shadowWidth:"40dp", 
	leftDrawerWidth: "200dp",
	rightDrawerWidth: "200dp",
	animationMode: NappDrawerModule.ANIMATION_NONE,
	closeDrawerGestureMode: NappDrawerModule.CLOSE_MODE_MARGIN,
	openDrawerGestureMode: NappDrawerModule.OPEN_MODE_ALL,
	orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
});


drawer.addEventListener("didChangeOffset", function(e){
	//Ti.API.info("didChangeOffset: " + e.offset);
});

drawer.addEventListener("windowDidOpen", function(e){
	if(e.window == NappDrawerModule.LEFT_WINDOW) {
		Ti.API.info("windowDidOpen - LEFT DRAWER");
	} else if (e.window == NappDrawerModule.RIGHT_WINDOW) {
		Ti.API.info("windowDidOpen - RIGHT DRAWER");
	}
});
drawer.addEventListener("windowDidClose", function(e){
	Ti.API.info("windowDidClose");
});


// Action Bar - REAL example
drawer.addEventListener('open', onNavDrawerWinOpen);
function onNavDrawerWinOpen(evt) {
    this.removeEventListener('open', onNavDrawerWinOpen);

    if(this.getActivity()) {
        // need to explicitly use getXYZ methods
        var actionBar = this.getActivity().getActionBar();

        if (actionBar) {
            // Now we can do stuff to the actionbar  
            actionBar.setTitle('NappDrawer Example');
            
            // show an angle bracket next to the home icon,
            // indicating to users that the home icon is tappable
            actionBar.setDisplayHomeAsUp(true);

            // toggle the left window when the home icon is selected
            actionBar.setOnHomeIconItemSelected(function() {
                drawer.toggleLeftWindow();
           });
        }
    }    
}


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
	drawer.open();
	
});

var courseData = createCourses();
