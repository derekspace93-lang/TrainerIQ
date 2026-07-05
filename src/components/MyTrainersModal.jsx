import css from "./MyTrainersModal.module.css";
import { ThreeCircles } from "react-loader-spinner";
import trainerImg from './trainerImg.png'

export const MyTrainersModal = ({ isOpen, stateSetter, place, area, traits, data, weatherDetails }) => {
  const handleMyModalClose = () => {
    stateSetter(false);
  };

  return (
    <div>
      {isOpen && (
        <div className={css.backDrop}>
          <button className={css.closeModal} onClick={handleMyModalClose}>
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
            <div className={css.placeInfo}>
              <div className={css.placeDetailsWrapper}>
                <div className={css.placeDetailsImageWrapper}>
                  <img className={css.image} src={trainerImg} />
                  <p style={{ textAlign: "center" }}>
                    {place.properties.ext_name}
                  </p>
                </div>
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="rgb(92, 51, 204)"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16l4-4-4-4" />
                    <path d="M8 12h8" />
                  </svg>
                </span>
                <div className={css.breedDetailsImageWrapper}>
                  <img
                    className={css.breedImage}
                    src={traits.image_link}
                    alt="Breed"
                  />
                  <p style={{ textAlign: "center" }}>{traits.name}</p>
                </div>
              </div>

              <div>
                <table style={{ borderCollapse: "collapse", width: "500px" }}>
                  <tbody>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Place Name:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {place.properties.ext_name}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Dog Breed:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {traits.name}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Overall Suitability Score:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? data.score : "Null"}/100
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Building Area:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {area.toFixed(2)} m²
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Estimated Required Building Area:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? data.requiredSpace : "Null"} m²
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Facility Suitability Score:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? data.breakdown.facilityScore : "Null"}/100
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Size Compatibility Score:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? (
                          <span>{data.breakdown.sizeCompatibility}/100</span>
                        ) : (
                          <span>Null</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Breed Trainability Score:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? (
                          <span>{data.breakdown.trainabilityScore}/100</span>
                        ) : (
                          <span>Null</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Weather Suitability Score:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? (
                          <span>{data.breakdown.weatherScore}/100</span>
                        ) : (
                          <span>Null</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px",
                        }}
                      >
                        <h3>Weather Condition:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? (
                          <span>
                            {weatherDetails[0].WeatherText} (
                            {weatherDetails[0].Temperature.Metric.Value}°C) with{" "}
                            {weatherDetails[0].PrecipitationType === null
                              ? "no precipitation"
                              : "precipitation"}
                          </span>
                        ) : (
                          <span>Null</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          border: "1px solid #ffff",
                          fontWeight: 700,
                          width: "300px",
                          backgroundColor: "#5c33cc",
                          padding: "5px"
                        }}
                      >
                        <h3>Overall Remark:</h3>
                      </th>
                      <td
                        style={{
                          backgroundColor: "#030412",
                          textAlign: "left",
                          border: "1px solid #ffff",
                          padding: "5px",
                        }}
                      >
                        {data ? (
                          <span>{data.remark.overall}</span>
                        ) : (
                          <span>Null</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
