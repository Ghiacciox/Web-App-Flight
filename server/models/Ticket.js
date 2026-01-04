const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({

    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    flight :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },

    seat :{ 
        type: String,
        uppercase: true,
        required: true,
    },

    class : { 
        type: String,
        enum: ['economy', 'business', 'firstclass'],
        required: true
    },

    extras: {
        baggage: {
            type: Boolean, 
            default: false,
        },
        legroom: { 
            type: Boolean, 
            default: false 
        },
        priorityBoarding: { 
            type: Boolean,
            default: false  
        }
    },
    
    price: { 
        type: Number, 
        required: true,
        min : 0
    }

});


ticketSchema.pre('save', async function(next) {
    // pre signica prima di salvare 
    // alla funzione passo next che mi dice che posso andare avanti
    let total=0;

    const Flight = mongoose.model('Flight');
    const flightDoc = await Flight.findById(this.flight);
    if (!flightDoc) {
            throw new Error('Volo non trovato, impossibile calcolare il prezzo del biglietto');
    }


    total += flightDoc.prices[this.class]; //mi estrapolo il prezzo base in base alla classe
    total += this.extras.baggage ? flightDoc.prices.extras.baggage : 0; //se true aggiungo il prezzo altriementi 0
    total += this.extras.legroom ? flightDoc.prices.extras.legroom : 0;
    total += this.extras.priorityBoarding ? flightDoc.prices.extras.priorityBoarding : 0;
    this.price = total;

    next();
});


module.exports = mongoose.model('Ticket', ticketSchema);