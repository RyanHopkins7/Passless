
var mysql = require('mysql2');
require('dotenv').config();

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

connection.connect(function(err) {
    if(err) throw err;
    console.log("connected!");
})

let query = `

CREATE DATABASE IF NOT EXISTS passless;

USE passless;

CREATE TABLE IF NOT EXISTS users(
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    recovery_email VARCHAR(255),
    user_name VARCHAR(255),
    hashed_passphrase LONGTEXT,
    master_session INT NOT NULL
);

-- Contains all passwords into single VARCHAR of the encrypted json data --
-- User_id refers to the user the passwords belong to
CREATE TABLE IF NOT EXISTS passwords(
    json LONGTEXT NOT NULL,
    user_id INT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS sessions(
    session_id INT NOT NULL PRIMARY KEY,
    challenge VARBINARY(128),
    user_id INT NOT NULL REFERENCES users(user_id)
);

ALTER TABLE users 
ADD FOREIGN KEY (master_session) REFERENCES sessions(session_id);`;

// Run the default query upon opening the 
connection.query(query, (err, results, fields) => {
    if(err) {
        throw err;
    }

    if(results != null) 
        console.log(results);
});
