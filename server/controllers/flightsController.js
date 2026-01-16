const Flight = require('../models/Flight');
const helper = require('./helperController'); // CORRETTO (nota il ./ invece di ../)

// GET: Lista di tutti gli aerei (Pubblico)
exports.getFlights = async (req, res) => {
    try {
        const { flightNumber, route, initialDate , finalDate , company} = req.query; 
        const result = await helper.findFlightsHelper(flightNumber, route, initialDate , finalDate , company);
        
        return res.status(200).json({ message: "risultato ricerca voli!", result});

    }catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore recupero voli" });
    }
};

// POST: Crea aereo (Solo Admin)
exports.createFlights = async (req, res) => {
    // Verifica ruolo Admin (assumendo che req.auth sia popolato dal middleware JWT)
    try {
        if (req.auth.role !== 'admin' && req.auth.role !== 'airline') {
            return res.status(400).json({ error: true, errormessage: "Non sei un admin non puoi creare un aeroporto" });
        }
        const {flightNumber, capacity, company, departureTime, arrivalTime, airplane, route, prices} = req.body;
     
        let newFlight = new Flight({
            flightNumber: flightNumber,
            capacity: capacity,
            company: company,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            airplane: airplane,
            route: route,
            prices: prices
        });

        await newFlight.save();
        return res.status(200).json({ message: "Nuovo volo creato!"});
    } catch (err) {
        // Gestione errore duplicati (code deve essere univoco)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Errore creazione volo"});
        }
    }
};