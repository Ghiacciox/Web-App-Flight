const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({

   flightNumber: { 
        //numero volo ripetibile anche in giorni diversi
        type: String,
        required: true,
    },

    company : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    prices : {
        economy : {
            type: Number,
            required: true,
            min: 0
        },

        business : {
            type: Number,
            required: true,
            min: 0
        },

        firstclass : {
            type: Number,
            required: true,
            min: 0
        },

        extras: {
            baggage: {
                 type: Number, 
                 default: 30,
                 min: 0
            },
            legroom: { 
                type: Number, 
                default: 15,
                min: 0
            },
            priorityBoarding: { 
                type: Number,
                default: 10,
                min: 0
            }
        }
    },

    departureTime : {
        type: Date,
        required: true
    },

    arrivalTime : {
        type: Date,
        required: true
    },

    airplane :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airplane',
        required: true
    },
    
    route :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },

   // MODIFICA QUI SOTTO
    bookedSeats : {
        type: [{
            seat: { 
                type: String, 
                required: true 
            },
            travelClass: { 
                type: String, 
                required: true,
                enum: ['economy', 'business', 'firstclass'] 
            },
            _id: false // mongoose no id
        }],
        required: true,
        default: [],
        validate : { 
            validator: function(v) { 
                const seatNumbers = v.map(item => `${item.seat}-${item.travelClass}`);
                //array di stringhe univoche 1A-economy 1A-business
                let set = new Set(seatNumbers);
                //set non ammette duplicati
                return set.size === seatNumbers.length;
            },
            error : 'posti duplicati nel volo'
        }
    },

});

flightSchema.pre('save', function(next) {
    //controllo che l'orario di arrivo sia successivo a quello di partenza
    if(this.arrivalTime <= this.departureTime){
        throw new Error(`errore oraio di partenza precedente o uguale a quello di arrivo`);
    }
    next();
});

module.exports = mongoose.model('Flight', flightSchema);