const Route = require('../models/Routes');
const Airport = require('../models/Airports');
const Flight = require('../models/Flight'); 
const Ticket = require('../models/Ticket');
const User = require('../models/Users'); 



const resolveAirportId = async (searchString) => {
    if (!searchString) return null;
    // Cerca per Codice (LIN)
    let airport = await Airport.findOne({ code: searchString.toUpperCase() });

    //cerca per Nome (Linate)
    if (!airport) {
        airport = await Airport.findOne({ name: { $regex: searchString, $options: 'i' } });
    }
    //cerca per Città (Milano)
    if (!airport) {
        airport = await Airport.findOne({ city: { $regex: searchString, $options: 'i' } });
    }
    
    return airport ? airport._id : null;
    //ritorna id o null
};


// Helper per trovare rotte in base a codici aeroporti E NOMI
const findRoutesHelper = async (from, to) => {
    try{
         let filter = {};   
         if(from !=null && from !== undefined) {
            let departureAirport= await resolveAirportId(from);
            if(!departureAirport){
                 return [];
            }
            filter.departureAirport = departureAirport;
        }

         if(to !=null && to !== undefined) {
            let arrivalAirport= await resolveAirportId(to);  
            if(!arrivalAirport){
                 return [];
            }   
            filter.arrivalAirport = arrivalAirport;
        }
        const routes = await Route.find(filter)
            .populate('departureAirport')
            .populate('arrivalAirport');
            return routes;
    }catch (err) {
        console.log("Errore helper:", err);
        return [];
    }
};


// Helper per trovare voli in base a vari parametri
const findDirectFlightsHelper = async (flightNumber, from, to, initialDate , finalDate , company) => {
    try {
        let filter = {};
        //preparo un oggetto di filtro per la query
        if(flightNumber){
           filter.flightNumber = { $regex: flightNumber, $options: 'i' };
        }

        if (company) {
            const airlineUser = await User.findOne({ role: 'airline', company: company });
            console.log(`Ricerca compagnia "${company}":`, airlineUser);
            if (airlineUser) 
                filter.company = airlineUser._id;
            else return [];
        }
        
        if (from || to) {
            const routesList = await findRoutesHelper(from, to);
            if (routesList.length === 0) 
                return [];
            filter.route = { $in: routesList.map(r => r._id) };
        }

        if(initialDate && finalDate){
            filter.departureTime = { 
                $gte: new Date(initialDate), //da 
                $lte: new Date(finalDate) }; //a
        }else if(initialDate && !finalDate){
            filter.departureTime = { 
                $gte: new Date(initialDate) }; //da 
        }else if(finalDate && !initialDate){
            filter.departureTime = { 
                $lte: new Date(finalDate) }; //a
        }

    
        const filtered = await Flight.find(filter)
            .populate('airplane')
            .populate({
                path: 'company',
                select: 'company email role' 
            })
            .populate({
                path: 'route',
                populate: { path: 'departureAirport arrivalAirport' }
                 // Popola anche gli aeroporti dentro la rotta
            });

        const result = [];
        for (let flight of filtered) {
            result.push({
                type: 'direct', 
                flights: [flight] 
            });
        }
        
        return result;

    }catch (err) {
        console.log("Errore helper:", err);
        return [];
    }
}



// Helper per trovare voli in base a vari parametri
//devo trovare i voli con scalo
const findScaleFlightsHelper = async ( from, to, initialDate , finalDate , company) => {
    try {
        let filter = {};
        //preparo un oggetto di filtro per la query

       if (company) {
            const airlineUser = await User.findOne({ role: 'airline', company: company });
            console.log(`Ricerca compagnia "${company}":`, airlineUser);
            if (airlineUser) filter.company = airlineUser._id;
            else return [];
        }

        const fromId = await resolveAirportId(from);
        const toId = await resolveAirportId(to);
        if (!fromId || !toId) 
            return [];

        const originRoute = await Route.find({ departureAirport: fromId });
        if (originRoute.length === 0)
             return [];
        
        filter.route = { $in: originRoute.map(r => r._id) };

        if(initialDate && finalDate){
            filter.departureTime = { 
                $gte: new Date(initialDate), //da 
                $lte: new Date(finalDate) }; //a
        }else if(initialDate && !finalDate){
            filter.departureTime = { 
                $gte: new Date(initialDate) }; //da 
        }else if(finalDate && !initialDate){
            filter.departureTime = { 
                $lte: new Date(finalDate) }; //a
        }

        const result_from = await Flight.find(filter)
            .populate('airplane')
            .populate({
                path: 'route',
                populate: { path: 'departureAirport arrivalAirport' }
                 // Popola anche gli aeroporti dentro la rotta
            });
        
        
        const result_to = [];
        for(let r of result_from){
            let secondFilter = {};
            // Correzione: usa secondFilter invece di filter per la compagnia
            
            if (filter.company) secondFilter.company = filter.company;
                    
            // Correzione: usa gli ObjectId invece delle stringhe
            const secondRoute = await Route.find({

                departureAirport: r.route.arrivalAirport._id,
                arrivalAirport: toId
            });
            
            if(secondRoute.length==0)
                continue;   
            // se non trovo nulla continuo 

            secondFilter.route = { $in: secondRoute.map(u => u._id) };
            //sempre discosrso di array
           
            secondFilter.departureTime = { 
                $gte: new Date(r.arrivalTime.getTime() + 2 * 60 * 60 * 1000) 
            }; //almeno 2 ore di scalo


            //metto anche data di ritorno
            const scalo = await Flight.find(secondFilter)
                .populate('airplane')
                .populate({
                    path: 'route',
                    populate: { path: 'departureAirport arrivalAirport' }
                    // Popola anche gli aeroporti dentro la rotta
            });

            if(scalo.length>0){
                for(let s of scalo){
                    result_to.push({
                        type: 'stopover', // Utile per il frontend
                        flights: [r, s]   // Metto i due oggetti volo in un array pulito
                    });
            }
        }
    }
    return result_to;
    }catch (err) {
        console.log("Errore helper:", err);
        return [];
    }
}


