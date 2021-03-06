var args = arguments[0] || {};

var NappDrawerModule = require('dk.napp.drawer');


function createMenu(){
	var win = Ti.UI.createWindow(
		{
			backgroundImage:'shared/bkg_main.jpg'
		}
	);
	
	var data = [
		{title: "Calendar"},
		{title: "Tasks"},
		{title: "Grades"},
		{title: "Courses"},
		{title: "Check in"},
		{title: "Settings"}	
	];
	
	var tableView = Ti.UI.createTableView({
		data:data,
		style: Ti.UI.iPhone.TableViewStyle.PLAIN,
		separatorStyle: Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,
		separatorColor: 'transparent',
		top: 20
	});
	
	
	tableView.addEventListener("click", function(e){
		switch(e.index){
			case 0:
				
				break;
			case 1:
				
				break;
			case 2:
				
				break;
			case 3:
				
				break;
			case 4:
				
				break;
			case 5:

				break;
		}
	});
	
	win.add(tableView);
	return win;
}

function createDashboard(){	
	
	var rightBtn = Ti.UI.createButton({title:"Right"});
	rightBtn.addEventListener("click", function(){
		drawer.toggleRightWindow();
	});
	
	var win = Ti.UI.createWindow({
		Title: "Dashboard",
		rightNavButton: rightBtn
	});

	
	var table = Ti.UI.createTableView();
	var tableData = [];
	var httpClient = Ti.Network.createHTTPClient({
			timeout: 10000
	});
	
	httpClient.onload = function(){
	//actual code
		var classes = JSON.parse(httpClient.responseText); 
		Titanium.API.log(httpClient.responseText);
		for(var i=0;i<classes.length;i++){
		        var obj = classes[i];
		       	Titanium.API.log(JSON.stringify(obj));
		       	
		  	var row = Titanium.UI.createTableViewRow({
	            hasChild: true,
	            className: obj._id,
	            backgroundColor: '#fff',
	            data: obj, 
	            title: obj.section + " " + obj.num + " " + obj.name
	        });
	 
	
	        //add the table row to our tableData[] object
	        tableData.push(row);
		}
		
		table.setData(tableData);
		
		
		table.addEventListener('click', function(e){
			var backButton = Ti.UI.createButton({title:"<--"});
			backButton.addEventListener("click", function(){
				wndNewWindow.close();
			});
		    var wndNewWindow = Ti.UI.createWindow({
		        rightNavButton   : backButton
		        
		    });
			
			var courseData = e.rowData.data;
			
		
			
			win.close();
		    wndNewWindow.open();
		   	 
		   
		});
		
		
		
		
		
		win.add(table);
	};
	
	httpClient.onerror = function(){
		alert("Unfortunately, we have encountered an error getting out server to play nice.");
		$.index.open();
	};
	
	httpClient.open('GET', 'http://ifdef.me:8080/api/courses?auth=' + Titanium.App.Properties.getString("user_auth_token"));
	Titanium.API.log(Titanium.App.Properties.getString("user_auth_token"));
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send();
	
	
	var navController =  Ti.UI.iOS.createNavigationWindow({
		window : win
	});
	
	return navController;
}

var mainWindow = createDashboard();

var drawer = NappDrawerModule.createDrawer({
	centerWindow: mainWindow,
	rightWindow: createMenu(),
	closeDrawerGestureMode: NappDrawerModule.CLOSE_MODE_ALL,
	openDrawerGestureMode: NappDrawerModule.OPEN_MODE_ALL,
	showShadow: false, //no shadow in iOS7
	rightDrawerWidth: 150,
	statusBarStyle: NappDrawerModule.STATUSBAR_WHITE,  // remember to set UIViewControllerBasedStatusBarAppearance to false in tiapp.xml
	orientationModes: [Ti.UI.PORTRAIT]
});

drawer.setAnimationMode(NappDrawerModule.ANIMATION_PARALLAX_FACTOR_7);
drawer.addEventListener('windowDidOpen', function(e) {
	Ti.API.info("windowDidOpen");
});

drawer.addEventListener('windowDidClose', function(e) {
	Ti.API.info("windowDidClose");
});

drawer.open();
