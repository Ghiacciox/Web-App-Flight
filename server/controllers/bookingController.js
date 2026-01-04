// controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');
const { seatReleaser } = require('./helperController');

exports.createBooking = async (req, res) => {
    let session = null;    
    try{
         if(req.auth.role !== 'passenger'){ 
            return res.status(400).json({ error: true, errormessage: "Solo i passeggeri possono creare prenotazioni" });
        }

        const {tick1, tick2} = req.body; // due oggetti biglietti opzionali o sono due o è uno

        if(tick1 == null){ //il primo è obbligatorio
            return res.status(400).json({ error: true, errormessage: "Non ci sono biglietti" });
        }
   
        let userId = req.auth.id;
        session = await mongoose.startSession();
        session.startTransaction();

        const flight1 = await Flight.findById(tick1.flightId)
            .populate({ path: 'route', populate: { path: 'arrivalAirport' } }) 
            .session(session);

        if(!flight1){
           throw new Error("Volo del primo biglietto non trovato");
        }   

        let flight2 = null;
        if(tick2){
            flight2 = await Flight.findById(tick2.flightId)
                .populate({ path: 'route', populate: { path: 'departureAirport' } })
                .session(session);
        }
       
        if(flight1 && flight2){
            const arr= flight1.route.arrivalAirport._id.toString();
            const dep= flight2.route.departureAirport._id.toString();
            if(arr !== dep){
                throw new Error("Gli aeroporti non combaciano tra i due voli");
            }
            if(flight1._id === flight2._id)
                throw new Error("I due voli non possono essere uguali");
            const arrival =flight1.arrivalTime.getTime();
            const restart = flight2.departureTime.getTime();
            const twoh = 2 * 60 * 60 * 1000; //2h
            
            if(arrival+twoh > restart){
                throw new Error("Intervallo tra voli insufficiente");   
            }
        }

        let firstTicket = await createTicketHelper(userId, tick1.flightId, tick1.seat, tick1.flightClass, tick1.extras, session);
        let secondTicket = null;
        if(tick2)
            secondTicket = await createTicketHelper(userId, tick2.flightId, tick2.seat, tick2.flightClass, tick2.extras, session);


        let booking = new Booking({
            user: userId,
            tickets: [firstTicket._id, secondTicket ? secondTicket._id : null].filter(t => t != null),
            totalPrice: ((firstTicket ? firstTicket.price : 0) + (secondTicket ? secondTicket.price : 0))
        });

        await booking.save({ session });
        await session.commitTransaction();
        session.endSession();


        return res.status(200).json({ error: false, errormessage: "" , message: "Prenotazione creata con successo", bookingId: booking._id});
    
    }catch{
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        res.status(400).json({ error: true, errormessage: "Errore creazione biglietto" });
    }
};

exports.getBooking = async (req, res) => {
    try {
       const { userId, bookingId, dateFrom, dateTo } = req.query;
        let filter = {};

        if (req.auth.role === 'passenger') {
            filter.user = req.auth.id;
            filter._id = bookingId;
        }

        else if (req.auth.role === 'admin') {
            if (userId) 
                filter.user = user;
            if (bookingId){
                filter._id = bookingId;
            }   
        }
        else if (req.auth.role === 'airline') {
            res.status(403).json({ error: true, errormessage: "una compagnia non può vedere i biglietti" });
        }

        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) {
                filter.date.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                filter.date.$lte = new Date(dateTo);
            }           
        }

        const getBooking = await Booking.find(filter)
            .populate({
                path: 'tickets',
                populate: {
                    path: 'flight',
                    select: 'flightNumber departureTime arrivalTime', // Seleziona solo info essenziali
                    populate: {
                        path: 'route',
                        populate: { path: 'departureAirport arrivalAirport' }
                    }
                }
            })
            .populate('user', 'name surname email');

        res.status(200).json(getBooking);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, errormessage: "Errore nel recupero biglietti booking" });
    }
};

exports.cancelBooking = async (req, res) => {

    let session = null;
    try {
        const { bookingId } = req.params;
        
        if(!bookingId){
           return res.status(400).json({ error: true, errormessage: "bookingId mancante" });
        }

        if(req.auth.role !== 'passenger' && req.auth.role != 'admin'){
            return res.status(403).json({ error: true, errormessage: "booking non tuo o permessi insufficienti per essere cancellato" });
        }

        session = await mongoose.startSession();
        session.startTransaction();     
        
        let myBooking = await Booking.findById(bookingId).session(session);
        if(!myBooking){
            throw new Error("Prenotazione non trovata");
        }

        if(myBooking.user.toString() !== req.auth.id && req.auth.role !== 'admin'){
           throw new Error("booking non tuo o permessi insufficienti per essere cancellato");
        }

        if (myBooking.status === 'cancelled') {
            throw new Error("Prenotazione già cancellata");
        }

        myBooking.status = 'cancelled';
        //libero i posti nel sediles
        await myBooking.populate('tickets');

        for(let seatTicket of myBooking.tickets){
            let flightID= seatTicket.flight;
            let deleting=await seatReleaser(flightID, seatTicket.seat, session)
            if(!deleting)
                throw new Error("Errore rilascio posto");
        }

        await myBooking.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ error: false, errormessage: "" , message: "Prenotazione cancellata con successo"});  
    } catch (err) {
        if(session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.log(err);
        res.status(500).json({ error: true, errormessage: "Errore nella cancellazione della prenotazione" });
    }
};