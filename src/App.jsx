import React from "react";
import { useState, useEffect } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import Breeds from "./sections/Breeds";
import TrainerDetails from "./sections/Trainer Details";
import Footer from './sections/Footer';
import dogBreeds from "../src/sections/allDogs.json";

const App = () => {

  const [canineTraits, setSelectedDogBreed] = useState(null);
  const [traitsModalState, setTraitsModalState] = useState(false);
  const [myTrainerModalState, setMyTrainerModalState] = useState();
  const [trainerModalState, setTrainerModalState] = useState();
  
  const handleDogBreedSelect = (evt) => {
      setTraitsModalState(true);
  
      dogBreeds.map((breed) => {
        if (breed.name === evt.target.value) {
          console.log(breed);
          setSelectedDogBreed(breed);
        }
      })
    
    evt.target.value = "Select a Dog Breed";
  
    /*
         const el = document.getElementById("trainer-details");
         if (el) {
           el.scrollIntoView({ behavior: "smooth", block: "start" });
         }
         */
      
    }



  return (
    <div className="container mx-auto max-w-7xl">
      <Navbar />
      <Hero />
      <Breeds
        canineTraits={canineTraits}
        handleDogBreedSelect={handleDogBreedSelect}
        traitsModalState={traitsModalState}
        setTraitsModalState={setTraitsModalState}
        myTrainerModalStateSetter={setMyTrainerModalState}
        setSelectedDogBreed={setSelectedDogBreed}
        trainerModalStateSetter={setTrainerModalState}
      />
      <TrainerDetails
        canineTraits={canineTraits}
        myTrainerModalState={myTrainerModalState}
        myTrainerModalStateSetter={setMyTrainerModalState}
        trainerModalState={trainerModalState}
        trainerModalStateSetter={setTrainerModalState}
      />
      <Footer />
    </div>
  );
};

export default App;
