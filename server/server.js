require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io'); 

//rotte
const airplaneRoutes = require('./routes/airplaneRoutes');
const airportRoutes = require('./routes/airportRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const flightsRoutes = require('./routes/flightsRoutes');
const routeRoutes = require('./routes/routeRoutes');
const ticketsRoutes = require('./routes/ticketRoutes');

//altre cose che servono
const http = require('http');

const url = require('url');
const fs = require('fs');
const jsonwebtoken = require("jsonwebtoken"); 
const { expressjwt: jwt } = require('express-jwt');


const passport = require("passport");
const passportHTTP = require("passport-http");
//modelli
const user = require("./models/Users");

//seed
const seed = require("./seed");

const PORT = process.env.PORT || 3000;
const app = express();

///*websocket setup*/
let io = undefined; 
//preparo il socket io a essere inizializzato dopo la connessione al database, così posso passarlo alle funzioni helper che ne hanno bisogno senza doverlo importare direttamente nei controller

// Middleware
app.use(cors()); // Permette al frontend di chiamarci
app.use(express.json()); // Permette di leggere i JSON in arrivo

  
// Middleware per loggare tutte le richieste e allegare l'istanza di Socket.IO alla richiesta
app.use((req, res, next) => {
    console.log("------------------------------------------------");
    console.log("Richiesta:", req.method, req.url);
    req.io = io; //istanza di Socket.IO alla richiesta
    next();
});


//middleware express
//si arrangia per parsare json 
//per sessione
//per cookie
//per file statici



// Log delle richieste (stampo tutto per debugg)


// Rotte
//posso mappare url a funzioni
//esempio app.get('/path', (req, res) => {})
app.use('/api/airplanes', airplaneRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/tickets', ticketsRoutes);

// Rotta di prova base
app.get('/', (req, res) => {
  res.send('Ciao! Il Backend TAW è attivo e funzionante!');
});

// Gestore 404 (Pagina non trovata)
app.use((req, res) => {
    res.status(404).json({ error: true, errormessage: "Endpoint non trovato" });
})


//strategia per usare dentro le rotte di passport
passport.use(new passportHTTP.BasicStrategy({ passReqToCallback: true },function (req,email, password, done) {

    console.log("Headers:", req.headers);

    console.log("Nuovo tentativo di login di: "+ email);
    user.findOne({ email: email }).then((user) => {
        if (!user) {
            return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid user" });
        }
        if (user.validatePassword(password)) {
            return done(null, user);
        }
        return done(null, false, { statusCode: 500, error: true, errormessage: "Invalid password" });
    }).catch((err) => {
        return done({ statusCode: 500, error: true, errormessage: err });
    });
}));


// Gestore errori centralizzato (cattura anche errori JWT e Passport)
app.use((err, req, res, next) => {
    console.error("Errore rilevato:", JSON.stringify(err));

    // Errore Token non valido o mancante (401)
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: true, errormessage: "Accesso negato: Token invalido o mancante" });
    }

    // Altri errori
    res.status(err.statusCode || 500).json({ 
        error: true, 
        errormessage: err.message || err.errormessage || "Errore generico del server" 
    });
});

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/bau_flightdb';

