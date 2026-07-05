export function getCanineBreeds() {
  return fetch("https://api.thedogapi.com/v1/breeds", {
    method: "GET",
    headers: {
      "x-api-key":
        "live_5svkRgOyWadRJv2cY1CruDv2TtoPMx38PhCFljF5vZ58sqzvCm9c65JFx3p5p2El",
    },
  });
}

export function getCanineByBreed(name) {
  return fetch(`https://api.thedogapi.com/v1/breeds/search?q=${name}`, {
    method: "GET",
    headers: {
      "x-api-key":
        "live_5svkRgOyWadRJv2cY1CruDv2TtoPMx38PhCFljF5vZ58sqzvCm9c65JFx3p5p2El",
    },
  });
}


export function getTrainers(country) {
  return fetch(
    `https://api.overturemapsapi.com/places?country=${country}&categories=dog_trainer`,
    {
      method: "GET",
      headers: {
        "x-api-key":
          "live_1sth67iW2ZEPBUJPxNZ1GFYvtD1qXf3Wv2YX6V7u9priuasmUPCuDLpME8wESlIB",
      },
    },
  );
}

export function getTrainerBuilding(lat, long) {
  return fetch(
    `https://api.overturemapsapi.com/places/buildings?lat=${lat}&lng=${long}&radius=1000&categories=dog_trainer`,
    {
      method: "GET",
      headers: {
        "x-api-key":
          "live_1sth67iW2ZEPBUJPxNZ1GFYvtD1qXf3Wv2YX6V7u9priuasmUPCuDLpME8wESlIB",
      },
    },
  );
}
  
  
export function getMyTrainerWeather(lat, long){
 return fetch(
   `https://pawpoint-backend.onrender.com/api/places/getNewWeatherApi?lat=${lat}&long=${long}`,
   {
     method: "GET",
     headers: {
       accept: "application/json",
       "x-api-key":
         "live_U5nqOYAajrQ7Y8bwYLSVzqVo8cpFWM82B1bAMwiSUdmG0zlbx7ZS4qVmzxaEmbn9",
     },
   },
 );
}

