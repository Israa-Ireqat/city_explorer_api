'use strict';

//Dotenv (Read our inviroment variable)
require('dotenv').config();

// Application dependencies /express & cors
const express = require('express');
//Origin resource sharing
const cors = require('cors');
//request library
const superagent = require('superagent');

//Application setup
const PORT = process.env.PORT || 3000;
const server = express();
server.use(cors());

/////////////////////////
///// The routes ///////
///////////////////////

server.get('/', routeHandeler);
server.get('/location',locationHandeler);
server.get('/weather',weatherHandeler);
server.get('*',notFoundHandeler);

///////////////////////////////
//// Handeling Functions  ////
/////////////////////////////

function routeHandeler(req,res){
  res.send('The server is working , Great job !');
};
////http://localhost:3000/location?city=Lynwood
function locationHandeler (req, res) {
//get the data from Api server (locationIQ)
//send a request using superagent library (request URL && the key)
let cityName = req.query.city;
let  locationKey = 'pk.9655e2b3c22302ad4cf8df3a11cb2d40';
let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${locationKey}&q=${cityName}&format=json`;

  //let locationData = require('./data/location.json');
  //   console.log('server.get   locationData', locationData);
  let cityData = new Place(locationData);
  res.send(cityData);
};
//http:localhost:3000/weather
function weatherHandeler (req, res) {
  let getWeatherData = require('./data/weather.json');

  getWeatherData.data.forEach((item, index) => {
    let description = getWeatherData.data[index].weather.description;
    let vDate = getWeatherData.data[index].valid_date;
    let cityWeather = new Weather(description, vDate);
  });
  res.send(Weather.all);
};
//for not found
function notFoundHandeler (req, res){
  let errObject = {
    status: 500,
    responseText: 'Sorry, something went wrong',
  };
  res.status(500).send(errObject);
};

/////////////////////
////constructors////
///////////////////

const Place = function (locationData) {
  this.search_query = 'Lynwood';
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
};
const Weather = function (desc, dat) {
  this.forecast = desc;
  this.time = dat;
  Weather.all.push(this);
};
Weather.all = [];

// listen to the server
server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
