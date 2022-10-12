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

    Sauces.findOne({ _id: req.params.id }).then((sauce) => {
        let userId = req.body.userId;

        console.log(req.body.like);

        switch (req.body.like) {
            case 1:
                if (sauce.usersLiked.includes(userId) === true) {
                    res.status(400).json({
                        message: "l'utilisateur a deja like",
                    });
                } else {
                    Sauces.updateOne(
                        { _id: req.params.id },
                        { $inc: { likes: 1 }, $push: { usersLiked: userId } }
                    )
                        .then(() => res.status(201).json({ message: "ok" }))
                        .catch((error) => res.status(400).json({ error }));
                }
                break;
            case -1:
                if (sauce.usersDisliked.includes(userId) === true) {
                    res.status(400).json({
                        message: "l'utilisateur a deja dislike",
                    });
                } else {
                    Sauces.updateOne(
                        { sauce },
                        {
                            $inc: { dislikes: 1 },
                            $push: { usersDisliked: userId },
                        }
                    )
                        .then(() => res.status(201).json({ message: "ok" }))
                        .catch((error) => res.status(400).json({ error }));
                }
                break;
            case 0:
                if (sauce.usersLiked.includes(userId) === true) {
                    Sauces.updateOne(
                        { sauce },
                        {
                            $inc: { like: -1 },
                            $pull: { usersLiked: userId },
                        }
                    )
                        .then(() => res.status(201).json({ message: "ok" }))
                        .catch((error) => res.status(400).json({ error }));

                    console.log("case 0 : like");
                } else if (sauce.usersDisliked.includes(userId) === true) {
                    Sauces.updateOne(
                        { sauce },
                        {
                            $inc: { dislikes: -1 },
                            $pull: { usersLiked: userId },
                        }
                    )
                        .then(() => res.status(201).json({ message: "ok" }))
                        .catch((error) => res.status(400).json({ error }));

                    console.log("case 0 : dislike ");
                } else {
                    res.status(400).json({
                        message: "erreur case 0",
                    });
                }
                break;
        }
    });
};
