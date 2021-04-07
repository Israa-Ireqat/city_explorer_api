'use strict';
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pg = require('pg');
const server = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL 
    ,ssl: { rejectUnauthorized: false } 
});

server.use(cors());
server.get('/', routeHandeler);
server.get('/location', locationHandeler);
server.get('/weather', weatherHandeler);
server.get('/parks', parkHandeler);
server.get('*', errorHandeler);

//Handelers:

function routeHandeler(request, response) {
  response.status(200).send('you server is alive!!');
}

function locationHandeler(req, res) {
    let cityName = req.query.city;
    let key = process.env.LOCATION_KEY;
    let locationURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
    let sql = `SELECT * FROM locations WHERE search_query = '${cityName}';`;
    client.query(sql)
        .then(result => {
            if (result.rows.length === 0) {
                superagent.get(locationURL)
                    .then(geoData => {
                        let Data = geoData.body;
                        const locationData = new Location(cityName, Data);
                        res.send(locationData);
                        let insertLocationData = `INSERT INTO locations (search_query,formatted_query ,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *;`;
                        let safeValues = [cityName, locationData.formatted_query, locationData.latitude, locationData.longitude];
                        client.query(insertLocationData, safeValues)
                            .then(() => {

                            });
                    }).catch(() => {
                        res.status(505).send('Error: Not Found');
                    });

            } else {
                res.send(result.rows[0]);
            }

        }).catch(error => { res.send(error); });
}

function weatherHandeler(req,res){
    let weahterArray = [];
    let cityName = req.query.search_query;
    let key = process.env.WEATHER_KEY;
    let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}&days=8`;
    superagent.get(weatherURL)
    .then(day =>{
        day.body.data.map(value =>{
            weahterArray.push(new Weather(value));
        });
        res.send(weahterArray);
    });
}

function parkHandeler(req,res){
    let parkArray = [];
    let parkName = req.query.search_query;
    let key = process.env.PARKS_KEY;
    let parkURL = `https://developer.nps.gov/api/v1/parks?q=${parkName}&api_key=${key}`;
    superagent.get(parkURL)
    .then(parkData =>{
        parkData.body.data.forEach(value =>{
            parkArray.push(new Park (value));
        });
        res.send(parkArray);
    });
}

////constructors:
function Location (cityName,geoData) {
    this.search_query = cityName;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
  }

  function Weather(weatherDay) {
    console.log(weatherDay);
    this.description = weatherDay.weather.description;
    this.valid_date = weatherDay.valid_date;
  }

  function Park(parkData) {
    this.name = parkData.name;
    this.address = parkData.address;
    this.free = parkData.free;
    this.description = parkData.description;
    this.url = parkData.url;
  }

  function errorHandeler(req, res) {
    let errObj = {
      status: 500,
      responseText: "Sorry, something went wrong"
    };
    res.status(500).send(errObj);
  }
  client.connect()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`Listening on PORT ${PORT}`);
      });
    });
    //yelps:  https://api.yelp.com/v3/businesses/search
    // let movieURL = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${movieName}`;