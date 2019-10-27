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

// Initialize Express
var app = express();

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
                console.log(dbArticle)
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
        .then(function(Articles){
            console.log(Articles)
            res.render("index", Articles );
        })
        .catch(function(err){
            res.json(err)
        });
});

// grab a specific article, so when an article headline is clicked on we can pull in the note
app.get("/articles/:id", function(req, res){

    // grab the specific article
    db.Article.findOne({ _id: req.params.id})

        // populate the notes aka display note if it is populated
        .populate("note")
        .then(function(dbArticle){
            // return article
            res.json(dbArticle)
        }) 
        .catch(function(err){
            // show error
            res.json(err)
        });
});

// create an note for an article
app.post("/articles/:id", function(req, res){

    // create a new note and give it the body
    db.Note.create(req.body)
        .then(function(dbNote){
            // create note if successful
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
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



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
  