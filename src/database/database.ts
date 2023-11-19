
var mysql = require("mysql2");
require('dotenv').config();

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

connection.connect(function(err : any) {
    if(err)
        throw err;
    else
        console.log("connected to DB");
});

type getSessionReturnType = {
    userId: number,
    sessionId: string,
    challenge: string, 
    expiration: number
}

export async function createUser (userName : string, email : string) : Promise<void> {
    
}

export async function updateSession (sessionId : string, challenge : string) : Promise<void> {

}

export async function createSession () : Promise<string> {
    // returns session id
    return 'test';
}

export async function getSession(sessionId : string) : Promise<getSessionReturnType> {
    // returns all session data as json object
    return {
        userId: 1,
        sessionId: 'test',
        challenge: 'abc',
        expiration: 0
    };
}
