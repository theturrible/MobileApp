var mongoose = require('mongoose');
ObjectId = mongoose.Schema.ObjectId;

var courseSchema = mongoose.Schema({
	name		: 	String,	// ie) Mobile App Dev
	section		: 	String, // ie) CMSC
	num			: 	Number, // ie) 491
	professor	: 	String, // ie) 12 byte id generated from mongo for user
	classDays	: 	{
						day1	: 	String,	// ie)Monday
						day2	: 	String,	// ie)Wednesday
						day3 	: 	String	// ie)Friday
					},
	startTime 	: 	String,	// ie)2:00pm
	duration 	: 	Number // ie) 75 - in minutes

});

module.exports = mongoose.model('Course', courseSchema);