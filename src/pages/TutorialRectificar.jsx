import React, { useState } from 'react'
import "bootstrap/dist/css/bootstrap.min.css";

const TutorialRectificar = () => {

    const images = [
        "/img/tutorial1.PNG",
        "/img/tutorial2.PNG",
        "/img/tutorial3.PNG",
        "/img/tutorial4.PNG",
        "/img/tutorial5.PNG",
        "/img/tutorial6.PNG",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

  return (
      <div className="container py-5">
          <div className="accordion shadow-lg rounded" id="imageAccordion">
              <div className="accordion-item border-0">
                  <h2 className="accordion-header" id="headingOne">
                      <button
                          className="accordion-button bg-primary text-white fw-bold rounded-top"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                      >
                          📘 Guía Interactiva: ¿Cómo rectificar?
                      </button>
                  </h2>
                  <div
                      id="collapseOne"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingOne"
                      data-bs-parent="#imageAccordion"
                  >
                      <div className="accordion-body text-center bg-light rounded-bottom">
                          <img
                              src={images[currentIndex]}
                              alt={`Imagen ${currentIndex + 1}`}
                              className="img-fluid rounded shadow mb-4"
                              style={{ maxHeight: '400px', objectFit: 'contain' }}
                          />
                          <div className="d-flex justify-content-center gap-3 mb-3">
                              <button
                                  className="btn btn-outline-primary"
                                  onClick={prevImage}
                                  disabled={currentIndex === 0}
                              >
                                  ⬅ Anterior
                              </button>
                              <button
                                  className="btn btn-outline-primary"
                                  onClick={nextImage}
                                  disabled={currentIndex === images.length - 1}
                              >
                                  Siguiente ➡
                              </button>
                          </div>
                          <p className="text-muted small">
                              Imagen <strong>{currentIndex + 1}</strong> de <strong>{images.length}</strong>
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

  )
}

export default TutorialRectificar