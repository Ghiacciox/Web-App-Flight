const User = require('../models/Users');
const jsonwebtoken = require('jsonwebtoken');

exports.login = (req, res) => {
    const user = req.user; // Iniettato da Passport

    const tokendata = {
        email: user.email,
        role: user.role,
        id: user._id
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

    if(role != "passenger"){
        // solo i passeggeri possono registrarsi
        return res.status(400).json({ error: true, errormessage: "ruolo diverso da passeggero errore nella registarzione" });
    }

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


exports.logout = (req, res) => {
    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
};
