const Sauce = require('../models/sauce');
const fs = require('fs');



exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(404).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,

    });
    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregitrée" }))
        .catch((error) => res.status(400).json({ error }));

};

exports.modifySauce = (req, res, next) => {

    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Pas d'autorisation" });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Objet modifié!" }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => res.status(400).json({ error }));

};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Pas d'aurisation" });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Objet supprimé !" }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
}

exports.likeDislikeSauce = (req, res, next) => {
    let like = req.body.like
    let userId = req.body.userId
    let sauceId = req.params.id
    console.log(req.body)

    Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
            console.log(sauce)

            if (!sauce.usersLiked.includes(userId) && like === 1) {

                Sauce.updateOne(
                    { _id: sauceId },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: userId }
                    }
                )

                    .then(() => res.status(201).json({ message: "J'aime" }))
                    .catch(error => res.status(400).json({ error }));
            };

            if (sauce.usersLiked.includes(userId) && like === 0) {

                Sauce.updateOne(
                    { _id: sauceId },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: userId }
                    }
                )

                    .then(() => res.status(201).json({ message: "Neutre" }))
                    .catch(error => res.status(400).json({ error }));
            };

            if (!sauce.usersDisliked.includes(userId) && like === -1) {

                Sauce.updateOne(
                    { _id: sauceId },
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: userId }
                    }
                )

                    .then(() => res.status(201).json({ message: "Je n'aime pas" }))
                    .catch(error => res.status(400).json({ error }));
            };
            if (sauce.usersDisliked.includes(userId) && like === 0) {

                Sauce.updateOne(
                    { _id: sauceId },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: userId }
                    }
                )

                    .then(() => res.status(201).json({ message: "Neutre" }))
                    .catch(error => res.status(400).json({ error }));
            };

        })
        .catch(error => res.status(500).json({ error }));


}