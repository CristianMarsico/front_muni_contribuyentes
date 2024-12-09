import React from 'react'

const ErrorResponse = ({message}) => {
    console.log(message)
    return (
        <div className="alert alert-danger text-center m-0" role="alert">
            {message}
        </div>
    )
}

export default ErrorResponse