const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    tickets: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ticket',
        required: true
    }],

    totalPrice: { 
        type: Number, 
        required: true 
    },
    
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'used'],
        default: 'confirmed'
    },

    bookingDate: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Booking', bookingSchema);