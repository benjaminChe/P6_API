const Sauces = require("../models/modelsSauces");
const fs = require("fs");

exports.createsauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauces({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
    });

    sauce
        .save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.getOnesauce = (req, res, next) => {
    Sauces.findOne({
        _id: req.params.id,
    })
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

exports.modifysauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            } else {
                const sauceObject = req.file
                    ? {
                          ...JSON.parse(req.body.sauce),
                          imageUrl: `${req.protocol}://${req.get(
                              "host"
                          )}/images/${req.file.filename}`,
                      }
                    : { ...req.body };
                delete sauceObject._userId;

                const filename = sauce.imageUrl.split("/images/")[1];
                Sauces.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() => {
                        if (req.file) {
                            fs.unlink(`images/${filename}`, () => {});
                        }
                        res.status(200).json({ message: "Objet modifié!" });
                    })
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deletesauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce
                        .deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !",
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};
exports.getAllsauce = (req, res, next) => {
    Sauces.find()
        .then(function (sauces) {
            res.status(200).json(sauces);
        })
        .catch(function (error) {
            res.status(400).json({
                error: error,
            });
        });
};

exports.like = (req, res, next) => {
    console.log("Je passe par -likes-");
    console.log(req.body.userId); // userId
    console.log(typeof req.body.like); // like type
    console.log(req.params); //id (sauce)

    Sauces.findOne({ _id: req.params.id }).then((sauce) => {
        let userId = req.body.userId;

        console.log(sauce);
        console.log(sauce.usersLiked.find((user) => user === userId));

        let usersLikedTrouve = sauce.usersLiked.find((user) => user === userId);
        let usersDislikedTrouve = sauce.usersDisliked.find(
            (user) => user === userId
        );
        switch (req.body.like) {
            case 1:
                /*like +1 */ sauce.update({ like }, { $inc: { like: 1 } });
                /* ajout de l'user dans userliked */ usersLiked.push(userId);
                break;
            case -1:
                /*dislike +1 */ sauce.update(
                    { dislikes },
                    { $inc: { dislikes: 1 } }
                );
                /* ajout de l'user dans userDisliked */ usersDisliked.push(
                    userId
                );
                break;
            case 0:
                if (usersLikedTrouve == userId) {
                    /* like -1*/ sauce.update({ like }, { $inc: { like: -1 } });
                    /*user remove de userliked*/ let usersLikedIndex =
                        usersLiked.indexOf(req.body.userId);
                    usersLiked.slice(usersLikedIndex, 1);
                } else {
                    /* dislike -1*/ sauce.update(
                        { dislikes },
                        { $inc: { dislikes: -1 } }
                    );
                    /*user remove de userDisliked*/ let usersDislikedIndex =
                        usersDisliked.indexOf(req.body.userId);
                    usersDisliked.slice(usersDislikedIndex, 1);
                }
                break;
        }
    });
};
