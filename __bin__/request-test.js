const axios = require('axios');

axios.post('http://localhost:5000/api/v1/token', {
    username: 'mateo',
    password: 'posting'
}).then(function (response) {
    console.log(response.data);
    const token = response.data.token.token;
    postServer(token, 'super server', 'mateo-96954');
}).catch(function (error) {
    console.log(error);
});


function postServer(token, name, createdBy) {
    axios.post(`http://localhost:5000/api/v1/servers?token=${token}`, { name, createdBy })
        .then(function (response) {
            console.log(response.data);
        }).catch(function (error) {
            console.log(error);
        });
}