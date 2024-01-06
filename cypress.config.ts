import { defineConfig } from "cypress";
import mysql from 'mysql2';
require('dotenv').config();

export default defineConfig({
    
    projectId: "wj9e2h",
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
            
            on('task', {
                // Queries database for particular resource
                async queryDB(query : string) {
                    const config = {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASS,
                        port : process.env.DB_PORT,
                        database: process.env.DB_NAME
                    }
                    // Initialize database connection
                    var connection = mysql.createConnection(config).promise();

                    // Query the database and return result
                    const [result] = await connection.query(query);

                    return result;
                },

                async resetDB() {
                    const config = {
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASS,
                        port : process.env.DB_PORT,
                        database: process.env.DB_NAME
                    }
                    // Initialize database connection
                    var connection = mysql.createConnection(config).promise();    

                    // Delete all data from the DB
                    await connection.query(`
                    DELETE sessions
                    FROM sessions INNER JOIN users on users.user_id=sessions.user_id
                    WHERE users.user_id > 0
                    `);

                    await connection.query(`
                    DELETE passwords
                    FROM passwords INNER JOIN users on users.user_id=passwords.user_id
                    WHERE users.user_id > 0
                    `);

                    await connection.query(`
                    DELETE FROM users WHERE users.user_id > 0
                    `);

                    return null;
                },

            })
        },
    },
    env: {
        DB: {
            "client": process.env.DB_CLIENT,
            "host": process.env.DB_HOST,
            "user": process.env.DB_USER,
            "database": process.env.DB_NAME,
            "password": process.env.DB_PASS,
            "port": process.env.DB_PORT
        }
    },
    
});
