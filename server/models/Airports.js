const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    code : { //tipo ICE VCE BLN TRV
        type: String,
        required: true,
        unique: true,     
        uppercase: true,  
        minLength: 3,     
        maxLength: 3
    },

    name : { // nome nome completo 
        type: String,
        required: true  
    },

    city : {
        type: String,
        required: true
    },

    country : {
        type: String,
        required: true
    },
    
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Airport', airportSchema);