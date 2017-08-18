const mongooseConfig = require('./mongoose-config');

mongooseConfig.config(true, db => {
    let User = db.model('User');
    let Band = db.model('Band');

    var name = 't';
    let query = User.find({ name: new RegExp(`.*${name}.*`, "i") }, 'name email');
    query.exec((err, data) => {
        if (err) return console.error(err);
        let pairs = data.map(d => { return { name: d.name, email: d.email }; });
        console.log(pairs);
    });

//    User.find({ name: new RegExp(`.*${name}.*`, "i") }, (err, data) => {
//        if (err) return console.error(err);
//        console.log(data);
//    });
});