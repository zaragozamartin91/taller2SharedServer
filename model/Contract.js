/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE CONTRATOS */
// -----------------------------------------------------------------

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.registerSchema = function (db) {
    let ContractSchema = new Schema({
        band: {
            type: Schema.Types.ObjectId,
            ref: 'Band'
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: 'Location'
        },
        /*Campo que guarda la fecha de creacion de la banda*/
        created: {
            type: Date,
            default: Date.now
        },
        /*Campo que guarda la fecha del evento*/
        eventDate: {
            type: Date,
            default: Date.now
        },
        /*Campo que guarda la fecha de caducidad del evento*/
        expirationDate: {
            type: Date,
            default: Date.now
        },
        /*condiciones/descripcion del contrato*/
        description: {
            type: String,
            default: 'Descripcion no disponible'
        },
        cash: {
            type: Number,
            default: 0
        },
        /*estado del contrato: PENDIENTE, ACEPTADO, RECHAZADO*/
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        /*describe el tipo de contrato: hacia una banda o hacia un lugar*/
        type: {
            type: String,
            enum: ['toBand', 'toLocation'],
            required: 'El contrato debe tener un tipo!'
        },
        rejectReason: {
            type: String,
            default: 'Razon no especificada'
        }
    });

    /*busca contratos de una banda.*/
    ContractSchema.statics.findByBandID = function (name, callback) {
        console.log("Buscando contratos de la banda: " + id);
        this.find({
            band: id
        }, callback);
    };

    /*busca contratos de un lugar.*/
    ContractSchema.statics.findByLocationID = function (name, callback) {
        console.log("Buscando contratos de un lugar: " + name);
        this.find({
            location: id
        }, callback);
    };

    ContractSchema.statics.searchByBand = function (bandId, callback) {
        bandId = bandId._id || bandId;

        this.find({
            band: bandId
        }).populate('band').populate('location').exec(callback);
    };

    ContractSchema.statics.searchByLocation = function (locationId, callback) {
        locationId = locationId._id ? locationId._id : locationId;

        this.find({
            location: locationId
        }).populate('band').populate('location').exec(callback);
    };

    /*realiza busqueda de todos los contratos que conciernen a un usuario en particular (relacionados con bandas 
    del usuario y lugares del usuario).*/
    ContractSchema.statics.searchByUser = function (userId, callback) {
        let self = this;
        let Band = db.model('Band');
        let Location = db.model('Location');

        Band.searchByMembers(userId, function (err, bands) {
            Location.searchByOwner(userId, function (err, locations) {
                let queryArray = [];

                bands.forEach(function (band) {
                    queryArray.push({
                        band: band._id
                    });
                });

                locations.forEach(function (location) {
                    queryArray.push({
                        location: location._id
                    });
                });

                self.find({
                    $or: queryArray
                }).populate('band').populate('location').exec(callback);
            });
        });
    };

    /*A post middleware is defined using the post() method of the schema object*/
    /*esta funcion correra despues de ejecutar save() sobre mongo.*/
    ContractSchema.post('save', function (next) {
        if (this.isNew) console.log('Se creo un nuevo contrato!');
        else console.log('Se actualizo un contrato!');
    });

    /*This will force Mongoose to include getters when converting the MongoDB document to a JSON representation and will allow the
    output of documents using res.json(). Tambien habilita los campos virtuales como fullName.*/
    ContractSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de contratos!");
    db.model('Contract', ContractSchema);
};