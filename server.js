'use strict';

// Application dependencies /express & cors
const express = require('express');
//Origin resource sharing
const cors = require('cors');
//request library
const server = express();
//Application setup
const PORT = process.env.PORT || 3000;
//Dotenv (Read our inviroment variable)
require('dotenv').config();
server.use(cors());
const superagent = require('superagent');
/////////////////////////
///// The routes ///////
///////////////////////

server.get('/', routeHandler);
server.get('/location',locationHandler);
server.get('/weather',weatherHandler);
server.get('/parks', parksRouteHandler);
server.get('*',notFoundHandler);

///////////////////////////////
//// Handeling Functions  ////
/////////////////////////////

function routeHandler(req,res){
  res.send('The server is working , Great job !');
};

function locationHandler (req, res) {
let cityQuery= req.query.city;
let key = process.env.LOCATION_KEY;
let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityQuery}&format=json`;


superagent.get(locationURL).then(geoData => {
  let gData = geoData.body;
 let locationInstance = new Place(cityQuery, gData);
  res.send(locationInstance);
});

}

function weatherHandler (req, res) {
  let cityQuery = req.query.search_query;
  let key = process.env.WEATHER_KEY;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityQuery}&key=${key}`;
  superagent.get(weatherUrl).then(weatherData => {
    let wData = weatherData.body;
    let items = wData.data.map((item, index) =>{
     let description = item.weather.description;
     let validDate = item.valid_date;
     return new Weather(description , validDate);
    } );
    res.send(items);
  });
};


function parksRouteHandler(req, res) {
  // https://developer.nps.gov/api/v1/parks?parkCode=abcd&limit=50
  let cityQuery = req.query.search_query;
  let key = process.env.PARKS_KEY;
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${cityQuery}&api_key=${key}`;
  superagent.get(parkURL).then(parksData => {
    let arr = parksData.body.data.map((item, index) => {
      return new Park(item);
    });
    res.send(arr);
  });
}

// for not found
// function notFoundHandler (req, res){
//   res.status(404).send('Sorry some thing went wrong');
// };
function notFoundHandler(req,res){
  let errorObject = {
      status: 500,
      resText : 'Error 500 , Not Found'
  };
  res.status(500).send(errorObject);
}

/////////////////////
////constructors////
///////////////////

const Place = function (cityName,geoData) {
  this.search_query = cityName;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
};
const Weather = function (desc, dat) {
  this.forecast = desc;
  this.time = dat;
};

const Park = function (parksData) {
  this.name = parksData.fullName;
  this.address = `${parksData.addresses[0].line1}, ${parksData.addresses[0].stateCode}, ${parksData.addresses[0].city}`;
  this.fee = parksData.entranceFees[0].cost;
  this.description = parksData.description;
  this.url = parksData.url;
};
// listen to the server
server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
