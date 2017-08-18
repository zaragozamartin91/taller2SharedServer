/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE USUARIO */
// -----------------------------------------------------------------

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*considero que los nombres de los lugares deben ser unicos...*/
exports.registerSchema = function (db) {
    let LocationSchema = new Schema({
        name: {
            type: String,
            unique: 'Ya existe un lugar con ese nombre!',
            required: 'El nombre del lugar no puede ser vacio!'
        },
        address: {
            type: String,
            required: 'La direccion del lugar no puede ser vacio!'
        },
        location: {
            type: String,
            required: 'La localidad del lugar no puede ser vacio!'
        },
        /*Campo que guarda la fecha de creacion del lugar*/
        created: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String,
            default: 'Descripcion no disponible'
        },
        genres: [{
            type: String
        }],
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    });

    /*busca un unico lugar por nombre.*/
    LocationSchema.statics.findOneByName = function (name, callback) {
        console.log("Buscando lugar: " + name);
        this.findOne({
            name: new RegExp(name, 'i')
        }, callback);
    };

    /*A post middleware is defined using the post() method of the schema object*/
    /*esta funcion correra despues de ejecutar save() sobre mongo.*/
    LocationSchema.post('save', function (next) {
        if (this.isNew) console.log('Se creo un lugar nuevo!');
        else console.log('Se actualizo un lugar!');
    });

    LocationSchema.statics.searchByOwner = function (owner, callback) {
        if (!owner) return this.find({}, callback);
        
        let ownerId = owner._id || owner;
        this.find({
            members: {
                $elemMatch: {
                    $eq: ownerId
                }
            }
        }, callback);
    };

    /*This will force Mongoose to include getters when converting the MongoDB document to a JSON representation and will allow the
    output of documents using res.json(). Tambien habilita los campos virtuales como fullName.*/
    LocationSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de lugares!");
    db.model('Location', LocationSchema);
};