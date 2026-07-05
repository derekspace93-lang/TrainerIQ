import css from "./BreedTraitsModal.module.css";
import { ThreeCircles } from "react-loader-spinner";
import loadImg from "../sections/loadImg.png";
import Notiflix from "notiflix";

export const BreedTraitsModal = ({
  isOpen,
  stateSetter,
  traits,
  myTrainerModalStateSetter,
  setSelectedDogBreed,
  trainerModalStateSetter,
}) => {
  const handleInfoClose = () => {
    stateSetter(false);
    myTrainerModalStateSetter(false);
    trainerModalStateSetter(false);
    setSelectedDogBreed(null);
    Notiflix.Notify.info("Dog Breed Unselected");
  };

  const handleTrainerShift = () => {
    const el = document.getElementById("trainer-details");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {isOpen && (
        <div className={css.backDrop}>
          <button className={css.closeModal} onClick={handleInfoClose}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-label="Close"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              <path
                d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"
                style={{
                  fill: "none",
                  stroke: "#ffffff",
                  strokeWidth: 2.75,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
              />
            </svg>
          </button>

          <div className={css.modalWindow}>
            <div className={css.canineInfo}>
              <div className={css.wrapper}>
                <button
                  className={css.wrapperButton}
                  onClick={handleTrainerShift}
                >
                  Select Trainer
                </button>
                <div className={css.imageWrapper}>
                  <img
                    className={css.infoImage}
                    src={traits.image_link}
                    alt={traits.name || "Breed image"}
                  />
                  <div className={css.name}>{traits.name}</div>
                </div>
                <button
                  className={css.wrapperButton}
                  onClick={handleTrainerShift}
                >
                  Select Trainer
                </button>
              </div>

              <div className={css.traitsWrapper}>
                <div>
                  <span>Barking: </span>
                  <span>{traits.barking}/ 5</span>
                </div>
                <div>
                  <span>Coat Length: </span>
                  <span>{traits.coat_length}/ 5</span>
                </div>
                <div>
                  <span>Drooling: </span>
                  <span>{traits.drooling}/ 5</span>
                </div>
                <div>
                  <span>Energy: </span>
                  <span>{traits.energy}/ 5</span>
                </div>
                <div>
                  <span>Good with Children: </span>
                  <span>{traits.good_with_children}/ 5</span>
                </div>
                <div>
                  <span>Good with other dogs: </span>
                  <span>{traits.good_with_other_dogs}/ 5</span>
                </div>
                <div>
                  <span>Good with strangers: </span>
                  <span>{traits.good_with_strangers}/ 5</span>
                </div>
                <div>
                  <span>Grooming: </span>
                  <span>{traits.grooming}/ 5</span>
                </div>
                <div>
                  <span>Playfulness: </span>
                  <span>{traits.playfulness}/ 5</span>
                </div>
                <div>
                  <span>Protectiveness: </span>
                  <span>{traits.protectiveness}/ 5</span>
                </div>
                <div>
                  <span>Shedding: </span>
                  <span>{traits.shedding}/ 5</span>
                </div>
                <div>
                  <span>Trainability: </span>
                  <span>{traits.trainability}/ 5</span>
                </div>
                <div>
                  <span>Max Female Height: </span>
                  <span>{traits.max_height_female} in</span>
                </div>
                <div>
                  <span>Min Female Height: </span>
                  <span>{traits.min_height_female} in</span>
                </div>
                <div>
                  <span>Max Male Height: </span>
                  <span>{traits.max_height_male} in</span>
                </div>
                <div>
                  <span>Min Male Height: </span>
                  <span>{traits.min_height_male} in</span>
                </div>
                <div>
                  <span>Max Female Weight: </span>
                  <span>{traits.max_weight_female} lb</span>
                </div>
                <div>
                  <span>Min Female Weight: </span>
                  <span>{traits.min_weight_female} lb</span>
                </div>
                <div>
                  <span>Max Male Weight: </span>
                  <span>{traits.max_weight_male} lb</span>
                </div>
                <div>
                  <span>Min Male Weight: </span>
                  <span>{traits.min_weight_male} lb</span>
                </div>
                <div>
                  <span>Max Life Expectancy: </span>
                  <span>{traits.max_life_expectancye} years</span>
                </div>
                <div>
                  <span>Min Life Expectancy: </span>
                  <span>{traits.min_life_expectancy} years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
