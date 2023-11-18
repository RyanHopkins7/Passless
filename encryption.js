const { subtle } = globalThis.crypto;

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
        aeskey
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

const crypto = globalThis.crypto;

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
    const password = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv,
    }, symkey, ciphertext);
    return dec.decode(password);
}



exports = module.exports = {
    generateSymKey, generateRsaKey, encryptPassword, decryptPassword
}