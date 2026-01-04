const mongoose = require('mongoose');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: String,
    enum: ['admin', 'passenger', 'airline'],
    default: 'passenger',
    required: true
  },

  //dati passeggero
  name : {
    type: String,
    required: function (){
        return this.role === 'passenger';
    }
  },
  
  surname : {
    type: String,
    required: function (){
        return this.role === 'passenger';
    }
  },

  birthdate : {
    type: Date,
    required: function (){
        return this.role === 'passenger';
    }
  },

  phonenumber : {
    type: String,
    required: function (){
        return this.role === 'passenger';
    }
  },

  paymentAddress : {
    type: String,
    required: function (){
        return this.role === 'passenger';
    }
  },

  company : {
    type: String,
    unique: true,
    sparse: true, // permette valori nulli multipli
    required: function (){
        return this.role === 'airline';
    }
  },

  dateofcreation: {
    type: Date,
    default: Date.now
  },

  salt: {
    type: String,
    required: false
  },

  digest: {
    type: String,
    required: false
  } 

});


// passo la password in chiaro
userSchema.methods.setPassword = function (password) {
  //genero una stringa casuale di 16 byte in esadecimale
  //così l'ash è unico anche per password uguali
   this.salt = crypto.randomBytes(16).toString('hex');

   //creo l'hmac algoritmo di criptazione con sha512 che necessita di una chiave
   //in questo caso la chiave è il salt
   //l'hmac è una funzione di hash con chiave segreta
   const hmac = crypto.createHmac('sha512', this.salt);

   //cripto la password con l'hmac
   hmac.update(password);

   //metto password criptata nel digest
   this.digest = hmac.digest('hex'); 
};

userSchema.methods.validatePassword = function (password) {
  //creo hmac con il salt salvato
   const hmac = crypto.createHmac('sha512', this.salt);
   
   //cripto la password con l'hmac
   hmac.update(password);
  
   //prendo la password criptata
   const digest = hmac.digest('hex');
  //controll ose è uguale alla cripata nel db
   return (this.digest === digest); 
}

const User = mongoose.model('User', userSchema);

module.exports = User;