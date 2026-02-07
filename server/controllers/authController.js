const User = require('../models/Users');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const jsonwebtoken = require('jsonwebtoken');
const { deleteTicketHelper } = require('./helperController');

exports.login = (req, res) => {
    const user = req.user; // Iniettato da Passport

    const tokendata = {
        email: user.email,
        role: user.role,
        id: user._id,

        // Dati Passenger
        name: user.name,
        surname: user.surname,
        birthdate: user.birthdate,
        phonenumber: user.phonenumber,
        paymentAddress: user.paymentAddress,
        // Dati Airline
        company: user.company,
        // Info di sistema
        dateofcreation: user.dateofcreation
    };
    //passport ha già validato le credenziali
    //creo il token JWT
    console.log("Login granted. Generating token");
    const token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
};


exports.register = async (req, res) => {
    try{
        //prendo i dati dal body che mi servono
    let {email, password, role} = req.body;

    if(!email || !password){
        //400 perchè è il numero per gli errori del client
        return  res.status(400).json({error: true, errormessage: "manca email o password"});
    }

    //Controllo se l'email è già usata
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).json({ error: true, errormessage: "Email già in uso nel db" });
    }

    /*
    if(role != "passenger"){
        // solo i passeggeri possono registrarsi, eheh no
        return res.status(400).json({ error: true, errormessage: "ruolo diverso da passeggero errore nella registarzione" });
    }
    */

    let newUser = new User(req.body);
    newUser.setPassword(password);
    await newUser.save();
    return res.status(200).json({ error: false, errormessage: "" , message: "Nuovo utente registrato con successo"});

    }catch(err){
        console.error("Registration error:", err);
        return res.status(500).json({ error: true, errormessage: "Server error during registration" });
    }
}

exports.changePassword = async (req, res) => {
    try{
        //prendo i dati dal body che mi servono
        let {email, newPassword, oldPassword} = req.body;
        
        if (!email || !newPassword || !oldPassword) {
            return res.status(400).json({ error: true, errormessage: "Tutti i campi sono obbligatori" });
        }

        const acount = await User.findOne({ email: email });
        if (!acount) {
            return res.status(400).json({ error: true, errormessage: "Utente non trovato" });
        }

        const isOldPasswordValid = acount.validatePassword(oldPassword);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: true, errormessage: "Vecchia password non corretta" });
        }

        acount.setPassword(newPassword); 
        await acount.save();

        return res.status(200).json({ error: false, errormessage: "" , message: "password cambiata con successo"});
    }catch(err){
        console.error("Registration error:", err);
        return res.status(500).json({ error: true, errormessage: "errore durante cambio password" });
    } 
}

exports.deleteAccount = async (req, res) => {
    try {
        let {userId} = req.body;
        if(auth.role !== 'admin'){
            return res.status(403).json({ error: true, errormessage: "non hai i permessi per cancellare questo account" });
        }
        

        const tickets = await Ticket.find({ user: userId }).select('_id'); 
        const ticketIds = tickets.map(t => t._id);
         const results = await Promise.all(
            ticketIds.map(tId => deleteTicketHelper(tId, req.auth))
        );

        const bookings = await Booking.deleteMany({ user: userId });

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            console.error("Alcuni biglietti non sono stati cancellati correttamente:", errors);
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        return res.status(200).json({ error: false, errormessage: "" , message: "account cancellato con successo", user: deletedUser });
    } catch (err) {
        console.error("Error deleting account:", err);
        return res.status(500).json({ error: true, errormessage: "Errore durante la cancellazione dell'account" });
    }
}

exports.logout = (req, res) => {
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
};

exports.getUsers = async (req, res) => {
    try {
        if (req.auth.role !== 'admin') {
            return res.status(403).json({ error: true, errormessage: "Non hai i permessi per visualizzare gli utenti" });
        }
        const { name, surname, role, email, birthdate } = req.query;

        let filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }
        if (surname) {
            filter.surname = { $regex: surname, $options: 'i' };
        }
        if (role) {
            filter.role = role;
        }
        if (email) {
            filter.email = { $regex: email, $options: 'i' };
        }
        if (birthdate) {
            filter.birthdate = birthdate;
        }

        const users = await User.find(filter).select('-hash -salt'); // Escludo hash e salt per sicurezza
        return res.status(200).json({ error: false, errormessage: "", users });
    } catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ error: true, errormessage: "Errore durante il recupero degli utenti" });
    }
};