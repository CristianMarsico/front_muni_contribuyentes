# Despliegue en Producción

## Antes de llevar a Producción

### Requisitos previos

Antes de ejecutar los comandos bash, asegúrate de tener instalados los siguientes programas en tu sistema:

1. **Node.js** (versión recomendada: LTS). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2. **npm** (incluido con Node.js).
3. **Git** (opcional, pero recomendado para el manejo de versiones).

### Instalar las dependencias

Ejecuta el siguiente comando para instalar todas las dependencias necesarias para el proyecto:

```bash
npm install
```

### Crear una versión optimizada

Genera una versión optimizada de la aplicación ejecutando:

```bash
npm run build
```

Esto creará una carpeta `dist` que contiene los archivos listos para producción.

---

## Configuración en Producción

### Variables de entorno

Configura la variable de entorno `VITE_API_URL` para apuntar a la URL del backend:

```bash
VITE_API_URL={URL del backend}
```

### Comando de compilación (Build Command)

Ejecuta el siguiente comando para asegurarte de que la aplicación esté correctamente construida:

```bash
npm run build
```

### Directorio de publicación ( Publish Directory)

Asegúrate de que el directorio de publicación esté configurado como `dist` en tu servidor o plataforma de despliegue.

### Reglas de Redirección y Reescritura (Redirect and Rewrite Rules)

Agrega las siguientes reglas para manejar redirecciones en una aplicación SPA:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** `Rewrite`

---