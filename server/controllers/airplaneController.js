const Airplanes = require('../models/Airplanes');

// GET: Lista di tutti gli aeroporti (Pubblico)
exports.getAirplane = async (req, res) => {
    try {
        const {airplaneModel} = req.query; 
        // informazioni visibili nell' url: /api/airplanes?airplaneModel=Airbus

        if(airplaneModel){
            let airplanes = await Airplanes.find({ airplaneModel: { $regex: airplaneModel, $options: 'i'} });
            return res.status(200).json({ message: "Modello di aereo trovato!", airplanes });
        }
        //non ha senso tornare tutti gli aerei
        return res.status(200).json({ message: "nessun filtro applicato!", airplanes : [] });
    } catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore recupero aeroporti" });
    }
};

// POST: Crea Aeroporto (Solo Admin)
exports.createAirplane = async (req, res) => {
    // Verifica ruolo Admin (assumendo che req.auth sia popolato dal middleware JWT)
    console.log(" 1.sono nella funzione di creazione aereo");
    try {
        if (req.auth.role !== 'admin' && req.auth.role !== 'airline') {
            return res.status(400).json({ error: true, errormessage: "Non sei un admin non puoi creare un aeroporto" });
        }
        console.log(" 2.permessi ok");
        const {airplaneModel, capacity} = req.body;
         console.log(" 3.dati ricevuti, letto il body");

        const newAirplane = new Airplanes({
            airplaneModel: airplaneModel,
            capacity: capacity
        });
        console.log(" 4.creato nuovo aereo, pronto per salvare");
        await newAirplane.save();
        console.log(" 5.aereo salvato nel db");
        return res.status(200).json({ message: "Nuovo aereo creato!"});
    } catch (err) {
        // Gestione errore duplicati (code deve essere univoco)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Codice aeroporto già esistente" });
        }

        return res.status(500).json({ 
            error: true, 
            errormessage: "Errore nel salvataggio", 
            details: err.message // Ti dirà esattamente cosa non va
        });
    }
};

// DELETE: Elimina un aereo (Solo Admin)
//problema se abbiamo voli futuri con quell'aereo
exports.deleteAirplane = async (req, res) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(400).json({ error: true, errormessage: "Non sei un admin non puoi eliminare un aereo" });
        }
       const id = req.params.id;
        const deletedAirplane = await Airplanes.findByIdAndDelete(airplaneId);
        if (!deletedAirplane) {
            return res.status(404).json({ error: true, errormessage: "Aereo non trovato" });
        }
        return res.status(200).json({ message: "Aereo eliminato con successo" });
    } catch (err) {
        return res.status(500).json({ error: true, errormessage: "Errore durante l'eliminazione dell'aereo", details: err.message });
    }
}