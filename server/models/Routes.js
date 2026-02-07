const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({

    airlineId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
   
    departureAirport : {
        type: mongoose.Schema.Types.ObjectId, 
        //in sostanza un riferimento ad un oggetto di un altra collezione ma l'oggetto intero
        ref: 'Airport',
        required: true
    },

    arrivalAirport : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airport',
        required: true
    },

    active: {
        type: Boolean,
        default: true
    }

});

routeSchema.index( //no salvataggio di rotte duplicate
    { airlineId: 1,departureAirport: 1, arrivalAirport: 1 }, 
    { unique: true }
);

routeSchema.pre('save', function(next) {
    if (this.departureAirport.equals(this.arrivalAirport)) {
        return next(new Error('gli aereoposrti di partenza e arrivo sono uguali'));
    }
    next()
});

module.exports = mongoose.model('Route', routeSchema);