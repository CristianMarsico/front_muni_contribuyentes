import React from 'react'
import Filter from '../components/Filter';

{/* Permite realizar búsquedas de DDJJ en base a ciertos criterios */ }
const FiltersRafam = ({
    buscarCodComercio,
    setBuscarCodComercio,
    buscarCuit,
    setBuscarCuit,
    buscarMes,
    setBuscarMes,
    mesesSelect,
    buscarAnio,
    setBuscarAnio
}) => {
        
  return (
      <div className="container mt-4">
          <div className="row justify-content-center">
              <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                  <div className="card shadow-lg rounded-4 border-0">
                      <div className="card-body p-4">
                          <h5 className="card-title text-center text-primary mb-4">Filtros</h5>
                          <Filter search={buscarCodComercio} setSearch={setBuscarCodComercio} name="N° de Comercio" type="number" placeholder="Ingrese cod comercio" />
                          <Filter search={buscarCuit} setSearch={setBuscarCuit} name="CUIT" type="number" placeholder="Ingrese CUIT" />
                          <Filter
                              search={buscarMes}
                              setSearch={setBuscarMes}
                              name="Mes"
                              isSelect={true}
                              options={mesesSelect}
                          />
                          <Filter search={buscarAnio} setSearch={setBuscarAnio} name="Año de DDJJ" type="number" placeholder="Ingrese año que desea buscar" />
                      </div>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default FiltersRafam