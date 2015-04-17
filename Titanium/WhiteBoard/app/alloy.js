// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};


var pWidth = Ti.Platform.displayCaps.platformWidth;
var pHeight = Ti.Platform.displayCaps.platformHeight;
Ti.App.SCREEN_WIDTH = (pWidth > pHeight) ? pHeight : pWidth;
Ti.App.SCREEN_HEIGHT = (pWidth > pHeight) ? pWidth : pHeight;

Alloy.CFG.defaultLoginSpace = 60;
Alloy.CFG.defaultLoginElementHeight = 50;

Alloy.CFG.defaultLoginButtonSpace = 50;
Alloy.CFG.defaultLoginButtonHeight = 40;

Alloy.CFG.loginWidth = pWidth / 1.5;
Alloy.CFG.leftOffset = (pWidth  - Alloy.CFG.loginWidth)/2 ;
Titanium.API.log("Setting element width to: "  + Alloy.CFG.loginWidth);

Alloy.CFG.loginTop = ((pHeight / 3));
Titanium.API.log("Setting element top to: "  + Alloy.CFG.loginTop);
Alloy.CFG.loginTop1 = ((pHeight / 3) + (Alloy.CFG.defaultLoginSpace * 1));


Alloy.CFG.loginButton1 = ((pHeight / 3) + (Alloy.CFG.defaultLoginSpace + Alloy.CFG.defaultLoginButtonSpace));
Alloy.CFG.loginButton2 = ((pHeight / 3) + (Alloy.CFG.defaultLoginSpace + Alloy.CFG.defaultLoginButtonSpace));

Alloy.CFG.loginTop2 = ((pHeight / 3) + (Alloy.CFG.defaultLoginSpace * 2));
Alloy.CFG.loginTop3 = ((pHeight / 3) + (Alloy.CFG.defaultLoginSpace * 3));



