import css from './Trainer Details.module.css';
import { useState, useEffect } from "react";
import { Particles } from "../components/Particles";
import { getTrainers, getTrainerBuilding } from "./Endpoints/Endpoints";
import { ThreeCircles } from "react-loader-spinner";
import { MyTrainersModal } from "../components/myTrainersModal";
import { TrainersModal } from "../components/TrainersModal";
import countries from './countries.json'
import dogTrainers from "./dogTrainers.json";
import Notiflix from "notiflix";
import trainerImg from './trainerImg.png'
import area from "@turf/area";
import { getMyTrainerWeather } from "./Endpoints/Endpoints";


const TrainerDetails = ({
  canineTraits,
  myTrainerModalState,
  myTrainerModalStateSetter,
  trainerModalState,
  trainerModalStateSetter,
}) => {
  const [trainersModalState, setTrainersModalState] = useState();
  const [canineImage, setCanineImage] = useState({});
  const [canineImages, setCanineImages] = useState([]);
  const [myTrainerPlace, setMyTrainerPlace] = useState({});
  const [myTrainerArea, setMyTrainerArea] = useState("");
  const [myTrainerPlaces, setMyTrainerPlaces] = useState([]);
  const [trainerPlace, setTrainerPlace] = useState({});
  const [trainerPlaces, setTrainerPlaces] = useState([]);
  const [areTrainersLoading, setTrainersLoadingStatus] = useState(false);
  const [areTrainersLoadingError, setTrainersLoadingError] = useState(false);
  const [isTrainerLoading, setTrainerLoadingStatus] = useState(false);
  const [isTrainerLoadingError, setTrainerLoadingError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isWeatherLoading, setWeatherLoadingStatus] = useState(false);
  const [isWeatherError, setWeatherError] = useState(false);
  const [weatherDetails, setMyWeatherDetails] = useState(null);
  const [trainerDetails, setTrainerDetails] = useState(null);

  /**
   * Calculates how suitable a dog training facility is for a
   * particular breed under the current weather conditions.
   *
   * PARAMETERS
   * ----------
   *
   * breed
   * -------
   * Dog information returned by the API Ninjas Dog API.
   *
   * weather
   * --------
   * Current weather object returned by AccuWeather.
   *
   * buildingArea
   * ------------
   * Building footprint area in square metres (m²).
   *
   * RETURNS
   * -------
   *
   * {
   *   score          : Overall suitability score (0-100)
   *   requiredSpace  : Estimated minimum indoor space required (m²)
   *   breakdown      : Individual component scores
   * }
   */

  function calculateTrainerSuitability(breed, weather, buildingArea) {
    // ======================================================
    // MODEL CONSTANTS
    // ======================================================
    //
    // These constants define the behaviour of the TrainerIQ
    // scoring model.
    //
    // They are intentionally placed together so they can be
    // adjusted in one location without searching through the
    // entire function.
    //
    // None of these values come directly from API Ninjas,
    // AccuWeather or Overture Maps.
    //
    // Instead they are heuristic values chosen to produce
    // realistic rankings of dog training facilities.
    //
    // As TrainerIQ collects real-world usage data,
    // these values can be fine-tuned without changing the
    // underlying algorithm.
    //

    const BASE_SPACE = 30;

    //
    // Every dog requires some minimum amount of space,
    // regardless of breed.
    //
    // This allows room to:
    //
    // • stand comfortably
    // • walk
    // • turn around
    // • heel
    // • perform basic obedience exercises
    //
    // Without this constant,
    // very small breeds could receive unrealistically
    // tiny required-space estimates.
    //

    const SPACE_PER_KG = 4;

    //
    // Larger dogs naturally require more space because of
    // their larger body size,
    // longer stride length,
    // wider turning radius,
    // and greater movement during training.
    //
    // Every additional kilogram increases the estimated
    // indoor training space by approximately 4 m².
    //
    // This multiplier is a heuristic value.
    //

    const SPACE_PER_ENERGY_LEVEL = 25;

    //
    // Weight alone does not determine how much room
    // a dog needs.
    //
    // Highly energetic breeds require substantially more
    // movement than calmer breeds.
    //
    // For example:
    //
    // Border Collies
    // Australian Shepherds
    // Belgian Malinois
    //
    // typically require much larger exercise areas than
    // Bulldogs of similar weight.
    //
    // Every increase in the API Ninjas Energy score
    // (1-5)
    //
    // adds approximately 25 m² to the required training
    // space.
    //
    // This gives behaviour a significant influence
    // while still allowing physical size to remain the
    // primary determinant.
    //

    const IDEAL_TEMP_MIN = 10;
    const IDEAL_TEMP_MAX = 30;

    //
    // Dogs generally perform most comfortably within
    // this temperature range.
    //
    // This is considered ideal outdoor training weather.
    //

    const EXTREME_TEMP_MIN = 5;
    const EXTREME_TEMP_MAX = 35;

    //
    // Temperatures outside this range increase the risk of:
    //
    // • overheating
    // • cold stress
    // • fatigue
    // • reduced training performance
    //

    const FACILITY_WEIGHT = 0.5;
    const WEATHER_WEIGHT = 0.2;
    const SIZE_WEIGHT = 0.2;
    const TRAINABILITY_WEIGHT = 0.1;

    //
    // Final suitability score weightings.
    //
    // Facility Size (50%)
    // -------------------
    //
    // Physical space is considered the single most
    // important factor.
    //
    // Even under perfect weather,
    // an undersized facility cannot safely train
    // large or energetic dogs.
    //
    // Weather (20%)
    // -------------
    //
    // Outdoor conditions affect safety,
    // comfort,
    // and training effectiveness.
    //
    // Size Compatibility (20%)
    // ------------------------
    //
    // Smaller breeds generally adapt more easily
    // to smaller indoor environments.
    //
    // Trainability (10%)
    // ------------------
    //
    // Easier-to-train breeds adapt more quickly,
    // but this should never outweigh the importance
    // of adequate space or suitable weather.
    //

    // ======================================================
    // WEATHER ICON SUITABILITY SCORES
    // ======================================================
    //
    // AccuWeather represents every weather condition
    // using a numeric WeatherIcon.
    //
    // Example:
    //
    // 1 = Sunny
    // 6 = Mostly Cloudy
    // 12 = Rain
    // 15 = Thunderstorm
    //
    // AccuWeather only tells us WHAT the weather is.
    //
    // It does NOT indicate whether the weather is good
    // or bad for dog training.
    //
    // Therefore TrainerIQ converts each icon into its own
    // suitability score.
    //
    // Score Meaning
    // -------------
    //
    // 1.00 = Ideal
    //
    // 0.90 = Excellent
    //
    // 0.75 = Good
    //
    // 0.50 = Acceptable
    //
    // 0.25 = Poor
    //
    // 0.10 = Dangerous
    //
    // These values are heuristic estimates and can
    // be refined as more training data becomes available.
    //

    const weatherIconScores = {
      // Perfect conditions

      1: 1.0,
      2: 1.0,
      30: 1.0,
      31: 1.0,
      33: 1.0,
      34: 1.0,

      // Slight cloud cover

      3: 0.95,
      4: 0.95,
      35: 0.95,
      36: 0.95,

      // Mostly cloudy

      5: 0.9,
      6: 0.9,
      7: 0.85,
      8: 0.85,

      // Fog

      11: 0.6,

      // Light rain

      12: 0.5,
      13: 0.45,
      14: 0.45,

      // Heavy rain

      18: 0.3,
      39: 0.25,
      40: 0.25,

      // Thunderstorms

      15: 0.1,
      16: 0.1,
      17: 0.1,
      41: 0.1,
      42: 0.1,

      // Snow

      19: 0.2,
      20: 0.2,
      21: 0.2,
      22: 0.1,
      23: 0.1,

      // Ice / Freezing Rain

      24: 0.05,
      25: 0.05,
      26: 0.05,
      29: 0.05,
    };

    // ======================================================
    // BREED CHARACTERISTICS
    // ======================================================

    //
    // API Ninjas provides weight ranges instead of
    // a single representative value.
    //
    // To estimate a typical adult weight,
    // the average of the male and female minimum
    // and maximum weights is calculated.
    //

    const avgWeightLb =
      (breed.min_weight_male +
        breed.max_weight_male +
        breed.min_weight_female +
        breed.max_weight_female) /
      4;

    //
    // API Ninjas uses pounds.
    //
    // Building areas are measured in square metres.
    //
    // Converting to kilograms keeps all physical
    // measurements within the metric system,
    // making later calculations more consistent.
    //

    const avgWeightKg = avgWeightLb * 0.45359237;

    //The same thing is done for height

    const avgHeightIn =
      (breed.min_height_male +
        breed.max_height_male +
        breed.min_height_female +
        breed.max_height_female) /
      4;

    const avgHeightM = avgHeightIn * 0.0254;

    //
    // Energy ranges from:
    //
    // 1 = Very low energy
    // 5 = Extremely energetic
    //

    const energyLevel = breed.energy;

    // ======================================================
    // REQUIRED TRAINING SPACE
    // ======================================================

    //
    // HEIGHT-ADJUSTED BODY SIZE
    //
    // Height is used to MODIFY weight instead of being
    // added as another independent variable?
    //
    // Both weight and height describe the physical size of a
    // dog and are therefore strongly correlated.
    //
    // In general:
    //
    // • heavier dogs tend to be taller
    // • taller dogs tend to weigh more
    //
    // If height were added directly to the Required Space
    // equation alongside weight, the dog's physical size
    // would effectively be counted twice.
    //
    // Example:
    //
    // Required Space =
    //
    // Base Space
    // +
    // Weight Contribution
    // +
    // Height Contribution
    // +
    // Energy Contribution
    //
    // In this formulation, a tall, heavy dog would receive
    // additional space from BOTH its weight and its height,
    // even though those measurements largely describe the
    // same physical characteristic.
    //
    // This is known as double-counting and can cause the
    // model to overestimate the space requirements of larger
    // breeds.
    //
    //
    // Instead, height is treated as a refinement of weight.
    //
    // Weight remains the primary indicator of body size,
    // while height acts as a scaling factor that adjusts
    // how much influence weight has on the required space.
    //
    // This recognises that dogs with similar weights may
    // still move differently because of differences in
    // their height and body proportions.
    //
    // Examples:
    //
    // Bulldog
    // ----------
    // Heavy body
    // Short legs
    // Compact stride
    //
    // Greyhound
    // ----------
    // Similar weight
    // Much taller
    // Longer stride
    // Larger movement envelope
    //
    // Although these breeds may weigh roughly the same,
    // the Greyhound generally requires more space during
    // movement because of its greater height and longer
    // stride length.
    //
    // Height therefore increases the effective body size
    // without becoming an entirely separate contributor.
    //
    // The heightFactor ranges from approximately 1.0 for
    // shorter breeds to around 1.3 for the tallest breeds.
    //
    // Consequently:
    //
    // • shorter dogs receive little or no adjustment
    // • taller dogs receive a modest increase
    //
    // This keeps weight as the dominant measure of body
    // size while allowing height to improve the realism of
    // the space estimation.
    //
    // Mathematically:
    //
    // Effective Body Mass =
    //
    // Average Weight × Height Factor
    //
    // where
    //
    // Height Factor =
    //
    // 1 +
    // (Average Height / Height Reference)
    // × Height Influence
    //
    const HEIGHT_REFERENCE = 0.75;
    const HEIGHT_INFLUENCE = 0.3;

    const heightFactor = 1 + (avgHeightM / HEIGHT_REFERENCE) * HEIGHT_INFLUENCE;

    const effectiveBodyMass = avgWeightKg * heightFactor;
    //
    //
    // SIDE NOTE AND EXPLANATION OF CONSTANTS:-
    // -------------------------------------------------
    // Height Factor
    //
    //
    // Height Factor is a scaling coefficient that adjusts
    // the dog's average body weight according to its
    // average height.
    //
    // Formula:
    //
    // Height Factor =
    //
    // 1 +
    // (Average Height / Height Reference)
    // × Height Influence
    //
    // WHY IS THE FORMULA WRITTEN THIS WAY?
    //
    //
    // The objective is not to make taller dogs dominate
    // the Required Space calculation.
    //
    // Instead, height should act as a refinement of body
    // weight because body weight already captures most of
    // the dog's overall physical size.
    //
    // Therefore, Height Factor is designed as a multiplier
    // that remains close to 1.0, allowing height to make
    // only a modest adjustment to the dog's Effective Body
    // Mass.
    //
    // A value of:
    //
    // 1.00
    //
    // means height has no influence and the Effective Body
    // Mass is equal to the dog's average body weight.
    //
    // Values greater than 1.00 gradually increase the
    // influence of body weight as the dog's height
    // increases.
    //
    //
    // WHY START WITH "1 +"?
    //
    //
    // The constant "1" represents the baseline case where
    // no height adjustment is applied.
    //
    // If the adjustment term were zero:
    //
    // Height Factor = 1
    //
    // therefore:
    //
    // Effective Body Mass = Average Body Weight
    //
    // Adding the height adjustment to 1 ensures that
    // height only enhances the influence of body weight
    // rather than replacing or reducing it.
    //
    //
    // WHY DIVIDE BY HEIGHT_REFERENCE?
    //
    //
    // Average Height is measured in metres.
    //
    // Dividing by HEIGHT_REFERENCE converts height into a
    // dimensionless ratio, allowing dogs of different
    // heights to be compared consistently regardless of
    // their actual measurement units.
    //
    // HEIGHT_REFERENCE is defined as:
    //
    // 0.75 metres
    //
    // This value was selected because it represents the
    // approximate shoulder height of a large adult dog,
    // rather than an extreme or exceptionally tall breed.
    //
    // Most domestic dogs fall within the following ranges:
    //
    // • Small breeds: 0.20–0.35 m
    // • Medium breeds: 0.35–0.55 m
    // • Large breeds: 0.55–0.75 m
    // • Giant breeds: 0.75–1.00 m
    //
    // Using 0.75 m as the reference means that a typical
    // large breed has a normalised height close to 1.0,
    // while smaller breeds produce values below 1.0 and
    // giant breeds produce values slightly above 1.0.
    //
    // This provides a more representative scaling across
    // the majority of domestic dog breeds than using the
    // absolute maximum observed height.
    //
    // For example:
    //
    // 0.30 m dog
    //
    // becomes:
    //
    // 0.30 / 0.75 = 0.40
    //
    // while:
    //
    // 0.60 m dog
    //
    // becomes:
    //
    // 0.60 / 0.75 = 0.80
    //
    // and:
    //
    // 0.90 m dog
    //
    // becomes:
    //
    // 0.90 / 0.75 = 1.20
    //
    // This normalisation ensures that the scaling behaves
    // consistently across dogs of different sizes while
    // remaining centred around the heights most commonly
    // encountered in practice.
    //
    //
    // WHY IS HEIGHT_INFLUENCE 0.30?
    //
    //
    // HEIGHT_INFLUENCE determines how strongly height is
    // allowed to modify body weight.
    //
    // It is intentionally limited to 0.30 (30%) so that
    // body weight remains the primary indicator of the
    // dog's physical size.
    //
    // A larger value (such as 0.80 or 1.00) would allow
    // height to dominate the Effective Body Mass
    // calculation and would begin to double-count the
    // dog's physical dimensions.
    //
    // Conversely, a much smaller value (such as 0.05)
    // would make height almost insignificant and fail to
    // distinguish between breeds that have similar weights
    // but noticeably different body proportions.
    //
    // Through heuristic testing, a value of 0.30 was found
    // to provide a balanced compromise:
    //
    // • Weight remains the primary determinant of required
    //   training space.
    //
    // • Height refines the estimate without becoming an
    //   independent contributor.
    //
    // • Taller breeds receive a realistic increase in
    //   Effective Body Mass without producing excessively
    //   large space estimates.
    //
    //
    // EXAMPLE
    //
    //
    // Suppose:
    //
    // Average Height = 0.60 m
    //
    // Height Reference = 0.75 m
    //
    // Height Influence = 0.30
    //
    // Height Factor =
    //
    // 1 +
    // (0.60 / 0.75) × 0.30
    //
    // = 1 + 0.80 × 0.30
    //
    // = 1.24
    //
    // This means the dog's Effective Body Mass becomes
    // approximately 24% larger than its actual body
    // weight, reflecting the additional movement envelope,
    // stride length and turning radius associated with a
    // taller body frame during training.
    //--------------------------------------------------
    //
    // This approach of Effective Body Mass avoids double-counting while still
    // accounting for the fact that taller dogs generally
    // have longer strides, larger turning radii and occupy
    // a greater movement envelope during training.
    //
    // The resulting Effective Body Mass is then used in
    // place of the raw body weight when estimating the
    // required indoor training space.

    //
    // Formula
    //
    // Required Space =
    //
    // Base Space
    //
    // +
    //
    // (Effective Body Mass × SPACE_PER_KG)
    //
    // +
    //
    // (Energy Level × SPACE_PER_ENERGY_LEVEL)
    //
    // The resulting value estimates the minimum
    // recommended indoor training area.
    //

    // ======================================================
    // MATHEMATICAL JUSTIFICATION
    // ======================================================
    //
    // The required-space model is intentionally designed as
    // an additive equation:
    //
    // Required Space =
    //
    // Base Space
    // +
    // Effective Body Mass Contribution(Aquired with both Height and Weight)
    // +
    // Energy Contribution
    //
    //
    //
    // Mathematically:
    //
    // Required Space (m²)
    // =
    // BASE_SPACE
    // +
    // (Effective Body Mass × SPACE_PER_KG)
    // +
    // (Energy Level × SPACE_PER_ENERGY_LEVEL)
    //
    //
    // WHY AN ADDITIVE MODEL?
    // ------------------------------------------------------
    //
    // The three variables describe different characteristics
    // of a dog's training requirements.
    //
    // Each characteristic contributes independently to the
    // amount of space required.
    //
    // They are therefore summed rather than multiplied.
    //
    //
    // Base Space
    // ----------
    //
    // Every dog requires a minimum amount of usable floor
    // space regardless of its breed.
    //
    // This space is needed for basic training activities,
    // including:
    //
    // • standing
    // • walking
    // • turning
    // • heeling
    // • interacting safely with a trainer
    //
    // The BASE_SPACE constant represents this minimum
    // requirement.
    //
    //
    // Effective Body Mass Contribution
    // --------------------------------
    //
    // Rather than using the dog's average body weight
    // directly, the model uses its Effective Body Mass.
    //
    // Effective Body Mass is calculated by adjusting the
    // dog's average weight using a height factor.
    //
    // This allows the model to account for the fact that
    // two dogs with similar weights may require different
    // amounts of training space because of differences in
    // their height and overall body proportions.
    //
    // For example:
    //
    // A Bulldog and a Greyhound may have comparable body
    // weights, but the Greyhound is considerably taller
    // and has a much longer stride length.
    //
    // During training, the Greyhound generally requires a
    // larger movement envelope and a greater turning
    // radius than the Bulldog, despite their similar
    // weights.
    //
    // Instead of adding height as an independent variable,
    // height is used to modify the dog's weight. This
    // avoids double-counting the dog's physical size while
    // still recognising that taller dogs usually require
    // more space to move comfortably.
    //
    // Consequently, Effective Body Mass provides a more
    // representative measure of the dog's overall spatial
    // requirements than raw body weight alone.
    //
    // SPACE_PER_KG defines how much additional indoor
    // training area is allocated for every kilogram of
    // Effective Body Mass.
    //
    //
    // Energy Contribution
    // -------------------
    //
    // Physical size alone does not fully determine space
    // requirements.
    //
    // Behavioural activity also plays a significant role.
    //
    // Highly energetic breeds generally perform:
    //
    // • faster movement
    // • longer running distances
    // • agility exercises
    // • more frequent directional changes
    //
    // Therefore energy contributes independently to the
    // required training area.
    //
    // SPACE_PER_ENERGY_LEVEL specifies how much additional
    // space is allocated for each increase in the API Ninjas
    // Energy rating (1–5).
    //
    //
    // WHY NOT MULTIPLY THE VARIABLES?
    // -------------------------------
    //
    // A multiplicative model would cause the influence of
    // one variable to depend on the value of another.
    //
    // For example:
    //
    // Required Space = Weight × Energy
    //
    // would imply that a low-energy large dog requires
    // dramatically less space than expected simply because
    // its energy score is low.
    //
    // Likewise, a very energetic small dog could receive
    // unrealistically low estimates because of its small
    // weight.
    //
    // Since body size and behavioural energy each contribute
    // independently to facility requirements, an additive
    // model better reflects their combined influence.
    //
    //
    // MODEL TYPE
    // ----------
    //
    // This equation is a heuristic engineering model
    // developed specifically for TrainerIQ.
    //
    // It is intended to produce practical and consistent
    // suitability rankings rather than exact veterinary,
    // kennel-design, or regulatory space requirements.
    //
    // The constants (BASE_SPACE, SPACE_PER_KG and
    // SPACE_PER_ENERGY_LEVEL) are therefore configurable
    // parameters that can be refined as empirical data from
    // professional dog trainers and training facilities
    // becomes available.
    //

    const requiredSpace =
      BASE_SPACE +
      effectiveBodyMass * SPACE_PER_KG +
      energyLevel * SPACE_PER_ENERGY_LEVEL;

    // ======================================================
    // FACILITY SCORE
    // ======================================================
    //
    // Compare the building's actual area with the
    // estimated required area.
    //
    // Ratio = Building Area / Required Space
    //
    // If the building is larger than required,
    // the score is capped at 100%.
    //
    // A building twice as large as necessary
    // is not considered twice as suitable.
    //

    const facilityScore = Math.min(1, buildingArea / requiredSpace);

    // ======================================================
    // TEMPERATURE SCORE
    // ======================================================

    const temp = weather.Temperature.Metric.Value;

    //
    // Assume ideal weather initially.
    //

    let temperatureScore = 1;

    //
    // Extreme temperatures.
    //

    if (temp < EXTREME_TEMP_MIN || temp > EXTREME_TEMP_MAX) {
      temperatureScore = 0.4;
    }

    //
    // Mild discomfort.
    //
    else if (temp < IDEAL_TEMP_MIN || temp > IDEAL_TEMP_MAX) {
      temperatureScore = 0.7;
    }

    // ======================================================
    // WEATHER SCORE
    // ======================================================
    //
    // Weather quality consists of two equally
    // important components.
    //
    // 1. Temperature
    //
    // 2. Weather Condition
    //
    // Each contributes 50%.
    //

    const iconScore = weatherIconScores[weather.WeatherIcon] ?? 0.8;

    const weatherScore = temperatureScore * 0.5 + iconScore * 0.5;

    // ======================================================
    // SIZE COMPATIBILITY
    // ======================================================
    //
    // Smaller breeds naturally adapt more easily
    // to smaller indoor facilities.
    //
    // This produces a score between
    // 0 and 1.
    //

    const SIZE_COMPATIBILITY_REFERENCE_KG = 90;

    // Approximate upper weight of giant domestic dog breeds.

    // Used to normalise the size compatibility score.

    // Dogs near or above this weight receive a compatibility score close to 0.

    // This score estimates how easily a breed can adapt

    // to relatively small indoor training facilities.

    //

    // Smaller dogs generally require less manoeuvring

    // space, shorter turning radii and smaller movement

    // envelopes than giant breeds.

    //

    // The score is normalised using a reference weight of

    // 90 kg, which approximates the upper end of domestic

    // dog weights.

    //

    // Formula:

    //

    // 1 - (Average Weight / 90)

    //

    // Interpretation:

    //

    // • Very small dogs → score close to 1.0

    // • Medium dogs → score around 0.5-0.8

    // • Giant dogs → score close to 0.0

    //

    // Math.max(0, ...) ensures the score never becomes

    // negative for extremely large dogs.

    const sizeCompatibility = Math.max(
      0,
      1 - effectiveBodyMass / SIZE_COMPATIBILITY_REFERENCE_KG,
    );

    // ======================================================
    // TRAINABILITY SCORE
    // ======================================================
    //
    // API Ninjas expresses trainability on a
    // 1-5 scale.
    //
    // Convert this into a value between
    // 0 and 1.
    //

    const trainabilityScore = breed.trainability / 5;

    // ======================================================
    // FINAL SUITABILITY SCORE
    // ======================================================
    //
    // Combine every independent component using the
    // predefined TrainerIQ weightings.
    //
    // The result is converted into a percentage.
    //

    const score =
      (facilityScore * FACILITY_WEIGHT +
        weatherScore * WEATHER_WEIGHT +
        sizeCompatibility * SIZE_WEIGHT +
        trainabilityScore * TRAINABILITY_WEIGHT) *
      100;

    // ======================================================
    // STRONGEST AND WEAKEST CONTRIBUTING FACTORS
    // ======================================================
    //
    // Determine which evaluation component contributed the
    // most positively and which contributed the least.
    //
    // These values are later embedded directly into the
    // remarks so that every explanation references the
    // actual calculated scores instead of generic text.
    //

    const componentScores = [
      {
        name: "Facility Suitability",
        score: facilityScore,
        weight: 50,
      },
      {
        name: "Weather Suitability",
        score: weatherScore,
        weight: 20,
      },
      {
        name: "Size Compatibility",
        score: sizeCompatibility,
        weight: 20,
      },
      {
        name: "Trainability",
        score: trainabilityScore,
        weight: 10,
      },
    ];

    const strongestComponent = componentScores.reduce((best, current) =>
      current.score > best.score ? current : best,
    );

    const weakestComponent = componentScores.reduce((worst, current) =>
      current.score < worst.score ? current : worst,
    );

    // ======================================================
    // RETURN RESULTS
    // ======================================================

    return {
      score: Math.round(score),

      requiredSpace: Math.round(requiredSpace),

      breakdown: {
        facilityScore: +(facilityScore * 100).toFixed(1),

        weatherScore: +(weatherScore * 100).toFixed(1),

        sizeCompatibility: +(sizeCompatibility * 100).toFixed(1),

        trainabilityScore: +(trainabilityScore * 100).toFixed(1),
      },

      remark: {
        overall:
          score >= 90
            ? `Outstanding suitability. This trainer is an exceptional match for this breed, achieving an Overall Suitability Score of ${Math.round(score)}%.

The strongest contributing factor is ${strongestComponent.name}, which achieved ${(strongestComponent.score * 100).toFixed(1)}% and contributes ${strongestComponent.weight}% towards the Overall Suitability Score.

The lowest scoring component is ${weakestComponent.name}, which achieved ${(weakestComponent.score * 100).toFixed(1)}%. Although this slightly limits the final result, its influence is outweighed by the stronger evaluation components.

Overall, all evaluation criteria indicate that this trainer provides an excellent environment for this breed.`
            : score >= 80
              ? `Excellent suitability. The trainer achieves an Overall Suitability Score of ${Math.round(score)}%.

${strongestComponent.name} is the highest scoring component at ${(strongestComponent.score * 100).toFixed(1)}%, making it the most significant positive contributor to the final assessment.

Conversely, ${weakestComponent.name} achieved ${(weakestComponent.score * 100).toFixed(1)}%, making it the principal factor preventing an even higher Overall Suitability Score.

Despite this minor limitation, the trainer remains highly recommended.`
              : score >= 70
                ? `Good suitability. The trainer achieves an Overall Suitability Score of ${Math.round(score)}%.

The evaluation is primarily strengthened by ${strongestComponent.name}, which scored ${(strongestComponent.score * 100).toFixed(1)}%.

The greatest limiting factor is ${weakestComponent.name}, which scored ${(weakestComponent.score * 100).toFixed(1)}%.

Improving this weaker component would produce the largest increase in the Overall Suitability Score.`
                : score >= 60
                  ? `Moderate suitability. The Overall Suitability Score of ${Math.round(score)}% indicates that this trainer is acceptable for this breed but possesses noticeable limitations.

${strongestComponent.name} provides the greatest positive contribution with a score of ${(strongestComponent.score * 100).toFixed(1)}%.

However, ${weakestComponent.name} scored only ${(weakestComponent.score * 100).toFixed(1)}%, making it the primary reason the Overall Suitability Score is not higher.`
                  : score >= 50
                    ? `Limited suitability. The trainer achieved an Overall Suitability Score of ${Math.round(score)}%.

Although ${strongestComponent.name} scored ${(strongestComponent.score * 100).toFixed(1)}%, one or more weaker evaluation components significantly reduce confidence in this facility.

The weakest component is ${weakestComponent.name}, which achieved only ${(weakestComponent.score * 100).toFixed(1)}% and therefore has the greatest negative impact on the overall assessment.`
                    : `Poor suitability. The Overall Suitability Score of ${Math.round(score)}% indicates that this trainer is not well suited to this breed.

While ${strongestComponent.name} remains the strongest component with ${(strongestComponent.score * 100).toFixed(1)}%, the very low ${weakestComponent.name} score of ${(weakestComponent.score * 100).toFixed(1)}% substantially reduces the overall assessment.

A different trainer with stronger performance in this area would likely provide a significantly better match.`,
      },
    };
  }

  const handleTryAgain = () => {
    setImagesLoadingError(false);
    setImagesLoadingStatus(true);
    getCaninePics()
      .then((response) => {
        //console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => {
        //setImagesLoadingError(false);
        setCanineImages([...response]);
        setImagesLoadingStatus(false);
        //console.log(response);
      })
      .catch((error) => {
        setImagesLoadingStatus(false);
        setImagesLoadingError(true);
        console.error(`Error message ${error}`);
      });
  };

  const handleMyTrainerSelect = (id, evt) => {
    if (canineTraits === null) {
      Notiflix.Notify.warning("Select a Dog Breed");
      return;
    }
    dogTrainers.map((trainer) => {
      if (trainer.id === id) {
        setMyTrainerPlace(trainer);

        const myCoordinates = trainer.properties.building.geometry.coordinates;

        const polygon = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [...myCoordinates],
          },
        };

        const myBuildingArea = area(polygon);

        setMyTrainerArea(myBuildingArea);

        setWeatherError(false);
        setWeatherLoadingStatus(true);

        getMyTrainerWeather(
          trainer.properties.ext_place_geometry.coordinates[1],
          trainer.properties.ext_place_geometry.coordinates[0],
        )
          .then((response) => {
            //console.log(response);
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((response) => {
            setMyWeatherDetails([...response]);
            setWeatherLoadingStatus(false);
            console.log(response);
            const trainerData = calculateTrainerSuitability(
              canineTraits,
              response[0],
              myBuildingArea,
            );
            console.log(trainerData);
            setTrainerDetails(trainerData);
            myTrainerModalStateSetter(true);
          })
          .catch((error) => {
            setWeatherLoadingStatus(false);
            setWeatherError(true);
            Notiflix.Notify.failure("Error, select place again");
            console.error(`Error message ${error}`);
          });

        console.log(myBuildingArea);
      }
    });
  };

  const handleTrainerSelect = (id, evt) => {
    if (canineTraits === null) {
      Notiflix.Notify.warning("Select a Dog Breed");
      return;
    }
    trainerPlaces.map((trainerPlace) => {
      if (trainerPlace.id === id) {
        setTrainerLoadingError(false);
        setTrainerLoadingStatus(true);
        getTrainerBuilding(
          trainerPlace.geometry.coordinates[1],
          trainerPlace.geometry.coordinates[0],
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((response) => {
            setTrainerPlace({ ...response[0] });
            console.log(response[0]);

            const myCoordinates =
              response[0].properties.building.geometry.coordinates;

            const polygon = {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [...myCoordinates],
              },
            };

            const myBuildingArea = area(polygon);

            setMyTrainerArea(myBuildingArea);

            getMyTrainerWeather(
              trainerPlace.geometry.coordinates[1],
              trainerPlace.geometry.coordinates[0],
            )
              .then((response) => {
                //console.log(response);
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((response) => {
                setMyWeatherDetails([...response]);

                console.log(response);
                const trainerData = calculateTrainerSuitability(
                  canineTraits,
                  response[0],
                  myBuildingArea,
                );
                console.log(trainerData);
                setTrainerDetails(trainerData);
                trainerModalStateSetter(true);
                setTrainerLoadingStatus(false);
              })
              .catch((error) => {
                setWeatherError(true);
                setTrainerLoadingStatus(false);
                Notiflix.Notify.failure("Error, could not get weather details");
                console.error(`Error message ${error}`);
              });
          })
          .catch((error) => {
            setTrainerLoadingError(true);
            setTrainerLoadingStatus(false);
            Notiflix.Notify.failure("Select place again");
            console.error(`Error message ${error}`);
          });
      }
    });
  };

  const handleCountrySelect = (evt) => {
    if (canineTraits === null) {
      Notiflix.Notify.warning("Select a Dog Breed");
      evt.target.value = "Select a Country";
      return;
    }
    setSelectedCountry(evt.target.value);

    setTrainersLoadingError(false);
    setTrainersLoadingStatus(true);
    getTrainers(evt.target.value)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => {
        setTrainerPlaces([...response]);
        setTrainersLoadingStatus(false);
        console.log(response);
      })
      .catch((error) => {
        //setSelectedCountry(null);
        setTrainersLoadingStatus(false);
        setTrainersLoadingError(true);
        Notiflix.Notify.failure("Error, select country again");
        console.error(`Error message ${error}`);
        evt.target.value = "Select a Country";
      });
  };

  useEffect(() => {
    setMyTrainerPlaces([...dogTrainers]);
  }, []);

  return (
    <section
      id="trainer-details"
      className="relative items-center c-space section-spacing"
    >
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#03d5ff"}
        refresh
      />
      <h2 className={css.textHeading}>Trainer Details</h2>
      <div className={css.imagesGalleryWrapper}>
        <div className={css.imagesGallery}>
          <MyTrainersModal
            isOpen={myTrainerModalState}
            stateSetter={myTrainerModalStateSetter}
            place={myTrainerPlace}
            area={myTrainerArea}
            traits={canineTraits}
            data={trainerDetails}
            weatherDetails={weatherDetails}
          />
          {
            <TrainersModal
              isOpen={trainerModalState}
              stateSetter={trainerModalStateSetter}
              place={trainerPlace}
              area={myTrainerArea}
              traits={canineTraits}
              data={trainerDetails}
              weatherDetails={weatherDetails}
            />
          }
          <div className={css.selectorWrapper}>
            <label>Select Trainer Country</label>
            <select className={css.selector} onChange={handleCountrySelect}>
              <option disabled selected>
                Select a Country
              </option>
              {countries.map((country) => {
                return <option value={country.alpha_2}>{country.name}</option>;
              })}
            </select>
          </div>
          {(isWeatherLoading || areTrainersLoading || isTrainerLoading) && (
            <div className={css.backDrop}>
              <div className={css.centerStyle}>
                <ThreeCircles
                  visible={true}
                  height="60"
                  width="60"
                  color="#ffff"
                  radius="9"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClass={{}}
                />
              </div>
            </div>
          )}
          {selectedCountry === null && (
            <ul className={css.myTrainersList}>
              {myTrainerPlaces.map((place) => {
                return (
                  <li
                    key={place.id}
                    className={css.myTrainersListItem}
                    onClick={(evt) => handleMyTrainerSelect(place.id, evt)}
                  >
                    <img className={css.image} src={trainerImg} />
                    <p>{place.properties.ext_name}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedCountry !== null &&
            areTrainersLoading === false &&
            areTrainersLoadingError === false &&
            trainerPlaces.length !== 0 && (
              <ul className={css.trainersList}>
                {trainerPlaces.map((place) => {
                  return (
                    <li
                      key={place.id}
                      className={css.trainersListItem}
                      onClick={(evt) => handleTrainerSelect(place.id, evt)}
                    >
                      <img
                        className={css.image}
                        src={trainerImg}
                        alt="Trainer"
                      />
                      <p>{place.properties.ext_name}</p>
                    </li>
                  );
                })}
              </ul>
            )}

          {selectedCountry !== null &&
            areTrainersLoading === false &&
            areTrainersLoadingError === false &&
            trainerPlaces.length === 0 && (
              <ul className={css.infoMsgWrapper}>
                <li>
                  <p>NO TRAINERS FOUND</p>
                </li>
              </ul>
            )}

          {areTrainersLoading === false && areTrainersLoadingError === true && (
            <div className={css.errorWrapper}>
              <div>
                <p>Error, select a country again</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};;

export default TrainerDetails;
