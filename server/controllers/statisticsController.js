const Flight = require('../models/Flight');
const Ticket = require('../models/Ticket');
const Route = require('../models/Routes');
const Booking = require('../models/Booking');

// GET: Statistiche per compagnie aeree
exports.getAirlineStatistics = async (req, res) => {
    try {
        // Solo airline e admin possono vedere le statistiche
        if (req.auth.role !== 'airline' && req.auth.role !== 'admin') {
            return res.status(403).json({ 
                error: true, 
                errormessage: "Solo le compagnie aeree possono visualizzare le statistiche" 
            });
        }

        const { dateFrom, dateTo, flightNumber } = req.query;
        
        // Se è admin, può specificare quale compagnia vedere
        let companyId = req.auth.id;

        if (req.auth.role === 'admin' && req.query.companyId) {
            companyId = req.query.companyId;
        }

        // Costruisco il filtro per i voli
        let flightFilter = { 
            company: companyId,
            active: true 
        };

        // Filtro per numero di volo
        if (flightNumber) {
            flightFilter.flightNumber = { $regex: flightNumber, $options: 'i' };
        }

        // Filtro per data
        if (dateFrom || dateTo) {
            flightFilter.departureTime = {};
            if (dateFrom) {
                flightFilter.departureTime.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                flightFilter.departureTime.$lte = new Date(dateTo);
            }
        }

        // Trova tutti i voli della compagnia
        const flights = await Flight.find(flightFilter)
            .populate('route')
            .populate('airplane');

        if (flights.length === 0) {
            return res.status(200).json({
                message: "Nessun volo trovato per i filtri specificati",
                statistics: {
                    totalFlights: 0,
                    totalPassengers: 0,
                    totalRevenue: 0,
                    averagePassengersPerFlight: 0,
                    averageRevenuePerFlight: 0,
                    flightStatistics: [],
                    routeStatistics: []
                }
            });
        }

        const flightIds = flights.map(f => f._id);

        // Trova tutti i biglietti per questi voli
        const tickets = await Ticket.find({ 
            flight: { $in: flightIds } 
        }).populate('flight');

        // Calcolo statistiche generali
        const totalPassengers = tickets.length;
        const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
        const averagePassengersPerFlight = totalPassengers / flights.length;
        const averageRevenuePerFlight = totalRevenue / flights.length;

        // Statistiche per singolo volo
        const flightStatistics = flights.map(flight => {
            const flightTickets = tickets.filter(t => 
                t.flight._id.toString() === flight._id.toString()
            );
            
            const passengers = flightTickets.length;
            const revenue = flightTickets.reduce((sum, t) => sum + t.price, 0);
            
            // Calcolo tasso di riempimento
            const totalCapacity = flight.airplane?.totalSeats || 0;
            const occupancyRate = totalCapacity > 0 
                ? ((passengers / totalCapacity) * 100).toFixed(2) 
                : 0;

            return {
                flightId: flight._id,
                flightNumber: flight.flightNumber,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                route: {
                    from: flight.route?.departureAirport,
                    to: flight.route?.arrivalAirport
                },
                passengers: passengers,
                revenue: revenue,
                capacity: totalCapacity,
                occupancyRate: `${occupancyRate}%`,
                averageTicketPrice: passengers > 0 ? (revenue / passengers).toFixed(2) : 0
            };
        });

        // Statistiche per rotta (le più richieste)
        const routeMap = new Map();
        
        for (const ticket of tickets) {
            const flight = ticket.flight;
            const routeId = flight.route.toString();
            
            if (!routeMap.has(routeId)) {
                const routeDoc = await Route.findById(routeId)
                    .populate('departureAirport')
                    .populate('arrivalAirport');
                
                routeMap.set(routeId, {
                    routeId: routeId,
                    from: routeDoc?.departureAirport,
                    to: routeDoc?.arrivalAirport,
                    passengers: 0,
                    revenue: 0,
                    flights: 0
                });
            }
            
            const routeStats = routeMap.get(routeId);
            routeStats.passengers += 1;
            routeStats.revenue += ticket.price;
        }

        // Conto i voli per rotta
        for (const flight of flights) {
            const routeId = flight.route.toString();
            if (routeMap.has(routeId)) {
                routeMap.get(routeId).flights += 1;
            }
        }

        // Converto la mappa in array e ordino per numero di passeggeri
        const routeStatistics = Array.from(routeMap.values())
            .map(route => ({
                ...route,
                averagePassengersPerFlight: route.flights > 0 
                    ? (route.passengers / route.flights).toFixed(2) 
                    : 0,
                averageRevenuePerFlight: route.flights > 0 
                    ? (route.revenue / route.flights).toFixed(2) 
                    : 0
            }))
            .sort((a, b) => b.passengers - a.passengers);

        return res.status(200).json({
            message: "Statistiche recuperate con successo",
            statistics: {
                totalFlights: flights.length,
                totalPassengers: totalPassengers,
                totalRevenue: totalRevenue.toFixed(2),
                averagePassengersPerFlight: averagePassengersPerFlight.toFixed(2),
                averageRevenuePerFlight: averageRevenuePerFlight.toFixed(2),
                flightStatistics: flightStatistics,
                routeStatistics: routeStatistics
            }
        });

    } catch (err) {
        console.error("Error fetching statistics:", err);
        return res.status(500).json({ 
            error: true, 
            errormessage: "Errore durante il recupero delle statistiche",
            details: err.message 
        });
    }
};


module.exports = {
    getAirlineStatistics,
    getRouteStatistics
};