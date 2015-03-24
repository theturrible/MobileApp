var mongoose = require('mongoose');

var courseSchema = mongoose.Schema({
	name		: 	String,	// ie) Mobile App Dev
	section		: 	String, // ie) CMSC
	num			: 	Number, // ie) 491
	professor	: 	String, // 12 byte id generated from mongo for user
	classDays	: 	{
						day1	: 	String,	//Monday
						day2	: 	String,	//Wednesday
						day3 	: 	String	//Friday
					},
	startTime 	: 	String,	//2:00pm
	duration 	: 	Number // 75 - in minutes

});

module.exports = mongoose.model('Course', courseSchema);