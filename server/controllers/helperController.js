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


// Helper per trovare rotte in base a codici aeroporti
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
            const airlineUser = await User.findOne({ role: 'airline', company: { $regex: company, $options: 'i' } });
            if (airlineUser) filter.company = airlineUser._id;
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
            const airlineUser = await User.findOne({ role: 'airline', company: { $regex: company, $options: 'i' } });
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

//SEAt VALIDATORRR
const seatValidator = async (airplane, seat, flightClass) => {
    try {
        const classConfig = airplane.capacity[flightClass];
        if(!classConfig || classConfig.rows<=0 || classConfig.seatLetters.length==0){
            console.log("falso classe non esistente");
            return false;
        }

        const formatoValido = seat.match(/^(\d+)([A-Z]+)$/);
        if(!formatoValido){
            console.log("formato posto non valido");
            return false;
        }

        if(classConfig.rows < parseInt(formatoValido[1])){
            console.log("falso posto fuori capienza");
            return false;
        }   
        
        if(!classConfig.seatLetters.includes(formatoValido[2])){
            console.log("falso stai posto occupato");
            return false;
        }

        const isAlreadyBooked = airplane.bookedSeats.some(booking => 
            booking.seat === seat && booking.travelClass === flightClass
        );

        if (isAlreadyBooked) {
            throw new Error("Posto già occupato");
        }
        //non salvo qua per la race condition
        return true;
        
    }catch (err) {
        console.log("Errore helper validazione posti:", err);
        return false;
    }
};

//SEAt VALIDATORRR
const seatReleaser = async (airplane, seat, flightClass, session) => {
    try {
        let flightSeatToDelete= await Flight.findById(airplane).session(session);
        if(!flightSeatToDelete){
            throw new Error("Volo non trovato"); 
        }
        flightSeatToDelete.bookedSeats.pull({ seat: seat, travelClass: flightClass });
        await flightSeatToDelete.save({ session });
        return true;
    }catch (err) {
        console.log("Errore helper validazione posti:", err);
        return false;
    }
};

//creazione biglietto
const createTicketHelper = async (userId, flightId, seat, flightClass, extras, session) => {

    //le operazioni salvate con session sono tutte assime 
    // nel senso che ne va una o non ne va nessuna
    if(session) 
        session.startTransaction();

    let flight = await Flight.findById(flightId)
        .populate('airplane')
        .session(session);

    if(!flight){
        throw new Error("Volo non trovato");
    }

    if(!await seatValidator(flight.airplane, seat, flightClass)){
        throw new Error("Posto non valido o già occupato");
    }

    flight.bookedSeats.push({ 
        seat: seat, 
        travelClass: flightClass 
    });

    await flight.save({ session });

    let newTicket = new Ticket({
        flight: flightId,
        user: userId,
        seat: seat,
        class: flightClass,
        extras: extras || {}
    });  

    await newTicket.save({ session });
    return newTicket
}
    

module.exports = {
    findRoutesHelper,
    findFlightsHelper,
    findDirectFlightsHelper,
    findScaleFlightsHelper,
    seatValidator,
    createTicketHelper, 
    seatReleaser
};