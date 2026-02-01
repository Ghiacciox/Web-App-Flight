const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');
const { seatReleaser, createTicketHelper } = require('./helperController');

exports.getTickets = async (req, res) => {
    try {
        const { user, flightNumber } = req.query;
        let filter = {};

        if (req.auth.role === 'passenger') {
            filter.user = req.auth.id;
        }

        else if (req.auth.role === 'admin') {
            if (user) 
                filter.user = user;
            if (flightNumber){
                const flightDoc = await Flight.find({flightNumber : flightNumber}).select('_id');
                filter.flight ={ $in: flightDoc.map(i => i._id) };
            }   
        }

        else if (req.auth.role === 'airline') {

            const flightSuppFilter = {};
            // se ho un numero di volo cerco quelli
            if (flightNumber)
                flightSuppFilter.flightNumber = flightNumber;
            //cerco i biglietti per i voli di quella compagnia aerea loggata
            flightSuppFilter.company = req.auth.id;

            //cerco id voli della compagnia aerea loggata con quel flightNumber
            const flightDoc = await Flight.find(flightSuppFilter).select('_id');
            
            if(!flightDoc)   
                return res.status(403).json({ error: true, errormessage: "Non puoi vedere i biglietti di altre compagnie" });
            //se non ne trovo erroere

            if (flightDoc.length === 0 || flightDoc.length === 0) {
                return res.status(200).json([]); 
            }

            //metto nel filtro i biglietti che ho trovato
            filter.flight ={ $in: flightDoc.map(i => i._id) };
    }

        const tickets = await Ticket.find(filter)
            .populate({
                path: 'flight',
                select: 'flightNumber departureTime', 
                populate: {
                    path: 'route',
                    populate: { path: 'departureAirport arrivalAirport' }
                }
            })
            .populate('user', 'name surname email');

        res.status(200).json(tickets);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, errormessage: "Errore nel recupero biglietti" });
    }
};

// POST: Crea biglietto (Solo passeggero)
exports.createTicket = async (req, res) => {
    let session = null;
    try {  
        if( req.auth.role !== 'passenger'){ 
            return res.status(400).json({ error: true, errormessage: "Solo i passeggeri possono acquistare i biglietti" });
        }
        const { flightId, seat, flightClass, extras, price } = req.body;

        if(!flightId || !seat || !flightClass){
            return res.status(400).json({ error: true, errormessage: "Mancano dati obbligatori per la creazione del biglietto" });
        }
        let userId = req.auth.id;
        let newTicket = await createTicketHelper(userId, flightId, seat, flightClass, extras, price);

        return res.status(200).json({ error: false, errormessage: "" , message: "Biglietto creato con successo", ticketId: newTicket._id});
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: true, errormessage: "Errore creazione biglietto" });
    }
};

// DELETE: cancella biglieto (Solo Admin o passeggero proprietario)
exports.deleteTicket= async (req, res) => {
   let session = null;
    try{
        const { ticketID } = req.params;

        if(!ticketID){
           throw new Error("Manca l'id del biglietto da cancellare");
        }

        let userId = req.auth.id;
        if(req.auth.role !== 'passenger' && req.auth.role != 'admin'){
            throw new Error("Non hai i permessi per cancellare il biglietto");
        }
    
        let ticketToDelete = await Ticket.findById(ticketID);
        let flightSeatToDelete = await Flight.findById(ticketToDelete.flight);

        if(!ticketToDelete){
            throw new Error("Biglietto non trovato");
        }

        if(req.auth.role !== 'admin' && ticketToDelete.user.toString() !== userId){
            throw new Error("non puoi cancellare i biglietti di ialtri se non sei admin");
        }

        if(!flightSeatToDelete){
            throw new Error("Volo non trovato, impossibile cancellare il biglietto");
        }

        if(!flightSeatToDelete.bookedSeats.includes(ticketToDelete.seat)){
            throw new Error("Posto non valido o già occupato");
        }

        //flightSeatToDelete.bookedSeats.pull({ seat: ticketToDelete.seat, travelClass: ticketToDelete.flightClass }); //cancello posto
        await seatReleaser(flightSeatToDelete.flight, ticketToDelete.seat, ticketToDelete.flightClass);
        await Ticket.findByIdAndDelete(ticketID); 

        return res.status(200).json({ message: "Biglietto cancellato con successo!"});
    }catch(err){
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }   
        console.log(err);
        res.status(500).json({ error: true, errormessage: "Errore nella cancellazione del biglietto" });
    }
};