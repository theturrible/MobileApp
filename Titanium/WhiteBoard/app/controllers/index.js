


function doClick(e) {
    alert($.label.text);
}


var id = Titanium.App.Properties.getString("loginID", 
function(){
	$.index.open();
});

var httpClient = Ti.Network.createHTTPClient({
		timeout: 10000
});

httpClient.onload = function(){
//actual code
	var res = httpClient.responseText; 
	Titanium.API.log("Currecnt login status: " + res);
	if(res == "true"){
		Alloy.createController('dashboard').getView();
	}else{
		$.index.open();
	}
	
};
httpClient.onerror = function(){
	alert("Unfortunately, we have encountered an error getting out server to play nice.");
	$.index.open();
};

httpClient.open('GET', 'http://localhost:8080/api/logged');
httpClient.setRequestHeader('Content-Type', 'application/json');
httpClient.send();





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
	//we gunna call apiii!!!
		
		var httpClient = Ti.Network.createHTTPClient(
			{
				timeout: 10000
			}
		);
		httpClient.onload = function(){
			var responseJson = JSON.parse(httpClient.responseText);
			Titanium.App.Properties.setString("loginID", responseJson.id);			
			$.index.close();
			Alloy.createController('dashboard').getView();
		
		};
		httpClient.onerror = function(){
			var responseJson = JSON.parse(httpClient.responseText);
			Titanium.API.log(responseJson);
		
		};
		httpClient.open('POST', 'http://localhost:8080/api/login');
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