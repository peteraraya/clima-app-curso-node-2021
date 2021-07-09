require('dotenv').config();
const axios = require("axios");
const { leerInput, inquirerMenu, pausa, ListarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");


const main = async () => {

  // Creamos instancia
  const busquedas = new Busquedas();

  let opt;

  do {

    opt = await inquirerMenu();
    // console.log({ opt });

    switch (opt) {
      case 1:
        // Mostrar mensaje
        const termino = await leerInput('Ciudad : ');

        // Buscar el lugares 
        const lugares = await busquedas.ciudad(termino);

        // Seleccionar el lugar
        const idSel = await ListarLugares(lugares);
        // prevenir error al cancelar
        if (idSel === '0') continue;

        const lugarSel = lugares.find(l => l.id === idSel);

        // guardar en BD 
        busquedas.agregarHistorial(lugarSel.nombre);


        const { nombre: nombreCiudad, lng, lat } = lugarSel;

        // Clima
        const clima = await busquedas.climaPorLugar(lat, lng);

        // Tendremos los datos del clima
        const { desc, min, max, temp } = clima;

        // Mostrar resultados
        console.log('\nInformación de la ciudad\n'.green);
        console.log('Ciudad : ' + nombreCiudad.green);
        console.log('Lat    : ' + lat);
        console.log('Lng    : ' + lng);
        console.log('Temperatura : ' + temp);
        console.log('Minima      : ' + min);
        console.log('Maxima      : ' + max);
        console.log('Como está el clima : ' + desc.green);

        break;


      case 2:
        busquedas.historialCapitalizador.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;


    }


    if (opt !== 0) await pausa();

  } while (opt !== 0);








}



main();