/**
 * Función usada en los catch para manejo de errores
 */
export const handleError = (error, { on401, on404, onOtherServerError, onConnectionError }) => {
    if (error?.response) {
        const { status, data } = error.response;

        switch (status) {
            case 401:
                on401?.(data.error); // Ejecuta la función para 401 si está definida
                break;
            case 404:
                on404?.(data.error); // Ejecuta la función para 404 si está definida
                break;
            default:
                onOtherServerError?.("Ocurrió un error en el servidor. Por favor, intente más tarde.");
        }
    } else {
        onConnectionError?.("Error de conexión. Verifique su red e intente nuevamente.");
    }
};