import mongoose from "mongoose";

mongoose.connect('mongodb://localhost:27017/passless');

const webAuthenticatorSchema = new mongoose.Schema({
    pubKey: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    authenticators: [webAuthenticatorSchema],
    sessionIds: [String]
});

const sessionSchema = new mongoose.Schema({
    sid: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    registrationStage: String
});

export const WebAuthenticator = mongoose.models.WebAuthenticator || mongoose.model('WebAuthenticator', webAuthenticatorSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
