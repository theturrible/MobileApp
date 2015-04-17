//check if we already have a token saved, if not - open login screen.
var id = Titanium.App.Properties.getString("user_auth_token", 
	function(){	
		Titanium.API.log("Not able to get user_auth_token");
		$.index.open();		
	}
);

var httpClient = Ti.Network.createHTTPClient({timeout: 1000});

httpClient.onload = function(){
	var res = JSON.parse(httpClient.responseText); 
	Titanium.API.log("Currecnt login status: " + res.user_auth_token);
	if(res.user_auth_status == "true"){
		Alloy.createController('checkin').getView();
	}else{
		if(Titanium.App.Properties.getString("user_auth_token") == null){
			$.index.open();
		}else{
			$.index.open();
			alert("You have been logged out, please login again.");
		}	
	}
};

httpClient.onerror = function(){
	Titanium.API.log("Error onLoad auth check.");
	$.index.open();
};

httpClient.open('POST', 'http://ifdef.me:8080/api/logged');
httpClient.setRequestHeader('Content-Type', 'application/json');
var token = Titanium.App.Properties.getString("user_auth_token");
httpClient.send(JSON.stringify({"user_auth_token": token}));



$.btnSignup.addEventListener('click', function(e){ 
//controller name is 'sample
  	$.index.close();
 	var signup = Alloy.createController('signup').getView();
   });

$.btnLogin.addEventListener('click',function(e)
{
   Titanium.API.info("Login Button Clicked");
   if($.txtLogin.value == "" || $.txtPass.value == ""){
   	 alert("Please fill out username/password fields");
	}else{		
		var httpClient = Ti.Network.createHTTPClient({timeout: 10000});
		
		httpClient.onload = function(){
			var respJSON = JSON.parse(httpClient.responseText);
			if(respJSON.user_auth_status == "true"){
				//save the two variables we need.
				Titanium.App.Properties.setString("user_auth_token", respJSON.user_auth_token);
				Titanium.App.Properties.setString("user_id", respJSON.user_id);
				Titanium.API.log("Login saved!");
				$.index.close();
				Alloy.createController('dashboard').getView();
			}else{
				alert("Unable to authenticate, make sure password is valid");
			}
						
		};
		httpClient.onerror = function(){
			var respJSON = JSON.parse(httpClient.responseText);
			Titanium.API.log(respJSON);
		
		};
		httpClient.open('POST', 'http://ifdef.me:8080/api/login');
		httpClient.setRequestHeader('Content-Type', 'application/json');
		
		var data = {
			email: $.txtLogin.value,
			password: $.txtPass.value,
			role: "student"
			
		};
		Titanium.API.log("UserName: " + $.txtLogin.value);
		Titanium.API.log("UserName: " + $.txtPass.value);
		
		httpClient.send(JSON.stringify(data));
		
		
	}
});