const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Recorded sauce !' }) })
        .catch(error => { res.status(400).json({ error }) });
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized request !' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Modified sauce!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error })
        );
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Unauthorized request' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Delete Sauce' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((result) => {

            if (req.body.like === 1 && result.usersLiked.includes(req.body.userId) === false) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: " LIKE => $inc +1 et $push usersLiked !" }))
                    .catch((error) => res.status(400).json({ error }))
            }

            if (req.body.like === -1 && result.usersDisliked.includes(req.body.userId) === false) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "DISLIKE => $inc +1 et $push usersDisliked!" }))
                    .catch((error) => res.status(400).json({ error }))
            }

            if (req.body.like === 0 && result.usersLiked.includes(req.body.userId) === true) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "CANCEL LIKE" }))
                    .catch((error) => res.status(400).json({ error }))
            }

            if (req.body.like === 0 && result.usersDisliked.includes(req.body.userId) === true) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId }
                    }
                )
                    .then(() => res.status(201).json({ message: "CANCEL DISLIKE" }))
                    .catch((error) => res.status(400).json({ error }))
            }
        })
        .catch((error) => res.status(404).json({ error }))
}