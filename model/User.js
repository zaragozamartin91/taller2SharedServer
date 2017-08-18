const _ = require('underscore');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

exports.registerSchema = function (db) {
    let UserSchema = new Schema({
        name: String,
        email: {
            type: String,
            /*The usage of a match validator here will make sure the email field value matches the given regex expression*/
            match: [/.+\@.+\..+/, "Ingrese una direccion de correo valida!"],
            unique: 'Ya existe un usuario con este correo!',
            required: 'La direccion de correo no puede ser vacia!'
        },
        password: {
            type: String,
            /*Defining a custom validator is done using the validate property. The validate property value should be an array consisting of 
            a validation function and an error message.*/
            validate: [password => password && password.length >= 4,
                'Password debe contener al menos 4 caracteres...'
            ],
            required: 'Se debe ingresar un password!'
        },
        /*Guarda la fecha de creacion del usuario*/
        created: {
            type: Date,
            default: Date.now
        },
        /*generos favoritos del usuario*/
        genres: [{
            type: String
        }],
    });

    UserSchema.statics.findOneById = function (plainId, callback) {
        this.findOne({
            _id: new ObjectId(plainId)
        }, callback);
    };

    /*To add a static method, you will need to declare it as a member of your schema's statics property*/
    /**
     * @param {string} email El correo del usuario registrado.
     * @param {function} callback (err,user) => void : Funcion a invocar cuando el usuario
     * haya sido encontrado. user==null si no existe.
     */
    UserSchema.statics.findOneByEmail = function (email, callback) {
        this.findOne({
            email: email
        }, callback);
    };

    /*Busca las bandas correspondientes a un usuario*/
    UserSchema.statics.findBands = function (plainUserId, callback) {
        let Band = db.model('Band');

        Band.find({
            members: {
                $elemMatch: {
                    $eq: plainUserId
                }
            }
        }).populate('members').exec(callback);
    };

    /*Busca los lugares correspondientes a un usuario*/
    UserSchema.statics.findLocations = function (plainUserId, callback) {
        let Location = db.model('Location');

        Location.find({
            members: {
                $elemMatch: {
                    $eq: plainUserId
                }
            }
        }).populate('members').exec(callback);
    };

    /*Busca los eventos correspondientes a un usuario*/
    UserSchema.statics.findEvents = function (userId, callback) {
        let Event = db.model('Event');
        let id = userId._id || userId;

        Event.find({
            members: {
                $elemMatch: {
                    $eq: id
                }
            }
        }).populate('members').populate('location').populate('band').exec(callback);
    };

    /*To add an instance method, you will need to declare it as a member of your schema's methods property*/
    /*accepts a string argument, hashes it, and compares it to the current user's hashed password*/
    UserSchema.methods.authenticate = function (pass) {
        let hash = this.password;
        let isValid = bcrypt.compareSync(pass, hash);
        return isValid;
    };

    /* busca fanaticos de una banda */
    UserSchema.statics.searchBandFans = function (bandId, callback) {
        let Song = db.model('Song');

        Song.searchByBand(bandId, function (err, songs) {
            if (err) return callback(err, { error: err });

            let fans = [];
            let objectIds = [];

            _.each(songs, function (song) {
                fans = _.union(fans, song.upvotes);
            });

            // _.each(fans, function(fan){
            //     objectIds.push(new ObjectId(fan));
            // });

            return callback(err, fans);
        });
    };


    /*pre-save middleware to handle the hashing of your users' passwords.*/
    UserSchema.pre('save', function (next) {
        if (this.password) {
            let hash = bcrypt.hashSync(this.password, 10);
            this.password = hash;
        }
        next();
    });


    /*A post middleware is defined using the post() method of the schema object*/
    /*esta funcion correra despues de ejecutar save() sobre mongo.*/
    UserSchema.post('save', function (newUser) {
        if (this.isNew) console.log('Se creo un usuario nuevo!');
        else console.log('Se actualizo un usuario!');
    });

    /*This will force Mongoose to include getters when converting the MongoDB document to a JSON representation and will allow the
    output of documents using res.json(). Tambien habilita los campos virtuales como fullName.*/
    UserSchema.set('toJSON', {
        getters: true,
        virtuals: true
    });

    console.log("Registrando modelo de usuario!");
    db.model('User', UserSchema);
    /*you defined your UserSchema object using the Schema constructor, and then you used the schema
    instance to define your User model.*/
};