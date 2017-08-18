/*DEFINE EL SCHEMA Y REGISTRA EL MODELO DE USUARIO */
// -----------------------------------------------------------------

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

/*considero que los nombres de bandas deben ser unicos...*/
exports.registerSchema = function (db) {
    let SongSchema = new Schema({
        name: {
            type: String,
            required: 'El nombre de la cancion no puede ser vacio!'
        },
        /*Campo que guarda la fecha de creacion de la banda*/
        created: {
            type: Date,
            default: Date.now
        },
        genres: [{
            type: String
        }],
        description: {
            type: String,
            default: "Descripcion no disponible"
        },
        band: {
            type: ObjectId,
            ref: 'Band'
        },
        /*nombre del archivo de la cancion*/
        fileName: {
            type: String
        },
        /* duración de una canción */
        duration: {
            type: Number
        },
        /*votos positivos de una cancion. Para evitar que se vote dos veces, se registran quienes dieron votos positivos.*/
        upvotes: [{
            type: ObjectId,
            ref: 'User'
        }],
    });

    /*FALTA TESTEAR SI FUNCIONA...*/
    SongSchema.methods.addUpvote = function (voter, callback) {
        let voterId = voter._id || voter;

        console.log("BUSCANDO VOTANTE " + voterId);
        if (this.upvotes.indexOf(voterId) < 0) {
            console.log("VOTANTE NO ENCONTRADO, AGREGANDO VOTO...");
            this.upvotes.push(voterId);
        } else {
            console.log("USUARIO: " + voterId + " YA VOTO ESTA CANCION!");
        }
    };

    /*busca una unica banda por nombre.*/
    SongSchema.statics.findOneByNameAndBand = function (name, bandId, callback) {
        console.log("BUSCANDO CANCION: " + name);
        this.findOne({
            name: name,
            band: new ObjectId(bandId)
        }, callback);
    };

    /*busca canciones por banda.*/
    SongSchema.statics.searchByBand = function (bandId, callback) {
        console.log("BUSCANDO CANCIONES DE BANDA: " + bandId);
        bandId = bandId._id || bandId;

        this.find({
            band: bandId
        }).populate('band').exec(callback);
    };

    /* Busca canciones de las bandas al que el usuario pertenece */
    SongSchema.statics.searchByMember = function (userId, callback) {
        let self = this;
        let Band = db.model('Band');

        Band.searchByMembers(userId, function (err, bands) {
            let queryArray = [];

            bands.forEach(function (band) {
                queryArray.push({
                    band: band._id
                });
            });

            self.find({
                $or: queryArray
            }).populate('band').exec(callback);
        });
    }

    SongSchema.statics.searchByGenre = function (genre, callback) {
        if (!genre || genre == "*" || genre == "any") return this.find({}).populate('band').exec(callback);

        genre = genre.toLowerCase();
        this.find({
            genres: {
                $elemMatch: {
                    $eq: genre
                }
            }
        }).populate('band').exec(callback);
    };

    SongSchema.statics.searchByName = function (name, callback) {
        if (!name || name == "*" || name == "any") return this.find({}).populate('band').exec(callback);
        this.find({
            name: new RegExp(name, 'i')
        }).populate('band').exec(callback);
    };

    SongSchema.statics.searchByBandName = function (bandName, callback) {
        let self = this;
        let Band = db.model('Band');

        if (!bandName || bandName == "*" || bandName == "any") {
            this.find({}).populate('band').exec(callback);
        } else {
            Band.findOne({
                name: new RegExp(bandName, 'i')
            }, function (err, band) {
                if (!band) {
                    return callback(null, []);
                }

                console.log("BUSCANDO CANCIONES DE BANDA: ");
                console.log(band);
                self.find({
                    band: band._id
                }).populate('band').exec(callback);
            });
        }
    };

    SongSchema.statics.searchByLike = function (userId, callback) {
        let uid = userId._id || userId;

        this.find({
            upvotes: {
                $elemMatch: {
                    $eq: uid
                }
            }
        }).populate('band').exec(callback);
    };

    SongSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de canciones!");
    db.model('Song', SongSchema);
};