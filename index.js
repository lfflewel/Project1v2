// Project needs NODE.JS as the back-end server
// Express JS is the framework that will allow us to pass in variables / db

/* -- CONSTANTS ---------------------------------------------- */
// These are constant variables required to run the poject
const express = require('express');        
const app = express();                     
const mysql = require('mysql');             
const session = require('express-session');
const exp = require('constants');

// this to parse JSON data that gets retrieve from the data base
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// kinda like session login token
app.use(session({
    secret: 'groupSix',
    resave: true,
    saveUnitialized: true
}));

// this to serve / render static css stylesheet "style.css" and other
app.use(express.static(__dirname));

// this will convert normal html to ejs files that Express Framework
app.set('views', __dirname + '/pages');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// DEFINE THE SQL CONNECTION - given by our prof
var con = mysql.createConnection({
    host: "107.180.1.16",
    port: "3306",
    user: "fall2021group6",
    password: "group6fall2021",
    database: "cis440fall2021group6"
});

// Calling the variable above and connecting the db
// IF connect, terminal will say "Connection establish..."
con.connect(function(err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});

app.listen(3000);
console.log('Website Sever Is Running on Port 3000. Access via LOCALHOST:3000');
/* ----------------------------------------------------------- */
// .
// .
// .
// .
/* -- WEBSITE GLOBAL VARIABLES ------------------------------- */
// camelCase coding convention

let userAccountID;
let userCourseID;
let userDeckID;
let userCardID;

/* ----------------------------------------------------------- */




/*
    NOTES:
    (reference: 
        - https://expressjs.com/en/guide/routing.html
        - https://masteringjs.io/tutorials/express/app-get)
    
    APP.GET() ---> this is the route method used to serve the client request back to the website
        - you use this when you want to render a view (html page), retrieve something from the db etc...
        app = is just the var name we defined above ...(line 7)
        
        ex --> app.get('/method', function(request, respond) {})
            -- the website front-end will listen for requests to '/method' and run the function when it sees one..GET THEN RETURN VALUE.
            -- request, respond can also be abbrievated to req, res...these are just parameters 
            -- '/method' is what gets define inside action="" of <form> inside HTML

    APP.POST() ---> like the name say....this will send the client request back to the server
        -- you use this to do things like...
            - INSERT to database
            - UPDATE to database
            - DELETE to database
        
        ex ---> user creating new deck then saving / storing that into db (a call to the server)
*/





// -- start code below





/* -- LOGIN FUNCTIONS (LOGIN.HTML) --------------------------- */
// GET - Render Login Screen
// since this is main page upon loading website, we can just define '/' as the request / route
app.get('/', function(req, res) {
    // res.render('page') will render the html to localhost:3000
    res.render('login');
  });


// The actual method that will get the sign in values typed in and then validate it
// compare to db record - validate --> then redirect as needed
app.post('/login', (req, res) => {

// use req.body.varName when we want to retrieve the value entered on the HTML textboxes...etc
    var username = req.body.username;
    var password = req.body.password;

    console.log('Begin validating user...');
    console.log(`Username: ${req.body.username}`);
    console.log(`Password: ${req.body.password}`);

    // if (username == valid && password == valid)
    if (username && password) {

        // call to db --> pass in the username && passwod as the parameters [] for the QUERY string below
        // inside the query statement, we also define a function that will handle the error, results from the SQL query
        con.query('SELECT * FROM Accounts WHERE username = ? AND password = ?', [username, password], function (err, results) {
            if (err) throw err;

            if (results.length > 0) {
                // the query will return a result if parameters matched
                console.log('Found user record.');
                console.log(results);

                // now we set our session.loggedin to be true
                // set the session username to the signed in username --> in case of needing to reference it in other methods below
                req.session.loggedin = true;
                req.session.username = username;

                // we will also assign that to a global variable above ---> in also case of needing to reference it in other methods below
                userAccountID = results[0].accountID;
                console.log(`Account ID: ${userAccountID}`);
                
                // redirect user to HOMEPAGE
                res.redirect('/homepage');
            } 
            else 
            {
                // TODO: Will find solutions to populate validation messages on HTML
                // the complication to that rn is that the login screen has some animated feature...
                res.send('Incorrect Username and/or Password!');
            }
        });
    } else {
        res.send('Please enter Username and Password!');
    }
});

// LOG USER OUT REDIRECT TO LOGIN PAGE
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});
/* ----------------------------------------------------------- */






