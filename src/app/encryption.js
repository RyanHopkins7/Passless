const { subtle } = globalThis.crypto;
const crypto = globalThis.crypto;

function updateKey(idx, jwk){
  localStorage.setItem(idx, JSON.stringify(jwk))
  return
}

var symkey = null
var pubkey = null
var privkey = null

async function generateSymKey(length = 256) {
    // Generate the AES key with GCM for message integrity
    const aeskey = await subtle.generateKey({
      name: 'AES-GCM',
      length,
    }, true, ['encrypt', 'decrypt']);
    // Store generated key into database
    symkey = aeskey
    return {symkey}
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
    pubkey = publicKey
    privkey = privateKey
    return {
            pubkey,
            privkey
        };
  } 


async function encryptSymKey(key, publkey){
    const ec = new TextEncoder();
    // Assumes that the key is passed in extracted form (jwk)
    if (pubkey == null){
      return 0
    }
    if (publkey == "self"){
        publkey = pubkey
    }
    if (key == "self"){
      key = symkey
      
    }

    const enckey = ec.encode(new Uint8Array(key));
    const ciphertext = await crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        publkey,
        enckey,
      );
    return ciphertext
}

async function decryptSymKey(buffer){
    const dc = new TextDecoder("utf-8");
    if (privkey == null){
      return 0
    }
    const decsymkey = await subtle.decrypt(
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        privkey,
        buffer,
    );
    const b = dc.decode((new Uint8Array(decsymkey)).buffer);
    var array = JSON.parse("[" + b + "]");
    var maybe = new Uint8Array(array)
    var length = maybe.length;
    var buffer = new ArrayBuffer( 32 );
    var view = new Uint8Array(buffer);
    for ( var i = 0; i < length; i++) {
        view[i] = maybe[i];
    }
    var done = await subtle.importKey("raw", buffer, "AES-GCM", true, ["encrypt", "decrypt",]);
    symkey = done
    return done;
}

async function encryptPassword(password) {
    const ec = new TextEncoder();
    var key = symkey;
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const ciphertext = await window.crypto.subtle.encrypt({
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
    var key = symkey;
    const password = await window.crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv,
    }, key, ciphertext);
    const decoded = dec.decode(password)
    return {decoded}
}

exports = module.exports = {
    generateSymKey, generateRsaKey, encryptSymKey, decryptSymKey, encryptPassword, decryptPassword
}
