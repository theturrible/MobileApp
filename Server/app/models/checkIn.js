var mongoose = require('mongoose');
ObjectId = mongoose.Schema.ObjectId;

var checkInSchema = mongoose.Schema({
	courseId 	: 	String,
	token 		: 	String,
	expire 		: 	String,
	students 	:   [{ 
						id 		: 	String,
						email 	: 	String
					}],
	create 		: 	String
});

module.exports = mongoose.model('CheckIn', checkInSchema);