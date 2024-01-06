const { subtle } = window.crypto;
const crypto = window.crypto;

let db;
init();
var idb = window.indexedDB;

async function init(){
    
    db = await idb.openDb('keyDB', 1, db => {
        db.createObjectStore('keyStore', {keyPath: 'id'});
      });
    tx = db.transaction('keyDB', 'readwrite');
    try {
        const a = {
            id: 1,
            keys: null
        };
        const b = {
            id: 1,
            keys: null
        };
        const c = {
            id: 1,
            keys: null,
        };
        await tx.objectStore('keyDB').add(a);
        await tx.objectStore('keyDB').add(b);
        await tx.objectStore('keyDB').add(c);
      } 
    catch(err) {
        throw err;
      }
}

async function updateKey(idx, key){
    tx = db.transaction('keyDB', 'readwrite');
    store = tx.objectStore('keyDB');
    k = {
        id : idx,
        keys : key,
    };
    await store.put(k);
    return;
}

async function getKey(idx){
    tx = db.transaction('keyDB', 'readonly');
    store = tx.objectStore('keyDB');
    var a = await store.put(idx);
    return a;
}

async function generateSymKey(length = 256) {
    // Generate the AES key with GCM for message integrity
    const aeskey = await subtle.generateKey({
      name: 'AES-GCM',
      length,
    }, true, ['encrypt', 'decrypt']);
    a = await subtle.exportKey('jwk', aeskey);
    // Store generated key into database
    await updateKey(1, aeskey).then(function(){
        return {
            a,
            aeskey,
        };
    })
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
    await updateKey(2, publicKey).then(function(){
    })
    await updateKey(3, privateKey).then(function(){
        return {
            publicKey,
            privateKey
        };
    })
  } 


async function encryptSymKey(key, pubkey){
    const ec = new TextEncoder();
    // Assumes that the key is passed in extracted form (jwk)
    
    if (pubkey == "self"){
        var rsapubkey = await getKey(2);
        pubkey = rsapubkey
    }
    if (key == "self"){
        var symkey = await getKey(1);
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
    return ciphertext
}

async function decryptSymKey(buffer){
    var rsaprivkey = getKey(3);
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
    var done = await crypto.subtle.importKey("raw", buffer, "AES-GCM", true, ["encrypt", "decrypt",]);
    await updateKey(1, done).then(function(){
        return;
    })
}

async function encryptPassword(password) {
    const ec = new TextEncoder();
    var symkey = await getKey(1);

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
    var symkey = await getKey(1);
    const key = symkey;
    const password = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv,
    }, key, ciphertext);
    return dec.decode(password);
}

exports = module.exports = {
    generateSymKey, generateRsaKey, encryptSymKey, decryptSymKey, encryptPassword, decryptPassword,
}