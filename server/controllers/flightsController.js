const Airplanes = require('../models/Airplanes');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const helper = require('./helperController'); // CORRETTO (nota il ./ invece di ../)

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
            company: company,
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
            return res.status(403).json({ error: true, errormessage: "Permessi insufficienti" });
        }

        const flightId = req.params.id;
        const { prices, departureTime, arrivalTime } = req.body;

        if (!prices && !departureTime && !arrivalTime) {
            return res.status(400).json({ error: true, errormessage: "Nessun dato fornito per l'aggiornamento" });
        }

        // Trova il volo
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ error: true, errormessage: "Volo non trovato" });
        }

        if (req.auth.role !== 'admin' && flight.company.toString() !== req.auth.id.toString()) {
            return res.status(403).json({ error: true, errormessage: "Non puoi modificare voli di altre compagnie" });
        }

        if (departureTime) flight.departureTime = departureTime;
        if (arrivalTime) flight.arrivalTime = arrivalTime;  
        if (prices) flight.prices = prices;
        await flight.save();

        return res.status(200).json({ 
            message: "Prezzi aggiornati con successo!", 
            flight: flight 
        });

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
        const result = await flightDeleterHelper(req.params.id, req.auth);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: true, message: err.message });
    }
};
