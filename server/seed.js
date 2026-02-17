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
        console.log('🔄 Avvio pulizia e popolamento DB avanzato...');

        // ============================================
        // 1. PULIZIA DATABASE
        // ============================================
        await Promise.all([
            Booking.deleteMany({}),
            Ticket.deleteMany({}),
            Flight.deleteMany({}),
            Route.deleteMany({}),
            Airplane.deleteMany({}),
            Airport.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log(' Database pulito');

        // ADMIN
        const admin = new User({ email: "admin@bauflights.com", role: "admin" });
        admin.setPassword("123456");

        const passengers = [];
        const passengerData = [
            { name: "Mario", surname: "Rossi", email: "mario.rossi@email.com", birthdate: "1990-05-20", phone: "+393331234567", address: "Via Roma 1, Milano" },
            { name: "Laura", surname: "Bianchi", email: "laura.bianchi@email.com", birthdate: "1985-08-15", phone: "+393337654321", address: "Via Verdi 10, Roma" },
            { name: "Giuseppe", surname: "Verdi", email: "giuseppe.verdi@email.com", birthdate: "1992-03-10", phone: "+393339876543", address: "Corso Italia 25, Torino" },
            { name: "Anna", surname: "Ferrari", email: "anna.ferrari@email.com", birthdate: "1988-11-30", phone: "+393335556677", address: "Via Napoli 5, Bologna" },
            { name: "Luca", surname: "Moretti", email: "luca.moretti@email.com", birthdate: "1995-07-22", phone: "+393334445566", address: "Via Milano 12, Firenze" },
            { name: "Sofia", surname: "Colombo", email: "sofia.colombo@email.com", birthdate: "1991-01-05", phone: "+393338889900", address: "Via Torino 8, Venezia" },
            { name: "Marco", surname: "Ricci", email: "marco.ricci@email.com", birthdate: "1987-09-18", phone: "+393332223344", address: "Via Bologna 3, Napoli" },
            { name: "Giulia", surname: "Romano", email: "giulia.romano@email.com", birthdate: "1993-12-25", phone: "+393336667788", address: "Via Firenze 7, Genova" },
            { name: "Francesco", surname: "Gallo", email: "francesco.gallo@email.com", birthdate: "1989-04-14", phone: "+393331112233", address: "Via Venezia 15, Palermo" },
            { name: "Chiara", surname: "Conti", email: "chiara.conti@email.com", birthdate: "1994-06-08", phone: "+393339998877", address: "Via Genova 20, Bari" }
        ];

        for (const data of passengerData) {
            const passenger = new User({
                email: data.email,
                role: "passenger",
                name: data.name,
                surname: data.surname,
                birthdate: new Date(data.birthdate),
                phonenumber: data.phone,
                paymentAddress: data.address
            });
            passenger.setPassword("123456");
            passengers.push(passenger);
        }

        const airlines = [];
        const airlineData = [
            { email: "info@bauairlines.com", company: "Bau Airlines" },
            { email: "info@skywings.com", company: "Sky Wings" },
            { email: "info@eurofly.com", company: "EuroFly" },
            { email: "info@italianair.com", company: "Italian Air" }
        ];

        for (const data of airlineData) {
            const airline = new User({ 
                email: data.email, 
                role: "airline", 
                company: data.company 
            });
            airline.setPassword("123456");
            airlines.push(airline);
        }

        await Promise.all([
            admin.save(),
            ...passengers.map(p => p.save()),
            ...airlines.map(a => a.save())
        ]);
        console.log('✅ Utenti creati:', {
            admin: 1,
            passengers: passengers.length,
            airlines: airlines.length
        });

      
        const airportsData = [
            // Italia
            { code: "LIN", name: "Milano Linate", city: "Milano", country: "Italia" },
            { code: "MXP", name: "Milano Malpensa", city: "Milano", country: "Italia" },
            { code: "FCO", name: "Roma Fiumicino", city: "Roma", country: "Italia" },
            { code: "VCE", name: "Venezia Marco Polo", city: "Venezia", country: "Italia" },
            { code: "NAP", name: "Napoli Capodichino", city: "Napoli", country: "Italia" },
            { code: "BGY", name: "Bergamo Orio al Serio", city: "Bergamo", country: "Italia" },
            
            // Europa
            { code: "CDG", name: "Charles de Gaulle", city: "Parigi", country: "Francia" },
            { code: "ORY", name: "Orly", city: "Parigi", country: "Francia" },
            { code: "LHR", name: "Heathrow", city: "Londra", country: "Regno Unito" },
            { code: "FRA", name: "Frankfurt", city: "Francoforte", country: "Germania" },
            { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Paesi Bassi" },
            { code: "MAD", name: "Barajas", city: "Madrid", country: "Spagna" },
            { code: "BCN", name: "El Prat", city: "Barcellona", country: "Spagna" },
            
            // USA
            { code: "JFK", name: "John F. Kennedy", city: "New York", country: "USA" },
            { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA" },
            { code: "MIA", name: "Miami International", city: "Miami", country: "USA" }
        ];
        const airports = await Airport.insertMany(airportsData);
        console.log('✅ Aeroporti creati:', airports.length);

        // Helper per prendere gli ID velocemente
        const getAirportId = (code) => airports.find(a => a.code === code)._id;

        const airplanesData = [
            {
                airplaneModel: "Boeing 737-800",
                capacity: {
                    economy: { rows: 20, seatsPerRow: 6, seatLetters: "ABCDEF" },
                    business: { rows: 5, seatsPerRow: 4, seatLetters: "ACDF" },
                    firstclass: { rows: 0, seatsPerRow: 0, seatLetters: "" }
                }
            },
            {
                airplaneModel: "Airbus A320",
                capacity: {
                    economy: { rows: 22, seatsPerRow: 6, seatLetters: "ABCDEF" },
                    business: { rows: 4, seatsPerRow: 4, seatLetters: "ACDF" },
                    firstclass: { rows: 0, seatsPerRow: 0, seatLetters: "" }
                }
            },
            {
                airplaneModel: "Boeing 777-300ER",
                capacity: {
                    economy: { rows: 30, seatsPerRow: 9, seatLetters: "ABCDEFGHJ" },
                    business: { rows: 8, seatsPerRow: 6, seatLetters: "ABCDEF" },
                    firstclass: { rows: 2, seatsPerRow: 4, seatLetters: "ACDF" }
                }
            },
            {
                airplaneModel: "Airbus A350",
                capacity: {
                    economy: { rows: 28, seatsPerRow: 9, seatLetters: "ABCDEFGHJ" },
                    business: { rows: 7, seatsPerRow: 6, seatLetters: "ABCDEF" },
                    firstclass: { rows: 3, seatsPerRow: 4, seatLetters: "ACDF" }
                }
            },
            {
                airplaneModel: "Embraer E190",
                capacity: {
                    economy: { rows: 15, seatsPerRow: 4, seatLetters: "ACDF" },
                    business: { rows: 3, seatsPerRow: 4, seatLetters: "ACDF" },
                    firstclass: { rows: 0, seatsPerRow: 0, seatLetters: "" }
                }
            }
        ];

        const airplanes = [];
        for (const data of airplanesData) {
            const airplane = new Airplane(data);
            await airplane.save();
            airplanes.push(airplane);
        }
        console.log('✅ Aerei creati:', airplanes.length);

      
        const routes = [];
        
        // Definizione rotte per compagnia
        const routesConfig = [
            // Bau Airlines - Focus su Italia e Europa
            { airline: 0, from: "LIN", to: "FCO" },
            { airline: 0, from: "FCO", to: "LIN" },
            { airline: 0, from: "LIN", to: "CDG" },
            { airline: 0, from: "CDG", to: "LIN" },
            { airline: 0, from: "FCO", to: "JFK" },
            { airline: 0, from: "JFK", to: "FCO" },
            { airline: 0, from: "VCE", to: "LHR" },
            { airline: 0, from: "LHR", to: "VCE" },
            
            // Sky Wings - Competitor principale
            { airline: 1, from: "LIN", to: "FCO" },
            { airline: 1, from: "FCO", to: "LIN" },
            { airline: 1, from: "MXP", to: "CDG" },
            { airline: 1, from: "CDG", to: "MXP" },
            { airline: 1, from: "FCO", to: "MAD" },
            { airline: 1, from: "MAD", to: "FCO" },
            { airline: 1, from: "LIN", to: "AMS" },
            { airline: 1, from: "AMS", to: "LIN" },
            
            // EuroFly - Focus Europa
            { airline: 2, from: "MXP", to: "FRA" },
            { airline: 2, from: "FRA", to: "MXP" },
            { airline: 2, from: "BGY", to: "BCN" },
            { airline: 2, from: "BCN", to: "BGY" },
            { airline: 2, from: "NAP", to: "CDG" },
            { airline: 2, from: "CDG", to: "NAP" },
            
            // Italian Air - Focus intercontinentale
            { airline: 3, from: "FCO", to: "JFK" },
            { airline: 3, from: "JFK", to: "FCO" },
            { airline: 3, from: "FCO", to: "LAX" },
            { airline: 3, from: "LAX", to: "FCO" },
            { airline: 3, from: "MXP", to: "MIA" },
            { airline: 3, from: "MIA", to: "MXP" }
        ];

        for (const config of routesConfig) {
            const route = await Route.create({
                airlineId: airlines[config.airline]._id,
                departureAirport: getAirportId(config.from),
                arrivalAirport: getAirportId(config.to)
            });
            routes.push(route);
        }
        console.log('✅ Rotte create:', routes.length);

        // ============================================
        // 6. VOLI CON DATE DISTRIBUITE
        // ============================================
        const today = new Date();
        
        // Helper per creare date
        const getDate = (daysOffset, hour, minute) => {
            const d = new Date(today);
            d.setDate(d.getDate() + daysOffset);
            d.setHours(hour, minute, 0, 0);
            return d;
        };

        // Helper per trovare rotta
        const findRoute = (airlineIndex, fromCode, toCode) => {
            return routes.find(r => 
                r.airlineId.toString() === airlines[airlineIndex]._id.toString() &&
                airports.find(a => a._id.toString() === r.departureAirport.toString()).code === fromCode &&
                airports.find(a => a._id.toString() === r.arrivalAirport.toString()).code === toCode
            );
        };

        const flights = [];

        // VOLI PASSATI (per statistiche storiche) - 30 giorni fa
        const pastFlights = [
            { 
                num: "BAU100", airline: 0, from: "LIN", to: "FCO", 
                dep: getDate(-30, 8, 0), arr: getDate(-30, 9, 30),
                airplane: 0, prices: { economy: 50, business: 150, firstclass: 300, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 }}
            },
            { 
                num: "BAU200", airline: 0, from: "FCO", to: "JFK", 
                dep: getDate(-30, 13, 0), arr: getDate(-30, 22, 0),
                airplane: 2, prices: { economy: 400, business: 900, firstclass: 1500, extras: { baggage: 50, legroom: 20, priorityBoarding: 20 }}
            },
            { 
                num: "SKY555", airline: 1, from: "LIN", to: "FCO", 
                dep: getDate(-25, 10, 0), arr: getDate(-25, 11, 30),
                airplane: 1, prices: { economy: 55, business: 160, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 }}
            },
            { 
                num: "SKY200", airline: 1, from: "MXP", to: "CDG", 
                dep: getDate(-20, 14, 0), arr: getDate(-20, 15, 30),
                airplane: 1, prices: { economy: 60, business: 180, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 }}
            }
        ];

        for (const config of pastFlights) {
            const route = findRoute(config.airline, config.from, config.to);
            const flight = await Flight.create({
                flightNumber: config.num,
                company: airlines[config.airline]._id,
                prices: config.prices,
                departureTime: config.dep,
                arrivalTime: config.arr,
                airplane: airplanes[config.airplane]._id,
                route: route._id,
                bookedSeats: [] // Verranno aggiunti con i ticket
            });
            flights.push(flight);
        }

        // VOLI FUTURI (per prenotazioni)
        const futureFlights = [
            // Domani
            { 
                num: "BAU100", airline: 0, from: "LIN", to: "FCO", 
                dep: getDate(1, 8, 0), arr: getDate(1, 9, 30),
                airplane: 0, prices: { economy: 50, business: 150, firstclass: 300, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 }}
            },
            { 
                num: "BAU200", airline: 0, from: "FCO", to: "JFK", 
                dep: getDate(1, 13, 0), arr: getDate(1, 22, 0),
                airplane: 2, prices: { economy: 400, business: 900, firstclass: 1500, extras: { baggage: 50, legroom: 20, priorityBoarding: 20 }}
            },
            { 
                num: "SKY555", airline: 1, from: "LIN", to: "FCO", 
                dep: getDate(1, 10, 0), arr: getDate(1, 11, 30),
                airplane: 1, prices: { economy: 55, business: 160, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 }}
            },
            { 
                num: "BAU300", airline: 0, from: "LIN", to: "CDG", 
                dep: getDate(1, 15, 0), arr: getDate(1, 16, 30),
                airplane: 0, prices: { economy: 70, business: 180, firstclass: 0, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 }}
            },
            { 
                num: "SKY200", airline: 1, from: "MXP", to: "CDG", 
                dep: getDate(1, 14, 0), arr: getDate(1, 15, 30),
                airplane: 1, prices: { economy: 60, business: 180, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 }}
            },
            
            // Dopodomani
            { 
                num: "BAU102", airline: 0, from: "LIN", to: "FCO", 
                dep: getDate(2, 8, 0), arr: getDate(2, 9, 30),
                airplane: 0, prices: { economy: 45, business: 140, firstclass: 280, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 }}
            },
            { 
                num: "EF100", airline: 2, from: "MXP", to: "FRA", 
                dep: getDate(2, 11, 0), arr: getDate(2, 12, 30),
                airplane: 4, prices: { economy: 65, business: 170, firstclass: 0, extras: { baggage: 20, legroom: 12, priorityBoarding: 8 }}
            },
            { 
                num: "ITA500", airline: 3, from: "FCO", to: "JFK", 
                dep: getDate(2, 16, 0), arr: getDate(3, 1, 0),
                airplane: 3, prices: { economy: 450, business: 1000, firstclass: 1800, extras: { baggage: 60, legroom: 25, priorityBoarding: 25 }}
            },
            
            // Tra una settimana
            { 
                num: "BAU100", airline: 0, from: "LIN", to: "FCO", 
                dep: getDate(7, 8, 0), arr: getDate(7, 9, 30),
                airplane: 0, prices: { economy: 50, business: 150, firstclass: 300, extras: { baggage: 30, legroom: 15, priorityBoarding: 10 }}
            },
            { 
                num: "SKY555", airline: 1, from: "LIN", to: "FCO", 
                dep: getDate(7, 10, 0), arr: getDate(7, 11, 30),
                airplane: 1, prices: { economy: 55, business: 160, firstclass: 0, extras: { baggage: 25, legroom: 10, priorityBoarding: 10 }}
            },
            { 
                num: "ITA600", airline: 3, from: "FCO", to: "LAX", 
                dep: getDate(7, 18, 0), arr: getDate(8, 5, 0),
                airplane: 3, prices: { economy: 500, business: 1100, firstclass: 2000, extras: { baggage: 60, legroom: 25, priorityBoarding: 25 }}
            }
        ];

        for (const config of futureFlights) {
            const route = findRoute(config.airline, config.from, config.to);
            const flight = await Flight.create({
                flightNumber: config.num,
                company: airlines[config.airline]._id,
                prices: config.prices,
                departureTime: config.dep,
                arrivalTime: config.arr,
                airplane: airplanes[config.airplane]._id,
                route: route._id,
                bookedSeats: []
            });
            flights.push(flight);
        }

        console.log('✅ Voli creati:', flights.length);

        // ============================================
        // 7. TICKETS E BOOKINGS (Per statistiche)
        // ============================================
        
        // Creiamo prenotazioni per i voli passati (per avere statistiche)
        const bookings = [];
        const tickets = [];

        // Helper per creare biglietto
        const createTicket = async (userId, flightId, seat, travelClass, extras = {}) => {
            const ticket = new Ticket({
                user: userId,
                flight: flightId,
                seat: seat,
                class: travelClass,
                extras: {
                    baggage: extras.baggage || false,
                    legroom: extras.legroom || false,
                    priorityBoarding: extras.priorityBoarding || false
                },
                price: 0 // Verrà calcolato dal pre-save hook
            });
            await ticket.save();
            
            // Aggiorna bookedSeats nel volo
            const flight = await Flight.findById(flightId);
            flight.bookedSeats.push({
                seat: seat,
                travelClass: travelClass
            });
            await flight.save();
            
            return ticket;
        };

        // Prenotazioni per voli passati (STATISTICHE)
        // Volo BAU100 passato (-30 giorni) - Alta occupazione
        for (let i = 0; i < 5; i++) {
            const ticket = await createTicket(
                passengers[i]._id,
                flights[0]._id,
                `${i + 1}A`,
                'economy',
                { baggage: i % 2 === 0 }
            );
            tickets.push(ticket);
            
            const booking = await Booking.create({
                user: passengers[i]._id,
                tickets: [ticket._id],
                totalPrice: ticket.price,
                status: 'used',
                bookingDate: getDate(-35, 12, 0)
            });
            bookings.push(booking);
        }

        // Business class sul volo passato
        for (let i = 5; i < 7; i++) {
            const ticket = await createTicket(
                passengers[i]._id,
                flights[0]._id,
                `${i - 4}C`,
                'business',
                { baggage: true, legroom: true, priorityBoarding: true }
            );
            tickets.push(ticket);
            
            const booking = await Booking.create({
                user: passengers[i]._id,
                tickets: [ticket._id],
                totalPrice: ticket.price,
                status: 'used',
                bookingDate: getDate(-35, 14, 0)
            });
            bookings.push(booking);
        }

        // Volo intercontinentale passato (-30 giorni) - BAU200 FCO-JFK
        for (let i = 0; i < 8; i++) {
            const ticket = await createTicket(
                passengers[i]._id,
                flights[1]._id,
                `${i + 1}A`,
                'economy',
                { baggage: true, legroom: i % 2 === 0 }
            );
            tickets.push(ticket);
            
            const booking = await Booking.create({
                user: passengers[i]._id,
                tickets: [ticket._id],
                totalPrice: ticket.price,
                status: 'used',
                bookingDate: getDate(-35, 10, 0)
            });
            bookings.push(booking);
        }

        // First class sul volo intercontinentale
        const firstClassTicket = await createTicket(
            passengers[8]._id,
            flights[1]._id,
            '1A',
            'firstclass',
            { baggage: true, legroom: true, priorityBoarding: true }
        );
        tickets.push(firstClassTicket);
        
        const firstClassBooking = await Booking.create({
            user: passengers[8]._id,
            tickets: [firstClassTicket._id],
            totalPrice: firstClassTicket.price,
            status: 'used',
            bookingDate: getDate(-35, 11, 0)
        });
        bookings.push(firstClassBooking);

        // Prenotazioni competitor SKY555 passato
        for (let i = 0; i < 4; i++) {
            const ticket = await createTicket(
                passengers[i]._id,
                flights[2]._id,
                `${i + 1}A`,
                'economy'
            );
            tickets.push(ticket);
            
            const booking = await Booking.create({
                user: passengers[i]._id,
                tickets: [ticket._id],
                totalPrice: ticket.price,
                status: 'used',
                bookingDate: getDate(-28, 9, 0)
            });
            bookings.push(booking);
        }

        // Prenotazioni per voli FUTURI (per testare cancellazioni)
        // Volo domani BAU100 - Alcune prenotazioni confermate
        for (let i = 0; i < 3; i++) {
            const ticket = await createTicket(
                passengers[i]._id,
                flights[4]._id, // BAU100 domani
                `${i + 10}A`,
                'economy',
                { baggage: i === 0 }
            );
            tickets.push(ticket);
            
            const booking = await Booking.create({
                user: passengers[i]._id,
                tickets: [ticket._id],
                totalPrice: ticket.price,
                status: 'confirmed',
                bookingDate: getDate(-5, 15, 0)
            });
            bookings.push(booking);
        }

        // Una prenotazione CANCELLATA sul volo di domani
        const cancelledTicket = await createTicket(
            passengers[3]._id,
            flights[4]._id,
            '15B',
            'economy'
        );
        tickets.push(cancelledTicket);
        
        // Rimuoviamo il posto dal volo perché è stato cancellato
        const flightToUpdate = await Flight.findById(flights[4]._id);
        flightToUpdate.bookedSeats = flightToUpdate.bookedSeats.filter(
            bs => bs.seat !== '15B'
        );
        await flightToUpdate.save();
        
        const cancelledBooking = await Booking.create({
            user: passengers[3]._id,
            tickets: [cancelledTicket._id],
            totalPrice: cancelledTicket.price,
            status: 'cancelled',
            bookingDate: getDate(-7, 10, 0)
        });
        bookings.push(cancelledBooking);

        // Prenotazione andata-ritorno (SCALO)
        const outboundTicket = await createTicket(
            passengers[4]._id,
            flights[4]._id, // BAU100 LIN-FCO domani
            '20C',
            'business',
            { baggage: true, legroom: true }
        );
        tickets.push(outboundTicket);

        const returnTicket = await createTicket(
            passengers[4]._id,
            flights[5]._id, // BAU200 FCO-JFK domani
            '5D',
            'business',
            { baggage: true, legroom: true, priorityBoarding: true }
        );
        tickets.push(returnTicket);

        const roundTripBooking = await Booking.create({
            user: passengers[4]._id,
            tickets: [outboundTicket._id, returnTicket._id],
            totalPrice: outboundTicket.price + returnTicket.price,
            status: 'confirmed',
            bookingDate: getDate(-10, 18, 0)
        });
        bookings.push(roundTripBooking);

        console.log('Bookings creati:', bookings.length);
        console.log('Tickets creati:', tickets.length);

        console.log(' Seeding completato con successo!');
    } catch (error) {
        console.error('ERRORE DURANTE IL SEEDING:', error);
        console.error('Stack trace:', error.stack);
    }
};

module.exports = seedDB;