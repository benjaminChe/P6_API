const express = require('express');
const Thing = require('./models/thing');
const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<ben>:<XtlOwwkmAgifnrS3>@clusterprojet6oc.g0j2o3u.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close()
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

})
app.use((req, res) => {
  res.json({ message: 'Votre requête !' }); 
});
app.post('/api/stuff', (req, res, next) => {
   delete req.body._id;
   const thing = new Thing({
     ...req.body
   });
   thing.save()
     .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
     .catch(error => res.status(400).json({ error }));
 });
 app.use('/api/stuff', (req, res, next) => {
   Thing.find()
     .then(things => res.status(200).json(things))
     .catch(error => res.status(400).json({ error }));
 });
 

module.exports = app; 