/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE USUARIO */
// -----------------------------------------------------------------
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*considero que los nombres de bandas deben ser unicos...*/
exports.registerSchema = function (db) {
    let BandSchema = new Schema({
        name: {
            type: String,
            unique: 'Ya existe una banda con ese nombre!',
            required: 'El nombre de la banda no puede ser vacio!'
        },
        /*Campo que guarda la fecha de creacion de la banda*/
        created: {
            type: Date,
            default: Date.now
        },
        genres: [{
            type: String
        }],
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        description: {
            type: String,
            default: 'Descripcion no disponible'
        }
    });

    /*busca una unica banda por nombre.*/
    BandSchema.statics.findOneByName = function (name, callback) {
        console.log("BUSCANDO BANDA: " + name);
        this.findOne({
            name: name
        }, callback);
    };

    BandSchema.statics.searchByGenre = function (genre, callback) {
        if (!genre || genre == "*" || genre == "any") return this.find({}, callback);
        genre = genre.toLowerCase();
        this.find({
            genres: {
                $elemMatch: {
                    $eq: genre
                }
            }
        }, callback);
    };

    /*busca bandas a las que un usuario determinado pertenece*/
    BandSchema.statics.searchByMembers = function (userId, callback) {
        userId = userId._id || userId;
        this.find({
            members: {
                $elemMatch: {
                    $eq: userId
                }
            }
        }, callback);
    };

    /*A post middleware is defined using the post() method of the schema object*/
    /*esta funcion correra despues de ejecutar save() sobre mongo.*/
    BandSchema.post('save', function (next) {
        if (this.isNew) console.log('SE CREO UNA BANDA NUEVA!');
        else console.log('SE ACTUALIZO UNA BANDA!');
    });

    /*This will force Mongoose to include getters when converting the MongoDB document to a JSON representation and will allow the
    output of documents using res.json(). Tambien habilita los campos virtuales como fullName.*/
    BandSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de bandas!");
    db.model('Band', BandSchema);
};