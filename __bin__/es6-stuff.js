const flow = require('nimble');

flow.series([
    callback => {
        callback();
        console.log('hola');
    }
]);

