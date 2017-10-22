const p1 = Promise.resolve('pepe');
const p2 = Promise.resolve('posting');



// cause.request.res.statusCode
Promise.all([p1, p2]).then(([s1, s2]) => console.log(s1, s2));


const moment = require('moment');
const m = moment('2017-01-01').add(1, 'hour').toDate().getTime();

console.log(m);

function validatePoint({
    address: { street, location: { lat, lon }
    }, timestamp }) {

}

function validateRouteItem({ location: { lat, lon }, timestamp }) {
    
}

function validateTrip({
    id,
    applicationOwner,
    driver,
    passenger,
    start,
    end,
    totalTime,
    waitTime,
    travelTime,
    distance,
    route,
    cost: { currency, value } }) {

    validatePoint(start);
    validatePoint(end);
    route.forEach(validateRouteItem);

    console.log('OK');
}

const TRIP = {
    'id': 'string',
    'applicationOwner': 'string',
    'driver': 'string',
    'passenger': 'string',
    'start': {
        'address': {
            'street': 'string',
            'location': {
                'lat': 0,
                'lon': 0
            }
        },
        'timestamp': 0
    },
    'end': {
        'address': {
            'street': 'string',
            'location': {
                'lat': 0,
                'lon': 0
            }
        },
        'timestamp': 0
    },
    'totalTime': 0,
    'waitTime': 0,
    'travelTime': 0,
    'distance': 0,
    'route': [
        {
            'location': {
                'lat': 0,
                'lon': 0
            },
            'timestamp': 0
        }
    ],
    'cost': {
        'currency': 'string',
        'value': 0
    }
};

try {

    validateTrip(TRIP);
} catch (error) {
    console.log('ERROR');
}