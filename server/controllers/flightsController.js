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
        let existingFlight =null;
        existingFlight = await Airplanes.findOne({ airplaneModel: airplane }); 

        let routeFlight = await helper.findRoutesHelper(from, to);
        if(!routeFlight){
            return res.status(400).json({ error: true, errormessage: "Rotta disponibile" });
        }

        let newFlight = new Flight({
            flightNumber: flightNumber,
            //capacity: capacity,
            company: company,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            airplane: existingFlight?._id || airplane, // se trovo per modello  oppure ho passato l'id
            route: routeFlight._id,
            prices: prices
        });

        await newFlight.save();
        return res.status(200).json({ message: "Nuovo volo creato!", flight: newFlight });
    } catch (err) {
        // Gestione errore duplicati (code deve essere univoco)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Errore creazione volo"});
        }
    }

     exports.deleteFlight= async (req, res) => {
        try {
            const result = await flightDeleterHelper(req.params.id, req.auth);
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({ error: true, message: err.message });
        }
    };

};