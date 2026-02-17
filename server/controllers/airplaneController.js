const Airplanes = require('../models/Airplanes');
const Flight = require('../models/Flight');

exports.getAirplane = async (req, res) => {
    try {
        const {airplaneModel} = req.query; 
        // informazioni visibili nell' url: /api/airplanes?airplaneModel=Airbus
        console.log("DEBUG QUERY PARAMS:", req.query);

        if(airplaneModel){
            let airplanes = await Airplanes.find({ airplaneModel: { $regex: airplaneModel, $options: 'i'} });
            return res.status(200).json({ message: "Modello di aereo trovato!", airplanes });
        }
        //non ha senso tornare tutti gli aerei
        return res.status(200).json({ message: "nessun filtro applicato!", airplanes : [] });
    } catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore recupero aerei" });
    }
};

// POST: Crea Aeroporto (Solo Admin)
exports.createAirplane = async (req, res) => {
    console.log(" 1.sono nella funzione di creazione aereo");
    try {
        if (req.auth.role !== 'admin' && req.auth.role !== 'airline') {
            return res.status(400).json({ error: true, errormessage: "Non autorizzato a creare un aereo" });
        }
        console.log(" 2.permessi ok");
        const {airplaneModel, capacity} = req.body;
        console.log(" 3.dati ricevuti, letto il body");

        const newAirplane = new Airplanes({
            airplaneModel: airplaneModel,
            capacity: capacity
        });
        console.log(" 4.creato nuovo aereo, pronto per salvare");
        console.log(newAirplane);
        await newAirplane.save();
        console.log(" 5.aereo salvato nel db");
        return res.status(200).json({ message: "Nuovo aereo creato!", airplane: newAirplane });
    } catch (err) {
        // Gestione errore duplicati (code deve essere univoco)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Codice aereo già esistente" });
        }

        return res.status(500).json({ 
            error: true, 
            errormessage: "Errore nel salvataggio", 
            details: err.message // Ti dirà esattamente cosa non va
        });
    }
};

// DELETE: Elimina un aereo (Solo Admin)
exports.deleteAirplane = async (req, res) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(400).json({ error: true, errormessage: "Non sei un admin non puoi eliminare un aereo" });
        }
        const id = req.params.id;


        const flight = await Flight.find({ airplane: id }).select('_id'); 
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
        //finter per vedere se ci sono errori nei risultati dei flightDeleterHelper

        
        const deletedAirplane = await Airplanes.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!deletedAirplane) {
            return res.status(404).json({ error: true, errormessage: "Aereo non trovato" });
        }
        return res.status(200).json({ message: "Aereo eliminato con successo", airplane: deletedAirplane });
    } catch (err) {
        return res.status(500).json({ error: true, errormessage: "Errore durante l'eliminazione dell'aereo", details: err.message });
    }
}
