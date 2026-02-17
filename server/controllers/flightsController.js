const Airplanes = require('../models/Airplanes');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const helper = require('./helperController'); 
const User = require('../models/Users');

// GET: Lista di tutti gli aerei (Pubblico)
exports.getFlights = async (req, res) => {
    try {
        const { flightNumber, from, to, initialDate , finalDate , company} = req.query; 
        const result = await helper.findFlightsHelper(flightNumber, from, to, initialDate , finalDate , company);
        console.log("Risultato ricerca voli debugg:", result);
        return res.status(200).json({ message: "risultato ricerca voli!", result});
    }catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore recupero voli" });
    }
};

exports.createFlights = async (req, res) => {
    // Verifica ruolo Admin (assumendo che req.auth sia popolato dal middleware JWT)
    try {
        if (req.auth.role !== 'admin' && req.auth.role !== 'airline') {
            return res.status(400).json({ error: true, errormessage: "permessi non sufficienti, non puoi creare un volo" });
        }
        const {flightNumber, company, departureTime, arrivalTime, airplane, from, to, prices} = req.body;

        //sia per id sia per modello aereo
        let foundAirplane = await Airplanes.findOne({airplaneModel: { $regex: airplane, $options: 'i'}});
        console.log(`Ricerca aereo per modello  res "${airplane}":`, foundAirplane);

        if (!foundAirplane) {
            console.log(`Nessun aereo trovato con modello ${airplane}, tentando con ID...`);
            foundAirplane = await Airplanes.findById(airplane);
            if (!foundAirplane) {
                throw new Error(`Aereo non trovato né per modello né per ID: ${airplane}`);
            }
        }   

        const routes = await helper.findRoutesHelper(from.toUpperCase(), to.toUpperCase()) || [];
        // routes è un array, cerchiamo al suo interno la rotta della nostra compagnia
        let routeFlight = routes.find(r => r.airlineId.toString() === req.auth.id.toString());

        if (!routeFlight) {
            return res.status(400).json({ 
                error: true, 
                errormessage: `La rotta ${from}-${to} non è registrata per la tua compagnia.` 
            });
        }

        let newFlight = new Flight({
            flightNumber: flightNumber,
            company: req.auth.id,
            route: routeFlight._id,
            prices: prices,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            airplane: foundAirplane._id, 

        });

        console.log("Nuovo volo da creare:", newFlight);
        await newFlight.save();
        console.log("Nuovo volo creato:", newFlight);
        return res.status(200).json({ message: "Nuovo volo creato!", flight: newFlight });
    } catch (err) {
       console.error("ERRORE CREAZIONE VOLO:", err);

        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Esiste già un volo con questo numero in questa data" });
        }

        return res.status(500).json({ 
            error: true, 
            errormessage: err.message || "Errore interno del server" 
        });
    }
};

// PUT: Aggiorna prezzi del volo
exports.updateFlight = async (req, res) => {
    try {
        if (req.auth.role !== 'admin' && req.auth.role !== 'airline') {
            console.log("Permessi insufficienti per aggiornare il volo. Ruolo dell'utente:", req.auth.role);
            return res.status(403).json({ error: true, errormessage: "Permessi insufficienti" });
        }

        const flightId = req.params.id;
        console.log("req_body:", req.body);
        const { prices, departureTime, arrivalTime } = req.body;

        if (!prices && !departureTime && !arrivalTime) {
            return res.status(400).json({ error: true, errormessage: "Nessun dato fornito per l'aggiornamento" });
        }

        // Trova il volo
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ error: true, errormessage: "Volo non trovato" });
        }

         console.log("Confronto:", 
            "flight.company =", flight.company.toString(), 
            "req.auth.id =", req.auth.id.toString(), 
            "req.auth.role =", req.auth.role);

        if (req.auth.role !== 'admin' && flight.company.toString() !== req.auth.id.toString()) {
            return res.status(403).json({ error: true, errormessage: "Non puoi modificare voli di altre compagnie" });
        }

        console.log("Volo prima dell'aggiornamento:", flight);
        if (departureTime)
             flight.departureTime = new Date(departureTime);
        if (arrivalTime)
             flight.arrivalTime = new Date(arrivalTime); 
        console.log("dopo aggiornamento date:", flight); 
        if (prices){
             flight.prices = {
                economy: prices.economy ?? flight.prices.economy,
                business: prices.business ?? flight.prices.business,
                firstclass: prices.firstclass ?? flight.prices.firstclass,
                extras: {
                    baggage: prices.extras?.baggage ?? flight.prices.extras.baggage,
                    legroom: prices.extras?.legroom ?? flight.prices.extras.legroom,
                    priorityBoarding: prices.extras?.priorityBoarding ?? flight.prices.extras.priorityBoarding
                }
        }
       
        console.log("Volo dopo l'aggiornamento:", flight);
        await flight.save();
        console.log("Volo salvato con successo:");

        return res.status(200).json({ 
            message: "Prezzi aggiornati con successo!", 
            flight: flight 
        });
    }
    } catch (err) {
        console.error("ERRORE AGGIORNAMENTO VOLO:", err);
        return res.status(500).json({ 
            error: true, 
            errormessage: err.message || "Errore interno del server" 
        });
    }
};

