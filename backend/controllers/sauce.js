const Sauces = require('../models/modelsSauces');
const fs = require('fs');

exports.createsauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauces({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.getOnesauce = (req, res, next) => {
 
  Sauces.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifysauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauces.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
            //const filename = sauce.imageUrl.split('/images/')[1];
              Sauces.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
             /*fs.unlink(`images/${filename}`, () => {
                sauce.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                    .catch(error => res.status(401).json({ error }));
            });*/
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deletesauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};
exports.getAllsauce = (req, res, next) => {
  
  Sauces.find().then(
    function(sauces) {
      res.status(200).json(sauces);
    }
  ).catch(
    function(error) {
      console.log("COucou")
      res.status(400).json({
        error: error
      });
    }
  );
};
// like dislike 
exports.likes = (req, res, next) => {
  console.log("Je passe par -likes-");
  console.log(req.body);
  console.log(req.params);

  /*Sauces.findOne({ _id: req.params.id})
      .then(sauce => {
  
  switch (sauce.usersLiked) {
case '':
      +1

break;
case 'userId':
      -1

break;
case '':
      
break;
    
   });*/

};