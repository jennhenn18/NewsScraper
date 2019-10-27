var mongoose = require("mongoose");

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// Create Note schema
var NoteSchema = new Schema({
    title: String,
    body: String
});

// create a model from the above schema
var Note = mongoose.model("Note", NoteSchema);

// export model 
module.exports = Note;