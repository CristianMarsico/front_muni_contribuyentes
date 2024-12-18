import React from 'react'

const PendingApproval = () => {
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow p-4 text-center">
                        <h2 className="text-primary mb-3">Revisión en Proceso</h2>
                        <p className="mb-4">
                            Su información está siendo evaluada por nuestro equipo. Este proceso puede demorar hasta <strong>24 horas</strong>.
                            Le recomendamos intentar acceder nuevamente después de ese tiempo.
                        </p>
                        <p className="text-muted">
                            Nos pondremos en contacto con usted si es necesario. En caso de que persista el problema luego de las 24 horas, no dude en comunicarse con nuestro equipo de soporte para obtener asistencia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PendingApproval