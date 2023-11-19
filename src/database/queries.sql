CREATE DATABASE IF NOT EXISTS passless;

USE passless;

CREATE TABLE IF NOT EXISTS users(
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    recovery_email VARCHAR(255),
    user_name VARCHAR(255),
    public_key LONGTEXT,
    symm_key LONGTEXT,
    master_session VARCHAR(255)
);

-- Contains all passwords into single VARCHAR of the encrypted json data --
-- User_id refers to the user the passwords belong to
CREATE TABLE IF NOT EXISTS passwords(
    json LONGTEXT NOT NULL,
    user_id INT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS sessions(
    session_id VARCHAR(255) NOT NULL PRIMARY KEY,
    challenge VARCHAR(255),
    expiration BIGINT(20),
    user_id INT NOT NULL REFERENCES users(user_id)
);
