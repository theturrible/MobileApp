


function doClick(e) {
    alert($.label.text);
}


$.index.open();

$.btnSignup.addEventListener('click', function(e){ 
//controller name is 'sample
  	$.index.close();
 	var sample = Alloy.createController('signup').getView()
 
  
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
			alert(responseJson.id);
		
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