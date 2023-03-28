const mongoose = require('mongoose');

require('dotenv').config();

const mongooseKey = process.env.SECRET_KEY

exports.mongooseConnect = mongoose.connect(mongooseKey,
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));
