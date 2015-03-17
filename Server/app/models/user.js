var mongoose = require('mongoose');

var Schema = mongoose.Schema;  

var User = new Schema({  
    email: { type: String, required: true },  
    password: { type: String, required: true }
});