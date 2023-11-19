const express = require('express'); 
const path = require('path') 
const encryptions = require('./encryption') 
  
const app = express(); 
  
app.use(express.json()) 
app.use(express.urlencoded({extended: true})) 
  
app.use('/', express.static(path.join(__dirname, 
                    'public_static'))) 

app.get('/gen', (req, res) => {
    a = encryptions.generateSymKey().then(function(result){
        console.log(result);
    });
    b = encryptions.generateRsaKey().then(function(result){
        console.log(result);
    });
    res.send("symkey and rsakey generated")
}) 

iv = null
ciphertext = null
app.get('/enc', (req, res) => {
    a = encryptions.encryptPassword("password").then(function(result){
        console.log(result);
        iv = result.iv
        ciphertext = result.ciphertext
    });
    res.send("encryption complete")
})

app.get('/dec', (req, res) => {
    // encryptions.encryptPassword("this is not the right password!").then(function(result){
    //     a = encryptions.decryptPassword(result.ciphertext, result.iv).then(function(r){
    //         console.log(r);
    //     });
    // });
    a = encryptions.decryptPassword(ciphertext, iv).then(function(r){
        console.log(r);
        res.send("Decrypted password: " + r)
    });
})

app.get('/keys', (req, res) => {
    a = encryptions.encryptSymKey("self", "self").then(function(result){
        console.log(result);
        encryptions.decryptSymKey(result.ciphertext).then(function(r){
            console.log(r);
            res.send("Decrypted key: " + r)
        });
    });
})

app.get('/g', () => {console.log(encryptions.checkGlobals())})
  
app.listen(2222, () => console.log( 
    'Server started on http://localhost:2222')) 