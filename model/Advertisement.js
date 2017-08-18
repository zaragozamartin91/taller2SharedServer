/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE UN LUGAR/NEGOCIO/BAR */
// -----------------------------------------------------------------
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

exports.registerSchema = function (db) {
    let AdSchema = new Schema({
        /*considero que los nombres de los lugares deben ser unicos...*/
        expiration: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['location', 'band']
        },
        // En StackOverflow se sugiere referenciar a los dos aunque solo se use uno
        band: {
            type: ObjectId,
            ref: 'Band'
        },
        location: {
            type: ObjectId,
            ref: 'Location'
        },
        user: {
            type: ObjectId,
            ref: 'User'
        },
        duration: {
            type: Number
        },
        visibility: {
            type: String,
            enum: ['gold', 'silver']
        }
    });

    AdSchema.statics.findByUser = function (user, callback) {
        console.log("Aviso por usuario: " + user);
        this.find({
            user: user
        }).populate('band').populate('location').exec(callback);
    };

    AdSchema.statics.removeAd = function (id, callback) {
        console.log("Aviso borrado: " + id);
        this.findOneAndRemove({ '_id': id }, callback);
    };

    AdSchema.post('save', function (next) {
        if (this.isNew) console.log('Se creo un ad nuevo!');
        else console.log('Se actualizo un ad!');
    });

    AdSchema.statics.findActiveByVisibility = function (type, callback) {
        console.log("Aviso por usuario: ");
        this.find({
            type: type,
            expiration: { $gte: new Date() }
        }, null, { sort: { visibility: -1 } }).populate('band').populate('location').exec(callback);
    };

    AdSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de avisos!");
    db.model('Ad', AdSchema);
};