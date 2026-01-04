const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Se non hai uuid, puoi usare una stringa random manuale

// Importa i modelli (Assicurati che i nomi dei file siano corretti!)
const User = require('./models/Users'); 
const Airport = require('./models/Airports');
const Airplane = require('./models/Airplanes');
const Route = require('./models/Routes');
const Flight = require('./models/Flight');
const Ticket = require('./models/Ticket');
const Booking = require('./models/Booking');


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


// Stringa di connessione
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/flightdb';

const seedData = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log('🌱 Connesso al DB per il seeding...');

        // ====================================================
        // 1. PULIZIA TOTALE
        // ====================================================
        console.log('🧹 Pulizia database...');
        await Promise.all([
            User.deleteMany({}),
            Airport.deleteMany({}),
            Airplane.deleteMany({}),
            Route.deleteMany({}),
            Flight.deleteMany({}),
            Ticket.deleteMany({}),
            Booking.deleteMany({})
        ]);

        // ====================================================
        // 2. CREAZIONE UTENTI
        // ====================================================
        console.log('👤 Creazione Utenti...');
        
        const admin = await User.create({
            email: "admin@taw.com",
            password: "admin", 
            role: "admin"
        });

        const airlineLufthansa = await User.create({
            email: "info@lufthansa.com",
            password: "123",
            role: "airline",
            company: "Lufthansa"
        });

        const passengerMario = await User.create({
            email: "mario@gmail.com",
            password: "123",
            role: "passenger",
            name: "Mario",           
            surname: "Rossi",
            birthdate: new Date("1990-01-01"),
            phonenumber: "333111111",         
            paymentAddress: "Via Roma 1"
        });

        const passengerLuigi = await User.create({
            email: "luigi@gmail.com",
            password: "123",
            role: "passenger",
            name: "Luigi",           
            surname: "Verdi",
            birthdate: new Date("1992-05-05"),
            phonenumber: "333222222",         
            paymentAddress: "Corso Italia 20"
        });

        // ====================================================
        // 3. CREAZIONE AEROPORTI
        // ====================================================
        console.log('🌍 Creazione Aeroporti...');
        const vce = await Airport.create({ code: "VCE", city: "Venezia", name: "Marco Polo", country: "Italia" });
        const jfk = await Airport.create({ code: "JFK", city: "New York", name: "J.F. Kennedy", country: "USA" });
        const lhr = await Airport.create({ code: "LHR", city: "Londra", name: "Heathrow", country: "UK" });

        // ====================================================
        // 4. CREAZIONE AEREI
        // ====================================================
        console.log('✈️ Creazione Aerei...');
        
        // Aereo Grande (Boeing)
        const boeing737 = await Airplane.create({
            airplaneModel: "Boeing 737-800",
            capacity: {
                economy: { rows: 20, seatsPerRow: 6, seatLetters: "ABCDEF" }, // 120 posti
                business: { rows: 5, seatsPerRow: 4, seatLetters: "ACDF" },   // 20 posti
                firstclass: { rows: 0, seatsPerRow: 0, seatLetters: "" }      // 0 posti
            }
        });

        // Aereo Piccolo (Private Jet)
        const privateJet = await Airplane.create({
            airplaneModel: "Learjet 75",
            capacity: {
                economy: { rows: 0, seatsPerRow: 0, seatLetters: "" },
                business: { rows: 0, seatsPerRow: 0, seatLetters: "" },
                firstclass: { rows: 4, seatsPerRow: 2, seatLetters: "AD" } // Solo 8 posti
            }
        });

        // ====================================================
        // 5. CREAZIONE ROTTE
        // ====================================================
        console.log('📍 Creazione Rotte...');
        
        const routeVceJfk = await Route.create({
            airlineId: airlineLufthansa._id,
            departureAirport: vce._id,
            arrivalAirport: jfk._id,
        });

        const routeJfkVce = await Route.create({
            airlineId: airlineLufthansa._id,
            departureAirport: jfk._id,
            arrivalAirport: vce._id,
        });

        // ====================================================
        // 6. CREAZIONE VOLI
        // ====================================================
        console.log('🛫 Creazione Voli...');

        // Date dinamiche (domani)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const arrivalTime = new Date(tomorrow);
        arrivalTime.setHours(19, 0, 0, 0); // 9 ore dopo

        // Volo 1: VCE -> JFK (Boeing)
        const flightOutbound = await Flight.create({
            flightNumber: "LH405",
            company: airlineLufthansa._id,
            route: routeVceJfk._id,
            airplane: boeing737._id,
            departureTime: tomorrow,
            arrivalTime: arrivalTime,
            prices: {
                economy: 500,
                business: 1200,
                firstclass: 3000, 
                extras: { baggage: 50, legroom: 20, priorityBoarding: 15 }
            },
            bookedSeats: [] // Inizialmente vuoto
        });

        // Volo 2: JFK -> VCE (Ritorno - 1 settimana dopo)
        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekArr = new Date(nextWeek);
        nextWeekArr.setHours(19, 0, 0, 0);

        const flightReturn = await Flight.create({
            flightNumber: "LH406",
            company: airlineLufthansa._id,
            route: routeJfkVce._id,
            airplane: boeing737._id,
            departureTime: nextWeek,
            arrivalTime: nextWeekArr,
            prices: {
                economy: 450,
                business: 1100,
                firstclass: 2900, 
                extras: { baggage: 50, legroom: 20, priorityBoarding: 15 }
            },
            bookedSeats: []
        });

        // ====================================================
        // 7. PRENOTAZIONI E BIGLIETTI (Il test completo!)
        // ====================================================
        console.log('🎟️ Simulazione Prenotazione (Booking)...');

        // --- SCENARIO A: Mario prenota Andata e Ritorno in Economy ---
        
        // Calcolo manuale prezzi (perché usiamo insertMany per bypassare hook sincroni)
        const priceTicket1 = flightOutbound.prices.economy + flightOutbound.prices.extras.baggage; // 500 + 50
        const priceTicket2 = flightReturn.prices.economy; // 450 (niente bagaglio al ritorno)

        // 1. Creiamo i Ticket Objects
        const ticketsMarioData = [
            {
                user: passengerMario._id,
                flight: flightOutbound._id,
                seat: "12A",
                class: "economy",
                extras: { baggage: true, legroom: false, priorityBoarding: false },
                price: priceTicket1
            },
            {
                user: passengerMario._id,
                flight: flightReturn._id,
                seat: "12A",
                class: "economy",
                extras: { baggage: false, legroom: false, priorityBoarding: false },
                price: priceTicket2
            }
        ];

        // 2. Salviamo i Ticket nel DB
        // Nota: insertMany è più veloce e spesso bypassa i hook 'save' problematici se configurato
        const createdTicketsMario = await Ticket.insertMany(ticketsMarioData);

        // 3. Creiamo la Booking contenitore
        await Booking.create({
            user: passengerMario._id,
            tickets: createdTicketsMario.map(t => t._id), // Array di ID
            totalPrice: priceTicket1 + priceTicket2,
            code: "MARIO001", // Codice prenotazione
            status: "confirmed"
        });

        // 4. Aggiorniamo i posti occupati nei voli (Cruciale!)
        await Flight.findByIdAndUpdate(flightOutbound._id, { $push: { bookedSeats: "12A" } });
        await Flight.findByIdAndUpdate(flightReturn._id, { $push: { bookedSeats: "12A" } });


        // --- SCENARIO B: Luigi prenota solo Andata in Business ---
        
        const priceTicketLuigi = flightOutbound.prices.business + flightOutbound.prices.extras.priorityBoarding; // 1200 + 15

        const ticketLuigiData = [{
            user: passengerLuigi._id,
            flight: flightOutbound._id,
            seat: "2A", // Business class seat
            class: "business",
            extras: { baggage: false, legroom: false, priorityBoarding: true },
            price: priceTicketLuigi
        }];

        const createdTicketLuigi = await Ticket.insertMany(ticketLuigiData);

        await Booking.create({
            user: passengerLuigi._id,
            tickets: createdTicketLuigi.map(t => t._id),
            totalPrice: priceTicketLuigi,
            code: "LUIGI999",
            status: "confirmed"
        });

        // Aggiorna posto volo
        await Flight.findByIdAndUpdate(flightOutbound._id, { $push: { bookedSeats: "2A" } });


        console.log('✅ SEEDING COMPLETATO CON SUCCESSO!');
        console.log('📊 Dati generati:');
        console.log(`   - Utenti: 4`);
        console.log(`   - Aerei: 2`);
        console.log(`   - Voli: 2`);
        console.log(`   - Prenotazioni: 2 (Mario A/R, Luigi Solo Andata)`);
        
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRORE DURANTE IL SEEDING:', error);
        process.exit(1);
    }
};

seedData();