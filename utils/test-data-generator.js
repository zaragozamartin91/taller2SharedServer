const moment = require('moment');
const Trip = require('../model/Trip');
const distanceMeasurer = require('../utils/distance-measurer');


function random(low, high) {
    return Math.random() * (high - low) + low;
}
exports.random = random;

const MAX_HIGH = 3650;

function randomInt(low = 1, high = 3650) {
    return parseInt(random(low, high));
}
exports.randomInt = randomInt;

const RANDOM_INTS = [];

function uniqueRandomInt(low, high) {
    let ri = randomInt();
    while (RANDOM_INTS.indexOf(ri) >= 0) ri = randomInt();
    RANDOM_INTS.push(ri);
    return ri;
}


function generatePassenger(server) {
    const serverId = server.id || server;
    const ri = uniqueRandomInt();
    let [applicationOwner, username, password, name, surname, country, email, birthdate, images, balance] = [
        serverId,
        `username_${ri}`,
        'pepe',
        `name_${ri}`,
        `surname_${ri}`,
        'Argentina',
        `email_${ri}@accusys.com`,
        moment().subtract(20, 'y').subtract(ri, 'd').toDate(),
        [`image_${ri}`],
        [
            { currency: 'ARS', value: 100 + ri },
            { currency: 'USD', value: ((MAX_HIGH * 2) % ri) + 100 },
            { currency: 'EUR', value: ((MAX_HIGH * 2) % ri) + 33 }
        ]
    ];
    let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type: 'passenger', images, balance };
    return userObj;
}
exports.generatePassenger = generatePassenger;

function measureDistance(start, end) {
    const lat1 = start.address.location.lat;
    const lon1 = start.address.location.lon;
    const lat2 = end.address.location.lat;
    const lon2 = end.address.location.lon;
    return distanceMeasurer.distanceMt(lat1, lon1, lat2, lon2);
}

function generateTrip(server, driver, passenger) {
    const serverId = server.id || server;
    const baseLat = -34.497956;
    const baseLon = -58.534823;
    const dividend = 1000000;

    const randStart = randomInt(1, 30000);
    const randEnd = randomInt(1, 30000);
    const randRoute = randomInt(1, 15000);
    const randStartTime = randomInt(2, 60);

    const startTime = moment().subtract(randStartTime, 'm').toDate().getTime();
    const endTime = moment().toDate().getTime();

    // EL TIEMPO SE MIDE EN SEGUNDOS
    const waitTime = parseInt(randomInt(1, 10) * 60); // Tiempo de espera entre 1 y 10 mins
    const travelTime = parseInt((endTime - startTime) / 1000);
    const totalTime = parseInt(waitTime + travelTime);

    const start = {
        'address': {
            'street': `Start ${randStart}`, 'location': {
                'lat': ((baseLat * dividend) + randStart) / dividend, 'lon': ((baseLat * dividend) + randStart) / dividend
            }
        },
        'timestamp': startTime
    };
    const end = {
        'address': {
            'street': `End ${randEnd}`, 'location': {
                'lat': ((baseLat * dividend) + randEnd) / dividend, 'lon': ((baseLat * dividend) + randEnd) / dividend
            }
        },
        'timestamp': endTime
    };

    // Distancia se mide en metros
    const distance = measureDistance(start, end);

    const route = [{
        "location": { 'lat': ((baseLat * dividend) + randRoute) / dividend, 'lon': ((baseLat * dividend) + randRoute) / dividend },
        "timestamp": moment().subtract(parseInt(randStartTime / 2), 'm').toDate().getTime()
    }];
    const cost = {
        'currency': 'ARS',
        'value': randomInt(1, 150)
    };

    //id, applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, date
    return new Trip(null, serverId, driver.id, passenger.id,
        start, end, totalTime, waitTime, travelTime, distance, route, cost);
}
exports.generateTrip = generateTrip;