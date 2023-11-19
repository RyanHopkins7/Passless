const { subtle } = globalThis.crypto;
const crypto = globalThis.crypto;

rsaprivkey = null
rsapubkey = null
symkey = null

async function generateSymKey(length = 256) {
    
    const aeskey = await subtle.generateKey({
      name: 'AES-GCM',
      length,
    }, true, ['encrypt', 'decrypt']);
    a = await subtle.exportKey('jwk', aeskey);
    symkey = aeskey
    return {
        a,
        symkey,
    };
} 

const publicExponent = new Uint8Array([1, 0, 1]);
async function generateRsaKey(modulusLength = 2048, hash = 'SHA-256') {
    const {
      publicKey,
      privateKey,
    } = await subtle.generateKey({
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent,
      hash,
    }, true, ['encrypt', 'decrypt']);
    rsaprivkey = privateKey
    rsapubkey = publicKey
    return { publicKey, privateKey };
  } 


async function encryptSymKey(key, pubkey){
    const ec = new TextEncoder();
    // Assumes that the key is passed in extracted form (jwk)
    
    if (pubkey == "self"){
        pubkey = rsapubkey
    }
    if (key == "self"){
        key = await subtle.exportKey('raw', symkey);
    }
    enckey = ec.encode(new Uint8Array(key));
    ciphertext = await crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        pubkey,
        enckey,
      );
    return {ciphertext,enckey, key}
}

async function decryptSymKey(buffer){
    const privkey = rsaprivkey;
    const dc = new TextDecoder("utf-8");
    const decsymkey = await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        privkey,
        buffer,
    );
    b = dc.decode((new Uint8Array(decsymkey)).buffer);
    var array = JSON.parse("[" + b + "]");
    maybe = new Uint8Array(array)
    var length = maybe.length;
    var buffer = new ArrayBuffer( length );
    var view = new Uint8Array(buffer);
    for ( var i = 0; i < length; i++) {
        view[i] = maybe[i];
    }
    symkey = await crypto.subtle.importKey("raw", buffer, "AES-GCM", true, ["encrypt", "decrypt",]);
    return buffer
}

function checkGlobals(){
    return {
        rsaprivkey,
        rsapubkey,
        symkey
    }
}

async function encryptPassword(password) {
    const ec = new TextEncoder();
    const key = symkey;
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const ciphertext = await crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv,
    }, key, ec.encode(password));
    return {
      iv,
      ciphertext,
    };
  }

async function decryptPassword(ciphertext, iv){
    const dec = new TextDecoder();
    const key = symkey;
    const password = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv,
    }, key, ciphertext);
    return dec.decode(password);
}

exports = module.exports = {
    generateSymKey, generateRsaKey, encryptSymKey, decryptSymKey, encryptPassword, decryptPassword, checkGlobals
}