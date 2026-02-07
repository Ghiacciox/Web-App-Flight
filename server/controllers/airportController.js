const Airport = require('../models/Airports');

// GET: Lista di tutti gli aeroporti (Pubblico)
exports.getAirports = async (req, res) => {
    try {
        //cerca l'aereoporto in base alla città
        const {code, name, city ,country} = req.query;
        let filter = {};
        if(code){
            filter.code = code.toUpperCase();
        }
        if(city){
            filter.city = { $regex: city, $options: 'i' };
        }
        if(name){
            filter.name = { $regex: name, $options: 'i' };
        }
        if(country){
            filter.country = { $regex: country, $options: 'i' };
        } 
        const airports = await Airport.find(filter);  
        return res.status(200).json({ message: "Aeroporti trovati!", airports });
        
    } catch (err) {
        res.status(500).json({ error: true, errormessage: "Errore recupero aeroporti" });
    }
};

// POST: Crea Aeroporto (Solo Admin)
exports.createAirport = async (req, res) => {
    try {
        // quando ho fatto il login con il token jwt
        // il middleware ha messo dentro req.auth i dati del token
        // quindi anche il ruolo
        if (req.auth.role !== 'admin') {
            return res.status(400).json({ error: true, errormessage: "Non sei un admin non puoi creare un aeroporto" });
        }
        let {code, name, city, country} = req.body;
        const newAirport = new Airport({
            code: code,
            name: name,
            city: city,
            country: country
        });  
        await newAirport.save();
        return res.status(200).json({ message: "Nuovo aeroporto creato!"});
    
    } catch (err) {
        // Gestione errore duplicati (code deve essere univoco)
        if (err.code === 11000) {
            return res.status(400).json({ error: true, errormessage: "Codice aeroporto già esistente" });
        }
    }


};