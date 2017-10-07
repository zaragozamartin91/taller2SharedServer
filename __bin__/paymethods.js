const axios = require('axios');

axios.get('https://shielded-escarpment-27661.herokuapp.com/api/v1/paymethods', {
    headers: { 'Authorization': 'Bearer 994c1464-3f4c-4077-9253-656d32dc88fb' }
}).then(contents => {
    console.log(contents.data);
}).catch(cause => {
    console.error(cause);
}); 