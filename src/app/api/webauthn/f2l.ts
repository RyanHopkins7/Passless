import { Fido2Lib } from "fido2-lib";

export const f2l = new Fido2Lib({
    timeout: 60000,
    rpId: 'localhost',
    rpName: 'PassLess',
    challengeSize: 128,
    authenticatorUserVerification: 'required'
});
