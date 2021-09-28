// constants to run project with Node.js and express Js
const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// OTHER VARIABLES
let user_accountID;
let user_courseID;


// message
const cookieParser = require('cookie-parser')
const flash  = require('connect-flash');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
    secret: 'groupSix',
    resave: true,
    saveUnitialized: true
}));

 //In order to serve static css stylesheet
app.use(express.static(__dirname));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.use(flash());

 



// create connection
var con = mysql.createConnection({
    host: "107.180.1.16",
    port: "3306",
    user: "fall2021group6",
    password: "group6fall2021",
    database: "cis440fall2021group6"
});

// CONNECT TO DATABASE
con.connect(function(err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});


// BEGIN LOGIN FORM 
app.get('/', function(req, res) {
    res.render('login');
  });

  app.get('/home', function(req, res) {
    con.query('SELECT * FROM Accounts', function (error, results, fields) {
        if (results.length > 0) {
            res.render('home', {test: results[0]});
        };
        res.end();
    });
  });

app.post('/login/', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    
    if (username && password) {

        con.query('SELECT * FROM Accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                console.log('omg you just logged in.');
                console.log(req.body.username);
                console.log(req.body.password);
                req.session.loggedin = true;
                req.session.username = username;
                console.log(results);
                user_accountID = results[0].accountID;
                console.log(user_accountID);
                res.redirect('/homepage');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});
// END LOGIN FORM

// display homepage 
app.get('/homepage', function (req, res) {
    if (req.session.loggedin) {
        res.render('homepage.html')
    } else {
        res.redirect('/')
    }
});

// LOG USER OUT REDIRECT TO LOGIN PAGE
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


app.listen(3000);
console.log('Website Sever Is Running on Port 3000. Access via LOCALHOST:3000');


// flash message
// app.use((req, res, next) => {
//     res.locals.message = req.session.message
//     delete req.session.messages
//     next()
// })

// store user input on post request
// START REGISTER FORM
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
        if (err) throw err 
        if(results.length > 0) {
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
})
// END REGISTER FORM

// // DISPLAY COURSE PAGE & DROPDOWN LIST
app.get('/courses', function(req, res) {
    if (req.session.loggedin) {
        con.query(`SELECT courseName FROM Courses WHERE accountID= ?`, [user_accountID], function(err, results) {
            if (err) throw err;
            courses = [];
            (results).forEach(x => {
                courses.push(x.courseName);
            });
            console.log(courses)

            res.render('courses.html', {courses});
    });
    
}
})


// CREATE A NEW COURSE
app.post('/createcourses', function(req, res) {
    if (req.session.loggedin) {
        let courses =  req.body.course;
      
        con.query(`INSERT INTO Courses (courseName, accountID) VALUES ("${courses}", ${user_accountID})`, function (err, results) {
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

// // DISPLAY A DECK PAGE
// // app.get('/decks', function(req, res) {
// //     if (req.session.loggedin) {
// //         res.render('decks.html');
// //     }
// // })

// // CREATE A NEW DECK
// app.post('/getDecks', function(req,res) {
//     if (req.session.loggedin) {
//         let selectedCourse = req.body.selectedCourse;
//         console.log(`selected Course:`, selectedCourse);

//         con.query(`SELECT courseID FROM Courses WHERE courseName = ?`, "${selectedCourse}", function (err, results) {
//             if (err) {
//                 res.render('course.html');
//             }
//             else {
//                 console.log(`result of getdeck:`, results)
//                 let user_courseID = results[0].courseID;
//                 console.log(user_courseID);

//                 con.query(`SELECT deckName FROM Decks WHERE courseID = ?`, [user_courseID], function(err, results) {
//                     if (err) throw err;
//                     console.log(results)
//                     console.log(results[0].deckName);
//                     res.render('decks.html', {deckName: results[0].deckName})
//                 })
//             }
//         })
//     }
// })

// app.post('/createdecks', function(req, res) {
//     if (req.session.loggedin) {
//         let decks =  req.body.decks;
      
//         con.query(`INSERT INTO Decks (deckName, courseID) VALUES ("${decks}", ${user_courseID})`, function (err, results) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 console.log("Decks Inserted");
            
//                 res.render('decks.html');
//             }
//         })
//     }
// });
