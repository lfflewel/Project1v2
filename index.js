
// constants to run project with Node.js and express Js
const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

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

app.set('views', __dirname + '/pages');
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


// // START @DYLAN PART
// // display courses page
// app.get('/courses', function(req, res) {
//     if (req.session.loggedin) {
//         res.render('courses.html');
//     }
//     else {
//         res.redirect('/')
//     }
// });
// var courseID = 02;
// let http = require('http');
// function CreateNewCourse() {

//     var course_name = document.getElementById("course");
//     function CreateNewCourse() {
//         con.connect(function(err) {
//             if (err) throw err;
//             con.query("INSERT INTO Courses (courseName, accountID) VALUES (course_name, accountID)", function (err, result, fields) {
//             if (err) throw err;
//             console.log(result);
//             });
//         });
//     }
// }
// var course_name = "CIS425"

// var accountID = 02
// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!")
//     let sqlQuery = `INSERT INTO Courses (courseName, courseID, accountID) VALUES ("${course_name}" , "${courseID}" , "${accountID}")`
//     con.query(sqlQuery, function (err, result) {
//       if (err) throw err;
//       console.log("1 row inserted");
//     });
//   });

// // END @DYLAN PART

// // START @WUnder part
// con.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
//     let sql = "INSERT INTO terms VALUES ('SCRUM', 'Agile')";
//     con.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log("1 record inserted");
//     });
// })
// END Wunder part



