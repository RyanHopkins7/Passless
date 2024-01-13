import mongoose, { Types } from "mongoose";

mongoose.connect('mongodb://localhost:27017/passless');

export interface IWebAuthenticator {};
export interface IDevice {
    deviceWrappedVaultKey: String,
    _id: Types.ObjectId
};
export interface ISession {
    sid: String,
    user: String,
    _id: Types.ObjectId
};
export interface IUser {
    _id: Types.ObjectId,
    username: String,
    authenticators: Array<IWebAuthenticator>,
    devices: Array<IDevice>,
    sessionIds: Array<String>,
    passphraseResetAllowed: Boolean,
    // TODO: could be better to use the PHC string format
    // https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md
    passphraseHash: Buffer,
    passphraseHashSalt: String,
    passphraseHashPepper: Buffer,
    passphraseKeySalt: String,
    passphraseWrappedVaultKey: String
};

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
        type: String,
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
    sessionIds: [String],
    passphraseResetAllowed: Boolean,
    passphraseHash: Buffer,
    passphraseHashSalt: String,
    passphraseHashPepper: Buffer,
    passphraseKeySalt: String,
    passphraseWrappedVaultKey: String
});

export const WebAuthenticator = mongoose.models.WebAuthenticator || mongoose.model('WebAuthenticator', webAuthenticatorSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