exports.deleteFlight= async (req, res) => {
    try {
        console.log("Richiesta di cancellazione del volo con ID:", req.params.id, "da parte dell'utente:", req.auth);
        const flightId = req.params.id;
        console.log("ID del volo da cancellare:", flightId);
        const result = await helper.flightDeleterHelper(flightId, req.auth);
        if(result.error) {
            console.log("Errore durante la cancellazione del volo:", result.message);
            return res.status(result.status || 400).json({ error: true, message: result.message });
        }
        return res.status(200).json(result);
    } catch (err) {
        console.error("ERRORE CANCELLAZIONE VOLO:", err);
        return res.status(500).json({ error: true, message: err.message || "Errore interno del server" });
    }
};

// GET: Statistiche per compagnie aeree
exports.getAirlineStatistics = async (req, res) => {
    try {
        // Solo airline e admin possono vedere le statistiche
        if (req.auth.role !== 'airline' && req.auth.role !== 'admin') {
            return res.status(403).json({ 
                error: true, 
                errormessage: "Solo le compagnie aeree possono visualizzare le statistiche" 
            });
        }

        const { dateFrom, dateTo, email } = req.query;

        let flightFilter = {};

        if (dateFrom || dateTo) {
            flightFilter.departureTime = {};
            if (dateFrom) {
                flightFilter.departureTime.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                flightFilter.departureTime.$lte = new Date(dateTo);
            }
        }

        if (req.auth.role === 'airline') {
            flightFilter.company = req.auth.id;
        } else if (req.auth.role === 'admin') {
            if (email) {
                const User = require('../models/Users');
                const companyUser = await User.findOne({ email: email, role: 'airline' });
                if (!companyUser) {
                    return res.status(404).json({ 
                        error: true, 
                        errormessage: `Nessuna compagnia trovata con email: ${email}` 
                    });
                }
                flightFilter.company = companyUser._id;
            }
            // Se admin non passa email, vede le statistiche aggregate di tutte le compagnie
        }

        
        const flights = await Flight.find(flightFilter).select('_id flightNumber bookedSeats');
        const flightIds = flights.map(f => f._id);

        if (flightIds.length === 0) {
            return res.status(200).json({
                error: false,
                errormessage: "",
                totalPassengers: 0,
                totalRevenue: 0,
                flightStats: [],
                routeStats: [] 
            });
        }

        const tickets = await Ticket.find({ flight: { $in: flightIds } })
            .populate({
                path: 'flight',
                populate: {
                    path: 'route',
                    populate: {
                        path: 'departureAirport arrivalAirport'
                    }
                }
            });

        let totalPassengers = tickets.length;
        let totalRevenue = 0;

        for (const ticket of tickets) {
            totalRevenue += ticket.price;
        }

  
        let singleStats = {};
        for (let flight of flights) {
            if (!singleStats[flight._id]) {
                singleStats[flight._id] = {
                    flightNumber: flight.flightNumber,
                    totalPassengers: flight.bookedSeats.length, 
                    totalRevenue: 0,  
                    numberOfFlights: 0,
                    averageRevenuePerPassenger: 0,
                    averagePassengersPerFlight: 0
                };
            }
            for (let ticket of tickets) {
                if (ticket.flight._id.toString() === flight._id.toString()) {
                    singleStats[flight._id].totalRevenue += ticket.price;
                    singleStats[flight._id].numberOfFlights = 1;
                }
            }
        }

        for (const flight of flights) {
            const stat = singleStats[flight._id];
            if (stat.totalPassengers > 0) {
                stat.averageRevenuePerPassenger = stat.totalRevenue / stat.totalPassengers;
            }
            if (stat.numberOfFlights > 0) {
                stat.averagePassengersPerFlight = stat.totalPassengers / stat.numberOfFlights;
            }
        }

        let popularRoutes = {};
        for (let ticket of tickets) {
            const route = ticket.flight.route; 
            if (!route) continue;

            const routeId = route._id.toString();
            if (!popularRoutes[routeId]) {
                popularRoutes[routeId] = {
                    routeId: routeId,
                    departureCode: route.departureAirport.code,   
                    arrivalCode:   route.arrivalAirport.code,
                    departureCity: route.departureAirport.city,
                    arrivalCity:   route.arrivalAirport.city,
                    totalPassengers: 0,
                    totalRevenue: 0
                };
            }
            popularRoutes[routeId].totalPassengers += 1;
            popularRoutes[routeId].totalRevenue += ticket.price;
        }

        let routeStats = Object.values(popularRoutes);
        routeStats.sort((a, b) => b.totalPassengers - a.totalPassengers);

        const flightStats = Object.values(singleStats);
        
        return res.status(200).json({
            error: false,
            totalPassengers,
            totalRevenue,
            flightStats,   
            routeStats
        });

    } catch (err) {
        console.error("Error fetching statistics:", err);
        return res.status(500).json({ 
            error: true, 
            errormessage: "Errore durante il recupero delle statistiche",
            details: err.message 
        });
    }
};