mongoose.connect(mongoUrl)
    .then(async () => {
        console.log('✅ Connesso al DB!');
        
        const existingAdmin = await user.findOne({ email: "admin@bau-flights.it" });
        if (!existingAdmin) {
            console.log("Admin non trovato, creazione di un admin di default");
            await seed();
            console.log("Seeding del database completato");
        }
    })
    .then(() => {
        
        let server = http.createServer(app);

        // Initialize Socket.io
        io = socketIo(server, { //creo istanza di socket 
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:4200",
                methods: ["GET", "POST", "DELETE", "PATCH"],
            }
        });

        io.on('connection', (socket) => { //connessione al socket
            console.log('Client connesso al WebSocket: ' + socket.id);
            
            // Join flight room
            socket.on('join-flight', (flightId) => {
              //resto in attesa che il client mi dica a quale volo vuole unirsi, così posso metterlo nella stanza giusta
                socket.join(`flight:${flightId}`); 
                //entro nella stanza del volo
                console.log(`${socket.id} si è unito al volo ${flightId}`);
                socket.emit('joined-flight', { flightId }); 
                //confermo al client di essere entrato nella stanza del volo
               //mando un messaggio solo al client che si è unito alla stanza del volo, 
            });

            // Leave flight room
            socket.on('leave-flight', (flightId) => {
              //aspetto che il client mi dica a quale volo vuole uscire, così posso toglierlo dalla stanza giusta
                socket.leave(`flight:${flightId}`);
                //tolgo dalla stanza del volo
                console.log(`${socket.id} ha lasciato il volo ${flightId}`);
            });

            // Ping-pong
            socket.on('ping', () => {
                socket.emit('pong');
            });

            socket.on('disconnect', () => {
                console.log('❌ Client disconnesso: ' + socket.id);
            });

            socket.on('error', (error) => {
                console.error('❌ Errore WebSocket:', error);
            });
        });

        // Start server
        server.listen(PORT, () => {
            console.log(` Server HTTP avviato sulla porta ${PORT}`);
            console.log(` WebSocket pronto su ws://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Errore critico connessione Mongo:', err);
        process.exit(1);
    });


// Connessione al Database
// Nota: process.env.MONGO_URL viene dal docker-compose.yml
//prendo il nome dal docker compose oppure lo prendo dal locale

//const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/bau_flightdb';


/*
mongoose.connect(mongoUrl)
  .then(async () => {
    console.log('✅ Connesso al DB!');
    
    // controllo se esiste l'admin
    try {
      const existingAdmin = await user.findOne({ email: "admin@bau-flights.it" });
      
      if (!existingAdmin) {
        console.log("Admin non trovato, creazione di un admin di default");
        // Assumo che setPassword sia sincrono (es. passport-local-mongoose).
        // Se fosse asincrono, aggiungi 'await' davanti.
        // Eseguo il seeding del database
        await seed();
        console.log("Seeding del database completato");

         let adminUser = new user({
          email: "admin@bau-flights.it",
          role: "admin"
        });

         adminUser.setPassword("AdminPassword123!");
        
        await adminUser.save();
        console.log("Admin creato con successo");
      }
    } catch (err) {
      console.error("Errore controllo admin o seeding:", err);
    }
    

    // AVVIO SERVER
    // Lo avvio solo se la connessione al DB è riuscita
    app.listen(PORT, () => {
      console.log(`🚀 Server avviato sulla porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Errore critico connessione Mongo:', err);
    process.exit(1); //chiudo server se non riesco a connettermi al db
  })
  .finally(() => { //lo esegue sempre alla fine
    console.log('Tentativo di connessione MongoDB terminato');
  });

*/
  

/**
 * 
 * ci metto quello che voglio fare post connesione
 * 
 */

  // ritorno una promise ovvero quando ha finito di connettersi mi da l'informazione
  // quando connect ha finito esegue il then
  //quindi quando finisce la prima posso eseguire la seconda che è una lambda function
  //con then posso concatenare più operazioni asincrone

  // se c'è un errore lo catturo con catch
  //e quindi eseguo questo 
  //ho ancher finally che viene eseguito sempre alla fine
  
//.create crea un oggetto come promessa e la mette nel database
//.flight.create({flightNumber: "AB123", departure: "2023-10-01T10:00:00Z", arrival: "2023-10-01T14:00:00Z"})
//.all([promise1, promise2]) aspetta che tutte le promesse siano completate
 /*
  posso anche fare
  return new promise((resolve, reject) => {
    //faccio qualcosa di asincrono
    if(tutto ok){
        resolve(result);
    } else {
        reject(error);
    }
  }

  .find() mi ritorna tutti i documenti
  .findById(id) mi ritorna il documento con quell'id
  .findOne({flightNumber: "AB123"}) mi ritorna il primo che trova con quel flight number
  .updateOne({flightNumber: "AB123"}, {departure: "2023-10-01T12:00:00Z"}) aggiorna il primo che trova
  .deleteOne({flightNumber: "AB123"}) elimina il primo che trova

  .skip
  .limit 


  .async / await
  metto async davanti alla dichiarazione della funzione
  e poi uso 
  await davanti alle chiamate asincrone
  in questo modo aspetto che finisca prima di andare avanti

  posso trasormare una funzione in una promise
  
  */





