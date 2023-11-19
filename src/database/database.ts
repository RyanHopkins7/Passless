
var mysql = require("mysql2");
var randomstring = require("randomstring");
require('dotenv').config();

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
}).promise();

type getSessionReturnType = {
    sessionId: string,
    challenge: string, 
    expiration: number,
    userId: number
} 

async function createUser (username : string, email : string, recoveryEmail : string, 
                                hashedPass : string) : Promise<void> {
    let query : string = `
        INSERT INTO users (email, recovery_email, user_name, hashed_passphrase)
        VALUES (?, ?, ?, ?)
    `;
    await connection.query(query, [email, recoveryEmail, username, hashedPass]);

}

async function updateSession (sessionId : string, challenge : string) : Promise<void> {
    let query : string = `
        UPDATE sessions
        SET challenge = ?
        WHERE session_id = ?
    `;

    await connection.query(query, [challenge, sessionId]);
}

async function createSession (challenge : string, email : string) : Promise<string> {
    let sessionId : string = randomstring.generate({
        charset: 'alphanumeric',
        length: 60
    });

    let userId : number = await getUserId(email);

    let query : string = `
        UPDATE users
        SET master_session = ?
        WHERE (user_id = ? and master_session IS NULL)
        `;

    await connection.query(query, [sessionId, userId]);

    let expiration : number = (Date.now() / 1000) + (24*60*60);

    // Finally add the new session to the database
     query  = `
        INSERT INTO sessions (session_id, challenge, expiration, user_id)
        VALUES (?, ?, ?, ?)
    `;

    await connection.query(query, [sessionId, challenge, expiration, userId]);

    return sessionId;
}

// RETURNS: Session in the form of a JSON object
async function getSession(sessionId : string) : Promise<getSessionReturnType> {
    let query = `
        SELECT *
        FROM sessions
        WHERE session_id = ?
        LIMIT 1
    `;

    let [session] = await connection.query(query, [sessionId]);

    // returns all session data as json object
    return session[0];
}

async function getUserId(email : string) : Promise<number> {
    let query = `
        SELECT * from users
        WHERE email = ?
    `;

    let [user] = await connection.query(query, [email]);
    
    return user[0].user_id;
}

async function validateUniqueEmail(email : string) : Promise<boolean> {
    let query : string = `
        SELECT * from users
        WHERE email = ?
    `;

    let [user] = await connection.query(query, [email]);

    if(user.length > 0)
        return false;

    return true;
}


module.exports = {createUser, updateSession, createSession, getSession, getUserId, validateUniqueEmail}