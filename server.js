var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newscraper";

mongoose.connect(MONGODB_URI);

// Initialize Express
var app = express();

//Serve static content for the app from the "public" directory in the application directory.
// Static files include: client side javascript, css, and images
// express.static is provided the relative path for our public folder
app.use(express.static("public"));

// Configure middleware
// ==================================

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsscraper", { useNewUrlParser: true });

// Routes
// ==================================

// a GET route for scraping the NPR website
app.get("/scrape", function(req, res){

    // grab body from HTML with axios
    axios.get("https://www.npr.org/sections/science/").then(function(response){

        // load the body into cheerios to scrape the data. Use $ as a shorthand selector
        var $ = cheerio.load(response.data);

        // Grab the scraped data from the NPR
        $(".item-info").each(function(i, element){

            // save data in an empty object
            var result = {};

            // capture the article title
            result.title = $(this)
                .children(".title").text();
            // capture the article summary
            result.summary = $(this)
                .children(".teaser").text();
            // capture the article link
            result.link = $(this)
                .children(".title").children("a").attr("href");


        // Create a new article using the data captured above
        db.Article.create(result)
            .then(function(dbArticle){
            })
            .catch(function(err){
                console.log(err);
            });
            
        
        });
        // send complete message
        res.send("Scrape Complete");
    });
});

// collect all article
app.get("/articles", function(req, res){

    // grab all articles from database
    db.Article.find({})
        .populate("comment")
        .then(function(Articles){

            var articles = {Articles}
            res.render("index", articles );
        })
        .catch(function(err){
            res.json(err)
        });
});

// create an comment for an article
app.post("/articles/:id", function(req, res){

    let commentInput = {
        comment: req.body.comment 
    }

    // create a new note and give it the body
    db.Comment.create(commentInput)
        .then(function(dbComment){
            // create note if successful
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comment: dbComment._id } }, { new: true });
        })
        .then(function(dbArticle){
            // return results
            res.json(dbArticle)
        })
        // return error if there is an error
        .catch(function(err){
            res.json(err)
        });
});

// delete a comment
app.delete("/articles/:id", function(req, res) {

    db.Comment.findByIdAndDelete({ _id: req.params.id})
    .then(function(dbComment){
        console.log(dbComment)
        res.json(dbComment)
    }).catch(function(err){
        console.log(err)
    })
});



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
  