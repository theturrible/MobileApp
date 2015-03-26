var mongoose 	= require('mongoose');
var jwt 		= require('jwt-simple');
var moment 		= require('moment');

// define the schema for our user model
var authSchema = mongoose.Schema({
	user_id : 	String,
	code 	: 	String
	//,
	//create	: 	moment().calendar()
});

module.exports = mongoose.model('Auth', authSchema);