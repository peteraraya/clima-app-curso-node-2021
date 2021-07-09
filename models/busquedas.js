const fs = require('fs');

const { default: axios } = require("axios");

class Busquedas {

  historial = [];
  dbPath = './db/database.json';

  constructor() {
    // leer db si existe
    this.leerDB();
  }


  get historialCapitalizador() {
    // capitalizar cada  palabra
    return this.historial.map(lugar => {
      let palabras = lugar.split(' ');
      palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
      return palabras.join(' ');

    });
  }

  get paramsMapBox() {
    return {
      'access_token': process.env.MAPBOX_KEY,
      'limit': 5,
      'language': 'es'
    }
  }

  get paramsOpenWeather() {
    return {
      'appid': process.env.OPENWEATHER_KEY,
      'units': 'metric',
      'lang': 'es'
    }
  }

  async ciudad(lugar = '') {

    try {

      // Petición http
      const intance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapBox
      });

      const resp = await intance.get();
      return resp.data.features.map(lugar => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));


    } catch (error) {
      return [];
    }

  }

  async climaPorLugar(lat, lon) {

    try {
      // Petición http
      // intance axios.create();
      const intance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon }
      });

      // respuesta.data
      const resp = await intance.get();

      const { weather, main } = resp.data;
      console.log(weather)

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      }

    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = '') {

    //prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    // solo mantener 6 registros
    this.historial = this.historial.splice(0, 5);


    this.historial.unshift(lugar.toLocaleLowerCase());


    // Grabar en DB
    this.guardarDB();

  }

  guardarDB() {

    const payload = {
      historial: this.historial
    };
    // guardams en BD
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));

  }

  leerDB() {

    // Debe existir
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf8' });
    const data = JSON.parse(info);
    // cargar información
    this.historial = data.historial;




  }




}





module.exports = Busquedas;