/* Theater */

global.DIR = process.env.PWD || '/default/path/to/project';
global.PORT = process.env.PORT || 5000;

/* Librarian */

var JSON = require('JSON');
var _ = require('underscore');
var crypto = require('crypto');

// included if you need them \\
// var fs = require('fs'); 
// var http = require('http');
// var $ = require('jQuery');
// var async = require('async');
// var check = require('validator').check,
//     sanitize = require('validator').sanitize;


/* Application */

var db = require(global.DIR + '/app/database.js');
var app = require(global.DIR + '/app/application.js');


/* Routing */

// File System Database
app.get('/admin/update/:table', function(req, res){
    var table = req.params.table;
    db.update(table, res);
});

app.get('/data/:table/:sha?/:format?', function(req, res, next) {
    var path = req.params.table;
    if (req.params.sha) {
        path = req.params.table + '/' + req.params.sha;
    }
    var data = db.get(path, function(data){
        if(data){
            if(req.params.format === 'json'){
                res.send(data);
            } else {
                res.render(global.DIR + '/views/value.ejs', data);
            }
        } else {
            res.send('not found');
        }
    });
});

// Pages
app.get('/', function(req, res, next) {
	res.render(global.DIR + '/views/index.ejs', { eventname:'foo', location:'bar', sha:'sha'});
});

app.post('/', function(req, res, next) {

	var post = req.body;
	var sha = crypto.createHash('sha1');  
	sha.update(JSON.stringify(post));
	post.sha = sha.digest('hex');

	db.save('event/' + post.sha, post, function(){
        res.redirect('/event/' + post.sha); 
		//res.render(global.DIR + '/views/event.ejs', post);
	});
                            							
});

app.get('/event/:id', function(req, res, next) {
    var data = db.get('event/' + req.params.id, function(data){
        if(data){
            res.render(global.DIR + '/views/event.ejs', data);
        }
    });
});

app.post('/rsvp', function(req, res, next) {
    var data = db.get('event/' + req.body.eventId, function(eventData){
		var post = req.body;
        post.event = eventData;
		var sha = crypto.createHash('sha1');  
		sha.update(JSON.stringify(post));
		post.sha = sha.digest('hex');
		db.save('rsvp/' + post.sha, post, function(){
            res.redirect('/rsvp/' + post.sha); 
			//res.render(global.DIR + '/views/rsvp.ejs', post);
		});
    });                        							
});

app.get('/rsvp/:id', function(req, res, next) {
    var data = db.get('rsvp/' + req.params.id, function(data){
        if(data){
            res.render(global.DIR + '/views/rsvp.ejs', data);
        }
    });
});

/* Leader */
app.listen(global.PORT, function() {
    console.log("Listening on " + global.PORT);
});