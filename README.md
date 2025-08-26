# Guía Rápida para Ejecutar el Proyecto

Este proyecto está compuesto por un **frontend** desarrollado con React y Vite, y un **backend** creado con TypeScript y Express. A continuación, se detallan los pasos para ponerlo en funcionamiento de manera local.

## Prerrequisitos

-   Node.js (versión 14 o superior)
-   npm (se instala con Node.js)

---

## Configuración del Backend

1.  Ve al directorio del backend:
    ```sh
    cd backend
    ```

2.  Instala las dependencias:
    ```sh
    npm install
    ```

3.  Crea un archivo `.env` en el directorio raíz del backend y añade tus claves API:
    ```
    RAPIDAPI_KEY=tu_clave_de_rapidapi
    OPENAI_API_KEY=tu_clave_de_openai
    ```

4.  Compila el código TypeScript y ejecuta el servidor:
    ```sh
    npm run dev
    ```
    El servidor se iniciará localmente en `http://localhost:8080`.

---

## Configuración del Frontend

1.  Abre una nueva terminal y ve al directorio del frontend:
    ```sh
    cd frontend
    ```

2.  Instala las dependencias:
    ```sh
    npm install
    ```

3.  Crea un archivo `.env` en el directorio raíz del frontend para configurar la URL del backend:
    ```
    VITE_API_URL=http://localhost:8080/api
    ```

4.  Inicia el servidor de desarrollo de React:
    ```sh
    npm run dev
    ```
    El frontend se abrirá en `http://localhost:5173`.
