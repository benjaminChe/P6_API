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
    console.log("userId = " + req.body.userId); // userId
    console.log("typeof like = " + typeof req.body.like); // like type
    console.log("id sauce (req.params) = " + req.params); //id (sauce)

    Sauces.findOne({ _id: req.params.id }).then((sauce) => {
        let userId = req.body.userId;
        let usersLikedTrouve = sauce.usersLiked.find(
            (users) => users === userId
        );
        console.log("sauce : " + sauce);
        console.log("usersLikedTrouve = " + usersLikedTrouve);
        console.log(req.params.id);
        console.log(req.params.id);
        //console.log();

        switch (req.body.like) {
            case 1:
                // if
                Sauces.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: 1 }, $push: { usersLiked: userId } }
                )
                    .then(() => res.status(201).json({ message: "ok" }))
                    .catch((error) => res.status(400).json({ error }));

                console.log("ajout de user dans usersliked");
                break;
            case -1:
                /*dislike +1 */ sauce.updateOne(
                    { sauce },
                    { $inc: { dislikes: 1 } }
                );
                /* ajout de l'user dans userDisliked */ sauce.usersDisliked.push(
                    userId
                );
                console.log("ajout de user dans usersDisliked");
                break;
            case 0:
                if (usersLikedTrouve == userId) {
                    /* like -1*/ sauce.updateOne(
                        { sauce },
                        { $inc: { like: -1 } }
                    );
                    /*user remove de userliked*/ let usersLikedIndex =
                        sauce.usersLiked.indexOf(usersLikedTrouve);
                    console.log(
                        "index of = " +
                            sauce.usersLiked.indexOf(usersLikedTrouve)
                    );
                    sauce.usersLiked.splice(usersLikedIndex, 1);
                    console.log("user remove de usersLiked");
                    console.log("usersLiked = " + sauce.usersLiked);
                } else {
                    /* dislike -1*/ sauce.updateOne(
                        { sauce },
                        { $inc: { dislikes: -1 } }
                    );
                    /*user remove de userDisliked*/ let usersDislikedIndex =
                        sauce.usersDisliked.indexOf(userId);
                    console.log(
                        "index of = " + sauce.usersDisliked.indexOf(userId)
                    );
                    sauce.usersDisliked.splice(usersDislikedIndex, 1);
                    console.log("user remove de userDisliked ");
                    console.log("userDisliked = " + sauce.usersDisliked);
                }
                break;
        }
    });
};
