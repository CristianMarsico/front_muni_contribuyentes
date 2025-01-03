import React from 'react'

const InfoField = ({ label, value }) => {
  return (
    <div className="col-12 col-md-6 mb-3">
      <strong className="text-muted">{label}</strong>
      <p className="text-dark fs-6">{value}</p>
    </div>
  )
}
export default InfoField