import mongoose from "mongoose";

mongoose.connect('mongodb://localhost:27017/passless');

const webAuthenticatorSchema = new mongoose.Schema({
    pubKey: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    authenticators: [webAuthenticatorSchema]
});

export const WebAuthenticator = mongoose.model('WebAuthenticator', webAuthenticatorSchema);
export const User = mongoose.model('User', userSchema);
