/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE EVENTO */
// -----------------------------------------------------------------
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.registerSchema = function (db) {
    let EventSchema = new Schema({
        name: {
            type: String,
            required: 'El nombre del evento no puede ser vacio!'
        },
        description: {
            type: String,
            default: 'Descripcion no disponible'
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: 'Location'
        },
        /*Campo que guarda la fecha del evento*/
        date: {
            type: Date,
            required: 'La fecha del evento no puede ser vacio!'
        },
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        band: {
            type: Schema.Types.ObjectId,
            ref: 'Band'
        },
    });

    /*busca un unico evento por nombre.*/
    EventSchema.statics.findOneByName = function (name, callback) {
        console.log("Buscando evento: " + name);
        this.findOne({
            name: name
        }, callback);
    };

    /*A post middleware is defined using the post() method of the schema object*/
    /*esta funcion correra despues de ejecutar save() sobre mongo.*/
    EventSchema.post('save', function (next) {
        if (this.isNew) {
            console.log('Se creo un evento nuevo!');
        } else {
            console.log('Se actualizo un evento!');
        }
    });

    EventSchema.statics.searchByOwner = function (owner, callback) {
        if (!owner) return this.find({}, callback);
        
        let ownerId = owner._id ? new ObjectId(owner._id) : new ObjectId(owner);
        this.find({
            owners: {
                $elemMatch: {
                    $eq: ownerId
                }
            }
        }, callback);
    };

    /*Busca todos los eventos*/
    EventSchema.statics.findAllEvents = function (callback) {
        let Event = db.model('Event');
        Event.find({}).sort({ date: 1 }).populate('members').populate('location').populate('band').exec(callback);
    };

    /*This will force Mongoose to include getters when converting the MongoDB document to a JSON representation and will allow the
    output of documents using res.json(). Tambien habilita los campos virtuales como fullName.*/
    EventSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de eventos!");
    db.model('Event', EventSchema);
};
