const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');

// ----- Mysql ------
const mysql = require('mysql');
const config = require('./dbConfig.js');
const con = mysql.createConnection(config);

// ---- Middleware -----
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============= Root ==============
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "views/login.html"));
});




// Page route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/admin.html"));
});

app.get("/user", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/user.html"));
});


//  Other route
//
app.post("/login", (req, res) => {
    let { username, password } = req.body;
    console.log(`New user logged: ${username}, ${password}`);
    const sql = `SELECT username, role FROM user WHERE username='${username}' AND password='${password}'`;
    database.query(sql, function (err, result, fields) {

        if (err) {
            console.log(err);
            res.status(500).send("Database Server Error.");
        } else {
            if (result.length != 1) {
                res.status(400).send("Wrong Username or Password.");
            } else {
                if (result[0].role == 1) {
                    res.send("/admin");
                } else {
                    res.send("/user");
                }
                
            }
        }
    });
});

// login service 2
app.post("/login2", (req, res) => {
    const username = req.body.username;
    const raw = req.body.password;

    const sql = `SELECT password, role FROM user WHERE username=?`;
    database.query(sql, [username], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error.");
        } else {
            if (result.length != 1) {
                console.log("Username error!");
                res.status(500).send("User not found or repeated users.");
            } else {
                const hash = result[0].password;
                console.log(username, hash);
                bcrypt.compare(raw, hash, function(err, same) {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Authen server error");
                    } else {
                        if (same) {
                            // raw == hash
                            if (result[0].role == 1) {
                                res.send("/admin");
                            } else {
                                res.send("/user");
                            }
                            
                        } else {
                            res.status(400).send("Wrong password!");
                        }
                    }
                });
            }
            
        }
    });

});

// ======= Password gen =======
app.get("/password/:raw", (req, res) => {
    const raw = req.params.raw;
    bcrypt.hash(raw, 10, function(err, hash) {
        if (err) {
            console.log(err);
            res.status(500).send("Hashing password error.");
            
        } else {
            res.send(hash);
            console.log("Password length: ", hash.length);
        }

    });
});

//********************** Get all user ***********************
app.get("/users", function(req, res){
    const sql = "SELECT id, username,  role FROM user";
    database.query(sql, function(err, result){
        if (err) {
            console.log(err);
            res.status(500).end("Database server error");
        }
        else{
            res.json(result);
            console
        }
    });
});

// ****************** Delete a user ********************
app.delete("/user/:id", function(req, res){
    const id = req.params.id;
    const sql ="DELETE FROM user WHERE id=?"
    database.query(sql, [id], function(err, result){
        if(err){
            console.log(err);
            res.status(500).send("Database server error");
        }
        else{
            if(result.affectedRows == 1) {
                res.send("Delete done");
            }
            else{
                res.status(500).send("Delete Error");
                
            }
        }
    });
});

app.put("/user/add", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    console.log("New user: ", username, password, role);
    
    const sql = "INSERT INTO user VALUES (NULL, ?, ?, ?)";
    
    database.query(sql, [username, password, role], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send("Database server error.");
        } else {
            if (result.affectedRows == 1) {
                res.send("New user has been added.");
            } else {
                res.status(501).send("Error while adding new user.");
            }
        }
    });

 });

 app.put("/user/update", (req, res) => {
     const id = req.body.id;
     const username = req.body.username;
     const password = req.body.password;
     const role = req.body.role;

     const sql = "UPDATE user SET username = ?, password = ?, role = ? WHERE id = ?";

     database.query(sql, [username, password, role, id], function(err, result) {
        
        if (err) {
            console.log(err);
            res.status(500).send("Database server error.");
        } else {
            if (result.affectedRows == 1) {
                res.send("User has been updated.");
            } else {
                res.status(501).send("Error while updating user.");
            }
        }
     });
 });


//********Strat server *********
const PORT = 3000;
app.listen(PORT, (req, res) => {
    console.log("Server is running on port " + PORT);
})