//Importing required modules (dependencies)
const express = require ('express');
const mysql = require ('mysql2');
const app = express ()
const bp = require('body-parser'); 
const multer = require('multer');
const port = 4000; 

//Making code able to understand the request from frontend also to take data from url
app.use (bp.json ()) 
app.use (bp.urlencoded({ extended: true }))

// Connecting with DB
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Umer1234",
    database: "user_registration"
});

/*
con.connect(function(err) {
   if (err) throw err;
   console.log("Connected!");
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE user_registration", function (err) {
      if (err) throw err;
      console.log("Database created");
    });
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE user_detail (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, name VARCHAR(255), gender VARCHAR (6), dob DATE, pno VARCHAR (20), email VARCHAR (55), address VARCHAR(255), FOREIGN KEY (user_id) REFERENCES users (user_id))";
    con.query(sql, function (err) {
      if (err) throw err;
      console.log("Table created");
    });
});
*/

//We need a sign-up page for first time user & login page for already user

//App home page
app.get ('/', (req, res) => {
    res.sendFile (__dirname + '/HTML/home.html')
});
//End of app home page

//Patient Signup page
app.get ('/signuppage', (req, res) => {
    res.sendFile (__dirname + '/HTML/PatientSide/sign_up.html');
});
//Patient End of signup page

//Patient Login page
app.get ('/loginpage', (req, res) => {
    res.sendFile (__dirname + '/HTML/PatientSide/login.html');
});
//End of login page

//Patient Sign up into account api
app.post ('/sign-up-in-account', (req, res) => {
    var pno = req.body.pno;
    var pass = req.body.pass;

    con.connect ((err) => {
        if (err) throw err;
        var sql = `SELECT pno FROM users WHERE pno='${pno}'`
        con.query (sql, (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                sql = `INSERT INTO users (pno, pass) VALUES ('${pno}', '${pass}')`;
                con.query (sql, (err) => {
                    if (err) throw err;
                    console.log ('1 record inserted');
                    res.sendFile (__dirname + '/HTML/PatientSide/login.html');
                }); 
            } else {
                console.log ('Account already exist');
                res.status (400).send ('Account already exist with this number.');
                // res.sendFile (__dirname + '/HTML/PatientSide/login.html');
            }
        });       
    });
});
// End of sign up into account api

//Patient Login into account api
app.post ('/login-acc', (req, res) => {
    var pno = req.body.pno;
    var pass= req.body.pass;

    con.connect ((err) => {
        if (err) throw err;
        var sql = `SELECT pno FROM users WHERE pno='${pno}'`;
        con.query (sql, (err, result) => {
            if (err) throw err;
            console.log (result)
            console.log (result.length)
            if (result.length == 0) {
                console.log ("Don't have an account");
                // res.sendFile (__dirname + '/HTML/PatientSide/signup.html');
                res.status (400).send ('Account does not exist');                
            } else {
                sql = `SELECT pass FROM users WHERE pno=${pno}`;
                con.query (sql, (err, result) => {
                    if (err) throw err;
                    if (result[0]['pass'] == pass) res.sendFile (__dirname + '/HTML/PatientSide/patient_registration.html');  
                    else {
                        res.status (404).send ("Wrong password");
                    }
                });
            }  
        });
    });
});
//End of login into account api

//Patient register form api
app.get ('/patient_registration', (req, res) => {
    res.sendFile (__dirname + '/HTML/PatientSide/patient_registration.html');
});
//End of patient register api

//Patient Register detail insert api
app.post ('/register_user_detail', (req, res) => {
    var name = req.body.person_name;
    var gender = req.body.gender;
    var dob = req.body.dob;
    var phone = req.body.pno;
    var email = req.body.email;
    var address = req.body.address;
    var user_id, user_exist=false;

    con.connect ((err) => {
        if (err) throw err;
        console.log ("Connected!");
        var sql = `SELECT user_id FROM users WHERE pno='${phone}'`;
        con.query (sql, (err, result) => {
            if (err) throw err;
            //console.log (result[0]['user_id']);
            if (result.length == 0) {
                console.log ('No such records');
                // res.sendFile (__dirname + "/patient_registration.html");
                return res.status(400).send(`No user with this phone number: ${phone}`);
            }
            else console.log ('1 record fetched')
            user_id = result[0]['user_id'];

            sql = `SELECT pno FROM user_detail WHERE pno='${phone}'`;
            con.query (sql, (err, result) => {
                if (err) throw err;
                if (result.length != 0) //Phone no exist
                    user_exist=true;
                if (user_exist) {
                    // res.sendFile (__dirname + "/patient_registration.html"); //Take to dr side
                    return res.status(400).send('User already exist');
                }
                sql = `INSERT INTO user_detail (user_id, name, gender, dob, pno, email, address) VALUES (${user_id}, '${name}', '${gender}', '${dob}', '${phone}', '${email}', '${address}')`;
                con.query(sql, (err) => {
                    if (err) throw err;
                    console.log("1 record inserted");
                    res.sendFile (__dirname + '/HTML/PatientSide/pat_home.html');
                });
            });
        })
    });
});
//End of Patient register

//Dr. register form api
app.get ('/dr_registration', (req, res) => {
    res.sendFile (__dirname + '/HTML/DoctorSide/doctor_registration.html');
});
//End of register api

// DR. Register API - Set up a storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'DrImages/'); // Specify the directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename for the uploaded file
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 } //10MB
});

app.post('/register_dr_detail', upload.single ('image'), (req, res) => {
    if (!req.file) {
        console.log (req.file);
        return res.status(400).send('No file uploaded.');
    }

    var name = req.body.person_name;
    var phone = req.body.pno;
    var email = req.body.email;
    var spec = req.body.spec;
    var dr_id, user_exist=false;

    con.connect ((err) => {
        if (err) throw err;
        console.log ("Connected!");
        var sql = `SELECT dr_id FROM drs WHERE pno='${phone}'`;
        con.query (sql, (err, result) => {
            if (err) throw err;
            //console.log (result[0]['user_id']);
            if (result.length == 0) { 
                console.log ('No such records');
                // res.sendFile (__dirname + "/doctor_registration.html");
                return res.status(400).send(`No user with this phone number: ${phone}`);
            }
            else console.log ('1 record fetched')
            dr_id = result[0]['dr_id'];
            
            sql = `SELECT pno FROM dr_detail WHERE pno='${phone}'`;
            con.query (sql, (err, result) => {
                if (err) throw err;
                if (result.length != 0)
                    user_exist=true;
                if (user_exist) {
                    // res.sendFile (__dirname + "/doctor_registration.html"); //Take to dr side
                    return res.status(400).send('User already exist');
                }
                sql = `INSERT INTO dr_detail (dr_id, name, pno, email, spec) VALUES (${dr_id}, '${name}', '${phone}', '${email}', '${spec}')`;
                con.query(sql, (err) => {
                    if (err) throw err;
                    console.log("1 record inserted");
                    res.status (200).send ("User registered successfully !!!");
                });
            });
        })
    });
    // res.sendFile (__dirname + '/HTML/DoctorSide/dr_home.html');
});
//End of DR. register api

//Appointment page api
app.get ('/appointmentpage', (req, res) => {
    res.sendFile (__dirname + '/HTML/PatientSide/appointment.html');
});
// End of appointment page api

//Take appointment api 
app.post ('/take_appointment', (req, res) => {
    
});
//End of take appointment api

app.listen (port, () => {
    console.log (`Server running at PORT ${port}`);
});