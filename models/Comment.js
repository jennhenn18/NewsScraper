var mongoose = require("mongoose");

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// Create Note schema
var CommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    }
});

// create a model from the above schema
var Comment = mongoose.model("Comment", CommentSchema);

// export model 
module.exports = Comment;