const findFlightsHelper = async (flightNumber, from, to, initialDate , finalDate , company) => {
    const directFlights = await findDirectFlightsHelper(flightNumber, from, to, initialDate , finalDate , company);
    const scaleFlights = await findScaleFlightsHelper(from, to, initialDate , finalDate , company); 
    return [...directFlights, ...scaleFlights];    
}


const seatReleaser = async (flightID, seat, flightClass) => {
    try {
        const selectedSeat ={
            seat: seat,
            travelClass: flightClass
        };
        await Flight.updateOne(     
            { _id: flightID },
            { 
                $pull: { 
                    bookedSeats: selectedSeat 
                } 
        }
        );
        console.log("posto rilasciato con successo :", seat, flightClass, "nel volo", flightID);
        return true;
    }catch (err) {
        console.log("Errore helper validazione posti:", err);
        return false;
    }
};

//creazione biglietto
const createTicketHelper = async (userId, flightId, seat, flightClass, extras, price) => {

    const selectedSeat ={
        seat: seat,
        travelClass: flightClass
    };

    const flight = await Flight.findOneAndUpdate(
       { 
            _id: flightId, 
            bookedSeats: { 
                $not: {  
                    //non deve esserci un sedile uguale
                    $elemMatch: selectedSeat
                }
            }
        },
        { 
            //se non c'è pusho
            $push: { 
                bookedSeats: selectedSeat
            } 
        },
        { new: true } // Restituisce il volo aggiornato
    ).populate('airplane');

    if(!flight){
        throw new Error("Volo non trovato/ posto uoccupato");
    }
    
    let newTicket = new Ticket({
        flight: flightId,
        user: userId,
        seat: seat,
        class: flightClass,
        extras: extras || {},
        price: price
    });  

    await newTicket.save();
    return newTicket
}


const flightDeleterHelper = async (flightId, auth) => {
    try {
        const flight = await Flight.findById(flightId);
        if (!flight) return { error: true, message: "Volo non trovato" }    ;

        // Controllo proprietà: L'utente loggato è il proprietario del volo?
        if (auth.role !== 'admin' && flight.company.toString() !== auth.id.toString()) {
            return { error: true, message: "Non puoi cancellare voli di altri" };
        }

        const tickets = await Ticket.find({ flight: flight._id }).select('_id'); 
    

        const ticketIds = tickets.map(t => t._id);
        if (tickets.length > 0) {
            await Booking.updateMany(
                { tickets: { $in: ticketIds } }, 
                { status: 'cancelled' }
            );
        }

        console.log(`Cancellati ${tickets.length} biglietti associati al volo ${flightId}`);
        await Flight.findByIdAndUpdate(flightId, { active: false }, { new: true });
        console.log(`Volo ${flightId} cancellato (active: false)`);

        return { message: "Volo cancellato", flight: flight };
    } catch (err) {
        return { error: true, message: err.message };
    }
};

const deleteTicketHelper = async (ticketID, auth) => {
    try {
        const ticketToDelete = await Ticket.findById(ticketID);
        if (!ticketToDelete) throw new Error("Biglietto non trovato");

        // Controllo permessi
        if (auth.role !== 'admin' && ticketToDelete.user.toString() !== auth.id.toString()) {
            throw new Error("Non hai i permessi per cancellare questo biglietto");
        }

        // Rilasciamo il posto sul volo usando lo seatReleaser che hai già
        // seatReleaser si occupa di cercare il volo e fare il $pull del posto
        const released = await seatReleaser(
            ticketToDelete.flight, 
            ticketToDelete.seat, 
            ticketToDelete.class
        );

        if (!released) throw new Error("Errore durante il rilascio del posto sul volo");

        // Eliminiamo il biglietto
        await Ticket.findByIdAndDelete(ticketID);

        return { success: true, message: "Biglietto cancellato" };
    } catch (err) {
        throw err; // Lanciamo l'errore per gestirlo nel chiamante
    }
};


module.exports = {
    findRoutesHelper,
    findFlightsHelper,
    findDirectFlightsHelper,
    findScaleFlightsHelper,
    createTicketHelper, 
    seatReleaser,
    flightDeleterHelper,
    deleteTicketHelper
};