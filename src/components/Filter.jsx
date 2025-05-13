import React from 'react'

const Filter = ({ search, setSearch, name, type, placeholder, isSelect = false, options = [] }) => {
    return (
        <div className="mb-3">
            <label htmlFor={`buscar-${name}`} className="form-label fw-bold text-secondary">
                Buscar {name}
            </label>
            <div className="input-group">
                {isSelect ? (
                    <select
                        id={`buscar-${name}`}
                        className="form-select rounded-3 text-center"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {options.map((opt, index) => (
                            <option key={index} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        id={`buscar-${name}`}
                        type={type}
                        className="form-control rounded-3 text-center"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                )}
                <button className="btn btn-outline-primary rounded-3">
                    <i className="bi bi-search"></i>
                </button>
            </div>
        </div>
    )
}

export default Filter