/* -- RERGISTER / SIGN UP ------------------------------------ */
app.post('/register', function(req, res) {

    let firstname =  req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confirm_password = req.body.confirm_password;

    console.log(firstname)
    console.log(lastname)
    console.log(username)
    console.log(email)
    console.log(password)
    console.log(confirm_password)

    con.query('SELECT * FROM Accounts WHERE email = ?', [email], function(err, results, fields) {
        if (err) throw err;

        if(results.length > 0) {
            // TODO: Will find solutions to populate validation messages on HTML
            req.session.message = {
                type: 'warnning',
                intro: 'Email was existed already',
                message: 'Please try another email.'
            }
            res.redirect('/');
            console.log('Email was existed already');
        }
        else if (confirm_password != password) {
            req.session.message = {
                type: 'danger',
                intro: 'Password do not match',
                message: ' Please make sure to insert the same password!!'
            }
            console.log('Password not match!');
            res.redirect('/');
        } else {
            // save dato into the database 
            con.query(`INSERT INTO Accounts (firstname, lastname, email, username, password, createdDate) VALUES ("${firstname}", "${lastname}","${email}", "${username}","${password}", NOW())`, function (err, results) {
            if (err) throw err;
            req.session.message = {
                type: 'success',
                intro: 'You are now registered',
                message: 'Please log in'
            }
                console.log('record inserted')
            });
            res.redirect('/');
        }
    })
});
/* ----------------------------------------------------------- */



/* -- HOMEPAGE ----------------------------------------------- */
app.get('/homepage', function (req, res) {
    if (req.session.loggedin) {
        // Do whatever needed / whatever to be display when upon rendering the homepage

        // 1. get courses from the database --> then store into our Courses list --> to display in a dropdown HTML list
        con.query(`SELECT courseName FROM Courses WHERE accountID= ?`, [userAccountID], function(err, results) {
            if (err) throw err;

            let courses = [];
            // for each row retrieved from the Course list in the db, iterate through to add to our new course variable
            (results).forEach(x => {
                courses.push(x.courseName);
            });

            console.log(courses);

            // when rendering a page, we can also pass in variables to be reference directly on the HTML using <%= .... %> syntax
            // we would pass the variables in like res.render('page.html', {var}) --> can also pass multiple vars with commas
            res.render('homepage.html', {courses});
        });
    }
});

/* ----------------------------------------------------------- */


/* -- COURSES PAGE ------------------------------------------- */
app.get('/courses', function(req, res) {
    if (req.session.loggedin) {
        res.render('courses.html');
    }
});

// CREATE A NEW COURSE
app.post('/createcourses', function(req, res) {
    if (req.session.loggedin) {
        let courses =  req.body.course;
      
        // so when we write sql query, ex: 'select * from table where id = #',
        // when it's a number / boolean, we don't wrap it around quotation ""
        // however, if we're specifying STRINGS, then we want to wrap it around quotations ""
            // ex: select * from table where courseName = "CIS400" <--- hence why some have quotes some don't

        con.query(`INSERT INTO Courses (courseName, accountID) VALUES ("${courses}", ${userAccountID})`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Course Inserted");
                res.render('courses.html');
            }
        })
    }
});
/* ----------------------------------------------------------- */

/* -- DECK PAGE ---------------------------------------------- */

// DISPLAY A DECK PAGE
app.get('/decks', function(req, res) {
    if (req.session.loggedin) {
        res.render('decks.html');
    }
});

// This is when we select the course in the dropdown list in homepage.html ---> redirect to deck of specified course
app.post('/getDecks', function(req,res) {
    if (req.session.loggedin) {
        let selectedCourse = req.body.selectedCourse;
        console.log(`selected Course:`, selectedCourse);

        con.query(`SELECT courseID FROM Courses WHERE courseName = ?`, [selectedCourse], function (err, results) {
            if (err) {
                res.render('/courses');
            }
            else {
                
                userCourseID = results[0].courseID;
                console.log(userCourseID);
                res.render('decks.html')

                // con.query(`SELECT deckName FROM Decks WHERE courseID = ?`, [userCourseID], function(err, results) {
                //     if (err) throw err;
                //     console.log(results)
                //     console.log(results[0].deckName);
                //     res.render('decks.html', {deckName: results[0].deckName})
                // })
            }
        })
    }
});

// this create decks method, retrieve new deck's ID, and store it as userDeckID - WORKS
app.post('/createDecks', function(req, res) {
    if (req.session.loggedin) {
        let decks =  req.body.decks;

        con.query(`INSERT INTO Decks (deckName, courseID) VALUES ("${decks}", ${userCourseID});`, function (err, results) {
            if (err) {
                console.log(err);
            }
            else {
                //reconnect to get new deck's ID and save it to userDeckID
                con.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err){
                        console.log(err);
                    }
                    else {
                        userDeckID = results
                        console.log("Decks Inserted");
                        console.log(userDeckID);
                    
                        res.render('decks.html');
                    }

                })
           }
        })
    }
});
/* ----------------------------------------------------------- */
