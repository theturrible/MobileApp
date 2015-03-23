// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundImage("shared/bkg_login.jpg");
 var win = Titanium.UI.createWindow();
 
var username = Titanium.UI.createTextField({
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
win.add(username);
 
var password = Titanium.UI.createTextField({
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
win.add(password);
 
var loginBtn = Titanium.UI.createButton({
    title:'Signup',
    top: 300,
    width:90,
    height:35,
    borderRadius:1,
    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14}
});
win.add(loginBtn);
win.open();