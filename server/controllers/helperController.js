const Route = require('../models/Routes');
const Airport = require('../models/Airports');
const Flight = require('../models/Flight'); 
const Ticket = require('../models/Ticket');

// Helper per trovare rotte in base a codici aeroporti
const findRoutesHelper = async (from, to) => {
    try{
         let filter = {};   
         if(from !=null && from !== undefined) {
            const departureAirport= await Airport.findOne({ code: from.toUpperCase() });
            if(!departureAirport){
                 return [];
            }
            filter.departureAirport = departureAirport._id;
        }

         if(to !=null && to !== undefined) {
            const arrivalAirport= await Airport.findOne({ code: to.toUpperCase() });
            if(!arrivalAirport){
                 return [];
            }
            filter.arrivalAirport = arrivalAirport._id;
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

const findFlightsHelper = async (flightNumber, route, initialDate , finalDate , company) => {
    try {
        let filter = {};
        //preparo un oggetto di filtro per la query
        if(flightNumber){
           filter.flightNumber = { $regex: flightNumber, $options: 'i' };
        }
        if(company){
            filter.company = { $regex: company, $options: 'i' };
        }

        if(route){
            filter.route = route;
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

    
        const result = await Flight.find(filter)
            .populate('airplane')
            .populate({
                path: 'route',
                populate: { path: 'departureAirport arrivalAirport' }
                 // Popola anche gli aeroporti dentro la rotta
            });

        return result;

    }catch (err) {
        console.log("Errore helper:", err);
        return [];}
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
        //non salvo qua per la race condition
        return true;
        
    }catch (err) {
        console.log("Errore helper validazione posti:", err);
        return false;
    }
};

//SEAt VALIDATORRR
const seatReleaser = async (airplane, seat, session) => {
    try {
        let flightSeatToDelete= await Flight.findById(airplane).session(session);
        if(!flightSeatToDelete){
            throw new Error("Volo non trovato"); 
        }
        flightSeatToDelete.bookedSeats.pull(seat);
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

    flight.bookedSeats.push(seat);
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
    seatValidator,
    createTicketHelper, 
    seatReleaser
};
