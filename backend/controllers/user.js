const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const emailvalidator = require("email-validator");
const passwordValidator = require("password-validator");

exports.signup = (req, res, next) => {
    // ici -> password validator

    const passwordvalidator = new passwordValidator();
    passwordvalidator.is().min(8).is().max(100).has().not().spaces();
    passwordvalidator.validate(req.body.password); // résultat = true ou false
    if (passwordvalidator === true) {
        bcrypt
            .hash(req.body.password, 10)
            .then((hash) => {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                });

                if (emailvalidator.validate(req.body.email)) {
                    user.save()
                        .then(() =>
                            res
                                .status(201)
                                .json({ message: "Utilisateur créé !" })
                        )
                        .catch((error) => res.status(400).json({ error }));
                } else {
                    res.statusMessage = "L'adresse Email est invalide";
                    res.status(400).end();
                }
            })
            .catch((error) => res.status(500).json({ error }));
    } else {
        res.statusMessage = "Le mot de passe est invalide";
        res.status(400).end();
    }
};
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res
                    .status(401)
                    .json({ error: "Utilisateur non trouvé !" });
            }
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res
                            .status(401)
                            .json({ error: "Mot de passe incorrect !" });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            "RANDOM_TOKEN_SECRET",
                            { expiresIn: "24h" }
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
