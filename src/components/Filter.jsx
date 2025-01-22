import React from 'react'

const Filter = ({ seach, setSearch, name, type, placeholder }) => {
  return (
      <div className="mb-3">
          <label htmlFor="buscarCliente" className="form-label fw-bold text-secondary">
              Buscar {name}
          </label>
          <div className="input-group">
              <input
                  id="buscarCliente"
                  type={type}
                  className="form-control rounded-3 text-center"
                  placeholder={placeholder}
                  value={seach}
                  onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary rounded-3">
                  <i className="bi bi-search"></i>
              </button>
          </div>
      </div>
  )
}

export default Filter