var NappDrawerModule = require('dk.napp.drawer');

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
				
				//this needs to close all other windows because they stay opne on actual phone.
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
	var backButton = Ti.UI.createButton({
		title : "<--"
	});
	var wndNewWindow = Ti.UI.createWindow({
		leftNavButton : backButton,
		title : "Calendar"
	});

	backButton.addEventListener("click", function() {
		drawer.centerWindow = prev;
	});

	var navController2 = Ti.UI.iOS.createNavigationWindow({
		window : wndNewWindow
	});

	return navController2;
}




function createCourseDetails(courseData, prev) {

	var backButton = Ti.UI.createButton({
		title : "<--"
	});
	var wndNewWindow = Ti.UI.createWindow({
		leftNavButton : backButton,
		title : courseData.section + " " + courseData.num + " " + courseData.name
	});

	backButton.addEventListener("click", function() {
		drawer.centerWindow = prev;
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
		data : [section1, section2]
	});

	wndNewWindow.add(table);
	var navController1 = Ti.UI.iOS.createNavigationWindow({
		window : wndNewWindow
	});

	return navController1;

}

function createDashboard() {

	var rightBtn = Ti.UI.createButton({
		title : "Right"
	});
	rightBtn.addEventListener("click", function() {
		drawer.toggleRightWindow();
	});

	var win = Ti.UI.createWindow({
		Title : "Dashboard",
		rightNavButton : rightBtn
	});

	var table = Ti.UI.createTableView();
	var tableData = [];
	var httpClient = Ti.Network.createHTTPClient({
		timeout : 10000
	});

	httpClient.onload = function() {
		//actual code
		var classes = JSON.parse(httpClient.responseText);
		Titanium.API.log(httpClient.responseText);
		for (var i = 0; i < classes.length; i++) {
			var obj = classes[i];
			Titanium.API.log(JSON.stringify(obj));

			var row = Titanium.UI.createTableViewRow({
				hasChild : true,
				className : obj._id,
				backgroundColor : '#fff',
				data : obj,
				title : obj.section + " " + obj.num + " " + obj.name
			});

			//add the table row to our tableData[] object
			tableData.push(row);
		}

		table.setData(tableData);

		table.addEventListener('click', function(e) {
			var courseContent = createCourseDetails(e.rowData.data, drawer.centerWindow);
			drawer.centerWindow = courseContent;
		});
		win.add(table);
	};

	httpClient.onerror = function() {
		alert("Unfortunately, we have encountered an error getting out server to play nice.");
		$.index.open();
	};

	httpClient.open('GET', 'http://ifdef.me:8080/api/courses?auth=' + Titanium.App.Properties.getString("user_auth_token"));
	Titanium.API.log(Titanium.App.Properties.getString("user_auth_token"));
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send();

	var navController = Ti.UI.iOS.createNavigationWindow({
		window : win
	});

	return navController;
}

var mainWindow = createDashboard();

var drawer = NappDrawerModule.createDrawer({
	centerWindow : mainWindow,
	rightWindow : createMenu(),
	closeDrawerGestureMode : NappDrawerModule.CLOSE_MODE_ALL,
	openDrawerGestureMode : NappDrawerModule.OPEN_MODE_ALL,
	showShadow : false, //no shadow in iOS7
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

drawer.open();
