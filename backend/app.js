const express = require('express');
const mongoose = require('mongoose');
const sauce = require('./models/modelsSauces');
const app = express();
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const express = require("express");
const helmet = require("helmet");

require('dotenv').config()
console.log(process.env) // remove this after you've confirmed it is working




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ipa:ipA12yeah@cluster0.rpw6gkd.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});
app.use(helmet());
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app; 



