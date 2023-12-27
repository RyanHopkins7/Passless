import mongoose from "mongoose";

mongoose.connect('mongodb://localhost:27017/passless');

const webAuthenticatorSchema = new mongoose.Schema({
    pubKey: String
});

const deviceSchema = new mongoose.Schema({
    deviceWrappedVaultKey: String
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
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    authenticators: [webAuthenticatorSchema],
    devices: [deviceSchema],
    sessions: [sessionSchema],
    registrationStage: String,
    passphraseHash: String,
    passphraseHashSalt: String,
    passphraseKeySalt: String,
    passphraseWrappedVaultKey: String
});

export const WebAuthenticator = mongoose.models.WebAuthenticator || mongoose.model('WebAuthenticator', webAuthenticatorSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
