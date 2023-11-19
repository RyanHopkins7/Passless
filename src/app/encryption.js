const { subtle } = globalThis.crypto;
const crypto = globalThis.crypto;

function updateKey(idx, jwk){
  localStorage.setItem(idx, JSON.stringify(jwk))
  return
}

function getKey(idx){
  var jwk = localStorage.getItem(idx);
  jwk = JSON.parse(jwk)
  if (idx == 1){
    crypto.subtle.importKey(
      "jwk", //can be "jwk" or "raw"
      {   //this is an example jwk key, "raw" would be an ArrayBuffer
          kty: "oct",
          k: jwk.k,
          alg: "A256GCM",
          ext: true,
      },
      {   //this is the algorithm options
          name: "AES-GCM",
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    )
    .then(function(key){
        //returns the symmetric key
        return(key);
    })
    .catch(function(err){
        console.error(err);
    });
  }
  if (idx == 2){
    window.crypto.subtle.importKey(
      "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      jwk,
      {   //these are the algorithm options
          name: "RSA-OAEP",
          hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["encrypt"] //"encrypt" or "wrapKey" for public key import or
                  //"decrypt" or "unwrapKey" for private key imports
  )
  .then(function(publicKey){
      //returns a publicKey (or privateKey if you are importing a private key)
      return(publicKey);
  })
  .catch(function(err){
      console.error(err);
  });
  }
  if (idx == 3){
    window.crypto.subtle.importKey(
      "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
      jwk,
      {   //these are the algorithm options
          name: "RSA-OAEP",
          hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      true, //whether the key is extractable (i.e. can be used in exportKey)
      ["decrypt"] //"encrypt" or "wrapKey" for public key import or
                  //"decrypt" or "unwrapKey" for private key imports
  )
  .then(function(publicKey){
      //returns a publicKey (or privateKey if you are importing a private key)
      return(publicKey);
  })
  .catch(function(err){
      console.error(err);
  });
  }
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
    const sym = await crypto.subtle.exportKey("jwk", aeskey)
    updateKey(1, sym)
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
    const pu = await crypto.subtle.exportKey("jwk", publicKey)
    const pr = await crypto.subtle.exportKey("jwk", privateKey)
    updateKey(2, pu)
    updateKey(2, pr)
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
    if (publkey == "self"){
        publkey = getKey(2)
    }
    if (key == "self"){
      key = getKey(1)
      
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
    const sym = await crypto.subtle.exportKey("jwk", done)
    updateKey(1, sym)
    return done;
}

async function encryptPassword(password) {
    const ec = new TextEncoder();
    var key = getKey(1);
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
    var key = getKey(1);
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
