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
        console.log(' PULIZIA E INIZIALIZZAZIONE DB...');
        
        // Pulizia Totale
        await Promise.all([
            Booking.deleteMany({}), Ticket.deleteMany({}), Flight.deleteMany({}),
            Route.deleteMany({}), Airplane.deleteMany({}), Airport.deleteMany({}), User.deleteMany({})
        ]);

        // Utenti (2 Passeggeri + Admin)
        const password = "123456";

        // 1. ADMIN (Aggiunto numero dummy per sicurezza)
        const admin = new User({ 
            email: "admin@bauflights.com", 
            role: "admin",
            phonenumber: "+390000000000" // Aggiunto per evitare errori
        });
        await admin.setPassword(password);

        // 2. MARIO (Aggiunto phonenumber)
        const mario = new User({ 
            name: "Mario", 
            surname: "Rossi", 
            email: "mario@test.com", 
            role: "passenger", 
            birthdate: new Date("1985-05-20"), 
            paymentAddress: "Milano",
            phonenumber: "+393331234567" // <--- CAMPO MANCANTE AGGIUNTO
        });
        await mario.setPassword(password);

        // 3. LUIGI (Aggiunto phonenumber)
        const luigi = new User({ 
            name: "Luigi", 
            surname: "Verdi", 
            email: "luigi@test.com", 
            role: "passenger", 
            birthdate: new Date("1990-10-10"), 
            paymentAddress: "Roma",
            phonenumber: "+393339876543" // <--- CAMPO MANCANTE AGGIUNTO
        });
        await luigi.setPassword(password);

        await Promise.all([admin.save(), mario.save(), luigi.save()]);

        // Compagnie Aeree (2 Compagnie)
        // Nota: Se anche le compagnie richiedono phonenumber nel modello, aggiungilo qui sotto.
        const airlineA = new User({ 
            email: "info@bauairlines.com", 
            role: "airline", 
            company: "BauAirlines",
            phonenumber: "+3902000000" // Dummy number
        });
        await airlineA.setPassword(password);

        const airlineB = new User({ 
            email: "info@swiftfly.com", 
            role: "airline", 
            company: "SwiftFly",
            phonenumber: "+3906000000" // Dummy number
        });
        await airlineB.setPassword(password);

        await Promise.all([airlineA.save(), airlineB.save()]);

        // Aeroporti (4: Partenza, 2 Hub, Destinazione)
        const airports = await Airport.insertMany([
            { code: "LIN", name: "Milano Linate", city: "Milano", country: "Italia" },
            { code: "FCO", name: "Roma Fiumicino", city: "Roma", country: "Italia" },       // Hub 1
            { code: "MUC", name: "Munich Airport", city: "Monaco", country: "Germania" },   // Hub 2
            { code: "JFK", name: "JFK International", city: "New York", country: "America" }
        ]);
        const getAirID = (code) => airports.find(a => a.code === code)._id;

        // Aerei (Configurati con TUTTE le classi)
        const fullConfigPlane = {
            economy: { rows: 20, seatsPerRow: 6, seatLetters: "ABCDEF" },
            business: { rows: 5, seatsPerRow: 4, seatLetters: "ACDF" },
            firstclass: { rows: 2, seatsPerRow: 2, seatLetters: "AC" } // First Class presente
        };

        const airplaneA = await new Airplane({ airplaneModel: "Airbus A350 Lux", capacity: fullConfigPlane }).save();
        const airplaneB = await new Airplane({ airplaneModel: "Boeing 787 Swift", capacity: fullConfigPlane }).save();

        // Rotte (4 Rotte)
        const routes = await Route.insertMany([
            { airlineId: airlineA._id, departureAirport: getAirID("LIN"), arrivalAirport: getAirID("FCO") }, // LuxAir: MI -> RM
            { airlineId: airlineA._id, departureAirport: getAirID("FCO"), arrivalAirport: getAirID("JFK") }, // LuxAir: RM -> NY
            { airlineId: airlineB._id, departureAirport: getAirID("LIN"), arrivalAirport: getAirID("MUC") }, // Swift: MI -> DE
            { airlineId: airlineB._id, departureAirport: getAirID("MUC"), arrivalAirport: getAirID("JFK") }  // Swift: DE -> NY
        ]);

        // ==========================================
        // VOLI FUTURI (Logica Scalo)
        // ==========================================
        const today = new Date();
        const getFutureDate = (days, hours) => {
            const d = new Date(today);
            d.setDate(d.getDate() + days);
            d.setHours(hours, 0, 0, 0);
            return d;
        };

        const flights = await Flight.insertMany([
            // --- ITINERARIO A (LuxAir via Roma) ---
            {
                flightNumber: "LX100", company: airlineA._id, route: routes[0]._id, airplane: airplaneA._id,
                departureTime: getFutureDate(1, 8), // Domani 08:00
                arrivalTime: getFutureDate(1, 9),   // Domani 09:00 (Arrivo Hub)
                prices: { economy: 100, business: 200, firstclass: 500 }, bookedSeats: []
            },
            {
                flightNumber: "LX200", company: airlineA._id, route: routes[1]._id, airplane: airplaneA._id,
                departureTime: getFutureDate(1, 12), // Domani 12:00 (Partenza Hub) -> 3 ORE DI SCALO
                arrivalTime: getFutureDate(1, 20),
                prices: { economy: 400, business: 900, firstclass: 1500 }, bookedSeats: []
            },

            // --- ITINERARIO B (SwiftFly via Monaco) ---
            {
                flightNumber: "SW500", company: airlineB._id, route: routes[2]._id, airplane: airplaneB._id,
                departureTime: getFutureDate(2, 10), // Dopodomani 10:00
                arrivalTime: getFutureDate(2, 12),   // Dopodomani 12:00 (Arrivo Hub)
                prices: { economy: 80, business: 180, firstclass: 450 }, bookedSeats: []
            },
            {
                flightNumber: "SW600", company: airlineB._id, route: routes[3]._id, airplane: airplaneB._id,
                departureTime: getFutureDate(2, 15), // Dopodomani 15:00 (Partenza Hub) -> 3 ORE DI SCALO
                arrivalTime: getFutureDate(2, 23),
                prices: { economy: 350, business: 850, firstclass: 1400 }, bookedSeats: []
            }
        ]);

        // ==========================================
        //  PRENOTAZIONI (2 Semplici, 2 Scali, Full Optional)
        // ==========================================

        const createBooking = async (user, flightDocs, seatList, travelClass, extras) => {
            const tickets = [];
            let total = 0;

            for (let i = 0; i < flightDocs.length; i++) {
                const fl = flightDocs[i];
                const seat = seatList[i];
                
                // Crea Ticket
                const t = await Ticket.create({
                    user: user._id,
                    flight: fl._id,
                    seat: seat,
                    class: travelClass,
                    extras: extras, // { baggage: true, legroom: true... }
                    price: fl.prices[travelClass] + (extras.baggage ? 30 : 0) // Esempio logica prezzo
                });
                tickets.push(t._id);
                total += t.price;

                // Aggiorna posto occupato nel volo
                await Flight.findByIdAndUpdate(fl._id, { 
                    $push: { bookedSeats: { seat, travelClass } } 
                });
            }

            // Crea Booking Unico
            await Booking.create({
                user: user._id,
                tickets: tickets,
                totalPrice: total,
                status: 'confirmed',
                bookingDate: new Date()
            });
        };

        // 1. Mario: Volo Diretto (Solo andata LIN-FCO), Economy, No Extra
        await createBooking(mario, [flights[0]], ["10A"], "economy", { baggage: false, legroom: false, priorityBoarding: false });

        // 2. Luigi: Volo Diretto (Solo andata LIN-MUC), Business, Full Extra
        await createBooking(luigi, [flights[2]], ["1A"], "business", { baggage: true, legroom: true, priorityBoarding: true });

        // 3. Mario: VIAGGIO CON SCALO (LIN->FCO->JFK), First Class, Full Optional
        // Dimostra la gestione di due biglietti in un solo booking
        await createBooking(mario, [flights[0], flights[1]], ["1C", "2C"], "firstclass", { baggage: true, legroom: true, priorityBoarding: true });

        // 4. Luigi: VIAGGIO CON SCALO (LIN->MUC->JFK), Economy, Solo Bagaglio
        await createBooking(luigi, [flights[2], flights[3]], ["15F", "20D"], "economy", { baggage: true, legroom: false, priorityBoarding: false });

        console.log(' SEED COMPLETATO!');
        console.log('   - 4 Aeroporti (LIN, FCO, MUC, JFK)');
        console.log('   - 2 Compagnie (LuxAir, SwiftFly)');
        console.log('   - 2 Aerei configurati (Eco, Bus, First)');
        console.log('   - 4 Voli (Orari sincronizzati per scalo 3h)');
        console.log('   - 4 Prenotazioni (2 Dirette, 2 Scalo)');

    } catch (err) {
        console.error(' Errore Seed:', err);
    }
};

module.exports = seedDB;