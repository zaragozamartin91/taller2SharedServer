const axios = require('axios');

const okToken = '994c1464-3f4c-4077-9253-656d32dc88fb';

axios.get('https://shielded-escarpment-27661.herokuapp.com/api/v1/paymethods', {
    headers: { 'Authorization': 'Bearer 994c1464-3f4c-4077-9253-656d32dc88fb' }
}).then(contents => {
    console.log(contents.data);
}).catch(cause => {
    console.error(cause.status);
    console.error(cause.respose);
    console.error(cause.res);
    console.error(cause.data);
    console.error(cause.statusCode);
    console.error(cause.res);
    console.error(cause.request.statusCode);
    console.error(cause.request.connection.statusCode);
    console.error(cause.request.res.statusCode);
}); 