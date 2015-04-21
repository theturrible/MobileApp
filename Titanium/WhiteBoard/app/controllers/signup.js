// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundImage("Shared/bkg_login.jpg");
 var win = Titanium.UI.createWindow();
 
var txtEmail = Titanium.UI.createTextField({
    color:'#336699',
    top:200,
    left:50,
    width:300,
    height:40,
    hintText:'Username',
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(txtEmail);
 
var txtPass = Titanium.UI.createTextField({
    color:'#336699',
    top:250,
    left:50,
    width:300,
    height:40,
    hintText:'Password',
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
win.add(txtPass);
 
var btnSignup = Titanium.UI.createButton({
    title:'Signup',
    top: 300,
    width:90,
    height:35,
    borderRadius:1,
    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(btnSignup);

btnSignup.addEventListener('click', function(){
	
	var httpClient = Ti.Network.createHTTPClient({
			timeout: 10000
	});
	
	httpClient.onload = function(){
	//actual code
		Titanium.API.log("onload");
		
		var res = JSON.parse(httpClient.responseText); 
		Titanium.API.log(res);
		Titanium.App.Properties.setString("loginID", res.id);			
		win.close();
		Alloy.createController('index').getView();
	};
	httpClient.onerror = function(){
		Titanium.API.log("error");
		alert("I'm sorry, sign up was not successful");
		Alloy.createController('index').getView();
	};
	
	var data = {
		email: txtEmail.value,
		password: txtPass.value,
		role: "student"
	};
	
	
	
	httpClient.open('POST', 'http://ifdef.me:8080/api/signup');
	httpClient.setRequestHeader('Content-Type', 'application/json');
	httpClient.send(JSON.stringify(data));

	
});


win.open();