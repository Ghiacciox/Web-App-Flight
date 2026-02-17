const jwt = require('jsonwebtoken');
const User = require('../models/Users');

exports.checkJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: true, errormessage: "Header di autorizzazione mancante" });
        }
        const token = authHeader.split(' ')[1]; 
        //togliamo bearer ch è un senaposto
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let foundUser = await User.findById(decoded.id);
        if(!foundUser){
            return res.status(499).json({ error: true, errormessage: "Utente rieffettua il login" });
        }

        //decodifico i dati del token e li metto in req.auth così sono in chiaro poi
        //per i metodi successivi
        req.auth = decoded;
        next();
    } catch (err) {
        // Se il token è scaduto o manomesso, finisce qui
        return res.status(401).json({ error: true, errormessage: "Token non valido o scaduto" });
    }
};



