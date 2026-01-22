require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/Users');
const Airport = require('./models/Airports');
const Airplane = require('./models/Airplanes');
const Route = require('./models/Routes');
const Flight = require('./models/Flight');
const Ticket = require('./models/Ticket');
const Booking = require('./models/Booking');

const seedDB = async () => {
    try {
        console.log('🔄 Avvio pulizia e popolamento DB...');

        // 1. PULIZIA DATABASE
        await Promise.all([
            Booking.deleteMany({}),
            Ticket.deleteMany({}),
            Flight.deleteMany({}),
            Route.deleteMany({}),
            Airplane.deleteMany({}),
            Airport.deleteMany({}),
            User.deleteMany({})
        ]);

        // 2. CREAZIONE UTENTI (Admin, Passeggero, 2 Compagnie Aeree)
        const admin = new User({ email: "admin@bauflights.com", role: "admin" });
        admin.setPassword("123456");

        const passenger = new User({ 
            email: "mario.rossi@email.com", role: "passenger", 
            name: "Mario", surname: "Rossi", birthdate: new Date("1990-05-20"), 
            phonenumber: "+393331234567", paymentAddress: "Via Roma 1, Milano" 
        });
        passenger.setPassword("123456");
        
        const airlineBau = new User({ email: "info@bauairlines.com", role: "airline", company: "Bau Airlines" });
        airlineBau.setPassword("123456");

        const airlineSky = new User({ email: "info@skywings.com", role: "airline", company: "Sky Wings" });
        airlineSky.setPassword("123456");

        await Promise.all([admin.save(), passenger.save(), airlineBau.save(), airlineSky.save()]);

        // 3. AEROPORTI
        const airportsData = [
            { code: "LIN", name: "Milano Linate", city: "Milano", country: "Italia" },
            { code: "FCO", name: "Roma Fiumicino", city: "Roma", country: "Italia" },
            { code: "JFK", name: "John F. Kennedy", city: "New York", country: "USA" },
            { code: "CDG", name: "Charles de Gaulle", city: "Parigi", country: "Francia" }
        ];
        const airports = await Airport.insertMany(airportsData);

        // Helper per prendere gli ID velocemente
        const getAirportId = (code) => airports.find(a => a.code === code)._id;

        // 4. AEREI
        const airplane = new Airplane({
            airplaneModel: "Boeing 737-800",
            capacity: {
                economy: { rows: 20, seatsPerRow: 6, seatLetters: "ABCDEF" },
                business: { rows: 5, seatsPerRow: 4, seatLetters: "ACDF" },
                firstclass: { rows: 0, seatsPerRow: 0, seatLetters: "" }
            }
        });
        await airplane.save();

        // 5. ROTTE
        // Rotte Bau Airlines
        const routeLinFco = await Route.create({ airlineId: airlineBau._id, departureAirport: getAirportId("LIN"), arrivalAirport: getAirportId("FCO") });
        const routeFcoJfk = await Route.create({ airlineId: airlineBau._id, departureAirport: getAirportId("FCO"), arrivalAirport: getAirportId("JFK") });
        
        // Rotte Sky Wings (Concorrenza)
        const routeLinCdg = await Route.create({ airlineId: airlineSky._id, departureAirport: getAirportId("LIN"), arrivalAirport: getAirportId("CDG") });
        const routeCdgJfk = await Route.create({ airlineId: airlineSky._id, departureAirport: getAirportId("CDG"), arrivalAirport: getAirportId("JFK") });

        // 6. VOLI (Date dinamiche: Domani e Dopodomani)
        const today = new Date();
        
        // Date helpers
        const getTomorrowTime = (hour, minute) => {
            const d = new Date(today); d.setDate(d.getDate() + 1); d.setHours(hour, minute, 0, 0); return d;
        };
        const getDayAfterTomorrowTime = (hour, minute) => {
            const d = new Date(today); d.setDate(d.getDate() + 2); d.setHours(hour, minute, 0, 0); return d;
        };

        // --- SCENARIO 1: Volo Diretto Semplice (Milano -> Roma) ---
        await Flight.create({
            flightNumber: "BAU100",
            company: airlineBau._id,
            prices: { economy: 50, business: 150, firstclass: 300, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 } },
            departureTime: getTomorrowTime(8, 0), // Domani 08:00
            arrivalTime: getTomorrowTime(9, 30),  // Domani 09:30
            airplane: airplane._id,
            route: routeLinFco._id,
            bookedSeats: []
        });

        // --- SCENARIO 2: Creazione Scalo (Milano -> Roma -> New York) ---
        // Il volo BAU100 (sopra) arriva a Roma alle 09:30.
        // Creiamo un volo che parte da Roma per NY alle 13:00 (3.5 ore dopo -> SCALO VALIDO)
        await Flight.create({
            flightNumber: "BAU200",
            company: airlineBau._id,
            prices: { economy: 400, business: 900, firstclass: 1500, extras: { baggage: 50, legroom: 20, priorityBoarding: 20 } },
            departureTime: getTomorrowTime(13, 0), // Domani 13:00
            arrivalTime: getTomorrowTime(22, 0),   // Domani 22:00
            airplane: airplane._id,
            route: routeFcoJfk._id,
            bookedSeats: []
        });

        // --- SCENARIO 3: Concorrenza SkyWings (Milano -> Parigi) ---
        await Flight.create({
            flightNumber: "SKY555",
            company: airlineSky._id,
            prices: { economy: 60, business: 180, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 } },
            departureTime: getTomorrowTime(10, 0),
            arrivalTime: getTomorrowTime(11, 30),
            airplane: airplane._id,
            route: routeLinCdg._id,
            bookedSeats: []
        });

        // --- SCENARIO 4: Volo per il giorno dopo (Test date range) ---
        await Flight.create({
            flightNumber: "BAU102",
            company: airlineBau._id,
            prices: { economy: 45, business: 140, firstclass: 280, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 } },
            departureTime: getDayAfterTomorrowTime(8, 0),
            arrivalTime: getDayAfterTomorrowTime(9, 30),
            airplane: airplane._id,
            route: routeLinFco._id,
            bookedSeats: []
        });

        console.log('✅ DATABASE POPOLATO! Ecco i dati per i test:');
        console.log(`   - Data di test (Domani): ${getTomorrowTime(0,0).toLocaleDateString()}`);
        console.log('   - Utenti: admin@bauflights.com, info@bauairlines.com, info@skywings.com (psw: 123456)');

    } catch (error) {
        console.error('❌ Errore seeding:', error);
    }
};

module.exports = seedDB;