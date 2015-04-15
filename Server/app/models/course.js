var mongoose = require('mongoose');
ObjectId = mongoose.Schema.ObjectId;

var courseSchema = mongoose.Schema({
	name		: 	String,	// ie) Mobile App Dev
	section		: 	String, // ie) CMSC
	num			: 	Number, // ie) 491
	professor	: 	String,
	profName	: 	String, // ie) 12 byte id generated from mongo for user
	classDays	: 	{
						day1	: 	String,	// ie)Monday
						day2	: 	String,	// ie)Wednesday
						day3 	: 	String, // ie)Friday
						day4 	: 	String,
						day5 	: 	String	
					},
	startTime 	: 	String,	// ie)2:00pm
	duration 	: 	Number, // ie) 75 - in minutes
	announce 	: 	[{
						body 	: 	String,
						create 	: 	String
					}],
	assign 	 	: 	[{
						name 	: 	String,
						body 	: 	String,
						dueDate : 	String,
						dueTime : 	String,
						points 	: 	String,
						create 	: 	String
					}],
	students 	: 	[{
						studentId 	 	: 	String,
						email 			: 	String
					}]
});

module.exports = mongoose.model('Course', courseSchema);