const Route = require('../models/Routes');
const Airport = require('../models/Airports');
const helper= require('./helperController');

// GET: Cerca rotte
// Può essere usato così: GET /api/routes?from=FCO&to=JFK
exports.getRoutes = async (req, res) => {
    try {
         if (req.auth.role !== 'airline' && req.auth.role !== 'admin') {
        return res.status(403).json({ error: true, errormessage: "Solo le compagnie aeree possono creare rotte" });
    }
        const { from, to,} = req.query;
        const routes = await helper.findRoutesHelper(from, to);
        res.status(200).json(routes);
    } catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore ricerca rotte", details: err.message });
    }
};

// POST: Crea una nuova tratta (Solo Compagnie Aeree)
exports.createRoute = async (req, res) => {
    // 1. Controllo Ruolo
    if (req.auth.role !== 'airline' && req.auth.role !== 'admin') {
        return res.status(403).json({ error: true, errormessage: "Solo le compagnie aeree possono creare rotte" });
    }

    const { departureCode, arrivalCode } = req.body;

    if(!departureCode || !arrivalCode) {
        return res.status(400).json({ error: true, errormessage: "Codici aeroporti mancanti" });
    }

    try {
        // 2. Converto i codici (es. "FCO") in ID del database
        const depAirport = await Airport.findOne({ code: departureCode.toUpperCase() });
        const arrAirport = await Airport.findOne({ code: arrivalCode.toUpperCase() });

        if (!depAirport || !arrAirport) {
            return res.status(404).json({ error: true, errormessage: "Uno degli aeroporti non esiste" });
        }

        // 3. Creo la rotta
        const newRoute = new Route({
            airlineId: req.auth.id, // Prendo l'ID dal token di chi è loggato
            departureAirport: depAirport._id,
            arrivalAirport: arrAirport._id
        });

        await newRoute.save();
        res.status(201).json({ message: "Nuova tratta aerea creata!", route: newRoute });

    } catch (err) {
        // Gestione errore duplicato (definito nel tuo model con index unique)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Questa tratta esiste già per la tua compagnia" });
        }
        // Errore validation (es. partenza == arrivo, gestito dal tuo pre('save'))
        res.status(400).json({ error: true, errormessage: err.message });
    }
};

// DELETE: Cancella rotta
exports.deleteRoute = async (req, res) => {
    // Solo chi l'ha creata può cancellarla (o admin)
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ error: true, message: "Rotta non trovata" });

        // Controllo proprietà: L'utente loggato è il proprietario della rotta?
        if (req.auth.role !== 'admin' && route.airlineId.toString() !== req.auth.id) {
            return res.status(403).json({ error: true, message: "Non puoi cancellare rotte di altri" });
        }

        const id = req.params.id;
        const flight = await Flight.find({ route: id }).select('_id'); 
        // 1. Trova tutti i ticket associati a questo volo
        const flightIds = flight.map(f => f._id);

        //tutti i flightDeleterHelper in parallelo
        const results = await Promise.all(
            flightIds.map(fId => flightDeleterHelper(fId, req.auth))
        );

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            console.error("Alcuni voli non sono stati cancellati correttamente:", errors);
        }

        await Route.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        res.status(200).json({ message: "Rotta cancellata", route: route });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
};

