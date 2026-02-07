const mongoose = require('mongoose');
    
const seats = new mongoose.Schema({
    rows: { type: Number, default: 0 },
    seatsPerRow: { type: Number, default: 0 },
    
    seatLetters: { 
        type: String, 
        uppercase: true, 
        trim: true,
        match: /^[A-Z]+$/,
        default: "" ,
        validate : {
            validator: function(v) { 
                // se passo una stringa con dei duplicati esplode
                if (!v) return true;
                return new Set(v).size === v.length;
            },
            message: props => `Lettere dei posti duplicate nella sezione: ${props.value}`
        }    
    },

    numberOfSeats: { type: Number }

    //tipo A17
});

const airplaneSchema = new mongoose.Schema({

    airplaneModel : {
        type: String,
        required: true,
        unique: true
    },

    capacity : {
        economy : seats,
        business : seats,
        firstclass : seats
    },

    totalSeats: {
        type: Number,
        default: 0
    },

    active: {
        type: Boolean,
        default: true
    }

});


//controllo  posti e controllo dei dati inseriti
airplaneSchema.pre('save', function(next) {

    const totalSeatsPerClass = (seats) => {

        if (!seats || seats.rows === 0) {
            seats.numberOfSeats = 0;
            return 0;
        }

        if(seats.seatsPerRow != seats.seatLetters.length){
            throw new Error(`Errore Configurazione Aereo: Nella sezione ci sono
                ${seats.seatsPerRow} posti dichiarati ma le lettere sono 
                "${seats.seatLetters}"`);
        }else{
            return seats.numberOfSeats = seats.rows * seats.seatLetters.length;
        }
    };
    let total =0;

    try{
        total += totalSeatsPerClass(this.capacity.economy, 'Economy');
        total += totalSeatsPerClass(this.capacity.business, 'Business');
        total += totalSeatsPerClass(this.capacity.firstclass, 'First Class');
    }catch(err){
        return next(err);
    }
    this.totalSeats = total;
    next(); 
});


module.exports = mongoose.model('Airplane', airplaneSchema);