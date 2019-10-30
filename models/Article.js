// import mongoose npm package 
var mongoose = require("mongoose");


// save a reference to the schema constructor
var Schema = mongoose.Schema;

// Setup schema
var ArticleSchema = new Schema ({
    // title of the article
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
});


// Create article schema
var Article = mongoose.model("Article", ArticleSchema);

// export the model
module.exports = Article;

