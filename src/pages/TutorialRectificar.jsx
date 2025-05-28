import React, { useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";

const TutorialRectificar = () => {

    const images = [
        "/img/tutorial1.PNG",
        "/img/tutorial2.PNG",
        "/img/tutorial3.PNG",
        "/img/tutorial4.PNG",
        "/img/tutorial5.PNG"       
    ];


    // const info = [
    //     "Seleccione 'MIS DDJJS'",
    //     "pUTO",
    //     "HACETE LA PAJA",
    //     "TE LA COMES"
    // ];

    const [currentIndex, setCurrentIndex] = useState(0);
    // const [currentInfo, setCurrentInfo] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        // setCurrentInfo((prevIndex) => (prevIndex + 1) % info.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
        // setCurrentInfo((prevIndex) => (prevIndex - 1 + info.length) % info.length);
    };

  return (
      <div className="container my-4">
          <div className="accordion" id="imageAccordion">
              <div className="accordion-item">
                  <h2 className="accordion-header" id="headingOne">
                      <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                      >
                          Guía de instrucción de cómo rectificar
                      </button>
                  </h2>
                  <div
                      id="collapseOne"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingOne"
                      data-bs-parent="#imageAccordion"
                  >
                      <div className="accordion-body text-center">
                          <img
                              src={images[currentIndex]}
                              alt={`Imagen ${currentIndex + 1}`}
                              className="img-fluid rounded mb-3"
                          />
                          {/* <div className="btn-group mb-2" role="group">
                              {info[currentInfo]}
                          </div> */}
                          <div className="btn-group mb-2" role="group">
                              <button className="btn btn-primary" onClick={prevImage}>Anterior</button>
                              <button className="btn btn-primary" onClick={nextImage}>Siguiente</button>
                          </div>
                          <p className="text-muted">Imagen {currentIndex + 1} de {images.length}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default TutorialRectificar