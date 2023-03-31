const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {

            //si email est retrouvé alors envoyer un message d'erreur (utilisateur doit créer un email unique) sinon on peut hash le mot de passe
            if (user) {
                return res.status(409).json({ message: 'error' })
            }
            bcrypt.hash(req.body.password, 10)
                .then(hash => {
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                        .then(() => res.status(201).json({ message: 'User created !' }))
                        .catch((error) => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }))
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {

            //Si le user n'est pas trouvé. On renvoie un message d'erreur sinon le user existe et on peut comparer son mot de passe
            if (user === null) {
                return res.status(401).json({ message: 'Email or password incorrect' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Email or password incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};