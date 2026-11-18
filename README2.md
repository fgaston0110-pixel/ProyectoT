# Sistema de Turnos Médicos

Proyecto integrador de la Tecnicatura en Análisis de Sistemas y Desarrollo de Software.

Aplicación web para gestionar pacientes, profesionales, horarios, reservas y atenciones médicas. Los pacientes pueden reservar entre horarios establecidos por un profesional, consultar sus turnos y ver atenciones registradas; los profesionales pueden configurar sus horarios, controlar asistencia y registrar consultas.

> **Alcance:** proyecto académico. Usar datos ficticios para las pruebas. Antes de emplearlo con pacientes reales es necesario completar la autenticación y autorización de *todas* las rutas, el almacenamiento seguro de contraseñas y la revisión de dependencias.

## 1. Tecnologías

- **Frontend:** HTML, CSS y JavaScript (se abre con Live Server en VS Code).
- **Backend:** Node.js, Express y Sequelize (API REST).
- **Base de datos:** PostgreSQL; se puede administrar con pgAdmin 4.
- **Otras bibliotecas:** `dotenv` para variables de entorno, `cors` para peticiones entre orígenes y `jsonwebtoken` para tokens JWT en las rutas que lo utilizan.

## 2. Requisitos previos

Instalar antes de comenzar:

1. [Node.js](https://nodejs.org/) (incluye npm).
2. [PostgreSQL](https://www.postgresql.org/download/) y, opcionalmente, **pgAdmin 4**.
3. [Visual Studio Code](https://code.visualstudio.com/) y la extensión **Live Server**.
4. Tener la carpeta completa del proyecto, incluidos `frontend/`, `backend/` y `backend/modelos/`.
5. Tener acceso a la **base de datos del proyecto** o a un respaldo para restaurarla si se quiere mostrar información ya registrada. El código por sí solo no trae los pacientes ni las atenciones existentes.

## 3. Estructura de carpetas

```text
Proyecto T/
├── backend/
│   ├── app.js                # Servidor Express y rutas HTTP
│   ├── config.js             # Conexión de Sequelize a PostgreSQL
│   ├── modelos/              # Modelos de las tablas y asociaciones
│   ├── .env                  # Configuración local (NO compartir)
│   ├── package.json          # Dependencias y scripts npm
│   └── package-lock.json     # Versiones de dependencias
├── frontend/
│   ├── html/                 # Login, registro y navegación
│   ├── alumno/               # Reserva, mis turnos, mis atenciones
│   ├── profesor/             # Horarios, asistencia e historial
│   ├── admin/                # Pantallas administrativas
│   ├── css/                  # Estilos visuales
│   └── img/                  # Imágenes
└── README.md                # Esta guía
```

## 4. Preparar la base de datos

1. Iniciar el servicio de **PostgreSQL**.
2. Abrir **pgAdmin 4**, conectarse al servidor local e ingresar las credenciales correspondientes.
3. Crear una base de datos llamada **`hospital`**, si todavía no existe. El archivo `backend/config.js` del proyecto original utiliza ese nombre de forma fija.
4. Si cuentan con un respaldo de la base de datos usada en desarrollo, restaurarlo para recuperar usuarios, especialidades, profesionales, horarios y turnos. **No se incluye un respaldo en este README.**
5. Verificar que el usuario de PostgreSQL tenga permisos para conectarse y operar sobre esa base.

> La aplicación usa Sequelize para sincronizar modelos con `sequelize.sync({ alter: true })`. Puede crear o cambiar tablas, **pero no carga automáticamente los datos de ejemplo** (usuarios, médicos, especialidades, etc.). Además, `alter: true` puede modificar el esquema: hacer una copia de seguridad antes de iniciar una versión nueva contra una base con datos valiosos.

## 5. Configurar el archivo `.env`

Dentro de `backend/`, crear o completar el archivo `.env` con los valores de **su propia computadora**:

```env
DB_USER=postgres
DB_PASSWORD=REEMPLAZAR_CON_TU_CONTRASENA
DB_HOST=localhost
JWT_SECRET=REEMPLAZAR_CON_UNA_CLAVE_ALEATORIA_DE_32_CARACTERES_O_MAS
```

- `DB_USER`: usuario de PostgreSQL.
- `DB_PASSWORD`: contraseña de ese usuario.
- `DB_HOST`: servidor de PostgreSQL, habitualmente `localhost`.
- `JWT_SECRET`: clave privada usada para firmar/verificar tokens; la versión nueva del backend exige **al menos 32 caracteres**.
- La base de datos que se usa en `config.js` se llama **`hospital`** (no se elige desde `DB_NAME` en ese archivo).

Para generar una clave segura de ejemplo en la terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Pegar la clave generada como valor de `JWT_SECRET`. **Nunca compartir ni subir `.env` a GitHub.**

## 6. Instalar dependencias e iniciar el backend

Abrir la carpeta del proyecto en VS Code. En **Terminal > Nueva terminal**, ubicarse en `backend`:

```bash
cd backend
npm install
```

Esto instala las dependencias de `package.json`. Si se usa la versión actualizada que incorpora JWT, verificar que `jsonwebtoken` figure entre las dependencias; si falta, ejecutar **una sola vez**:

```bash
npm install jsonwebtoken
```

Después, iniciar el backend:

```bash
npm start
```

El script `start` ejecuta `node app.js`. También puede iniciarse directamente con `node app.js` o, para desarrollo, con `npm run dev` si `nodemon` está instalado.

**Señales de inicio correcto:**

```text
Base sincronizada
Servidor en puerto 3001
```

El backend queda disponible en **`http://localhost:3001`**. Mantener esa terminal abierta mientras se utiliza el sistema.

**Prueba rápida:** abrir `http://localhost:3001/especialidades` en el navegador. Debería responder con JSON (puede ser `[]` si no hay especialidades cargadas).

## 7. Iniciar el frontend

1. En VS Code, instalar o habilitar la extensión **Live Server**.
2. Abrir el archivo **`frontend/html/usulol.html`**, que es la pantalla de inicio de sesión.
3. Hacer clic derecho dentro del archivo y elegir **Open with Live Server**.
4. Se abrirá una dirección local en el navegador, normalmente en el puerto **5500** (puede variar).
5. Iniciar sesión con una cuenta **existente en la base de datos**. Para probar los distintos roles se necesitan cuentas de paciente y profesional previamente registradas.

> **El backend y el frontend se ejecutan por separado.** Live Server muestra HTML/CSS/JS; Node.js/Express atiende las peticiones `fetch()` del frontend y se comunica con PostgreSQL. **No basta con abrir el HTML si el backend o la base de datos están apagados.**

## 8. Demostración recomendada

1. Iniciar sesión como **profesional**: crear o consultar horarios y revisar la sección de asistencia.
2. Iniciar sesión como **paciente**: seleccionar especialidad, profesional y fecha; reservar uno de los horarios libres.
3. Volver al **profesional**: ver el turno, marcar llegada, iniciar/finalizar atención y registrar una consulta de prueba.
4. Volver al **paciente**: consultar **Mis turnos** y **Mis atenciones**; verificar que la consulta aparezca en su historial.

Preparar estas cuentas y registros **antes de exponer**; no asumir que una instalación nueva trae datos precargados.

## 9. Solución de problemas frecuentes

| Problema | Qué revisar |
|---|---|
| `Falta JWT_SECRET ...` | Verificar `backend/.env` y que `JWT_SECRET` tenga al menos 32 caracteres. Reiniciar Node.js. |
| `Cannot find module '...'` | Desde `backend/` ejecutar `npm install` (o instalar la dependencia faltante). |
| Error de conexión a PostgreSQL | Iniciar el servicio, revisar `DB_USER`, `DB_PASSWORD`, `DB_HOST` y que exista la base `hospital`. |
| `ERR_CONNECTION_REFUSED` en `localhost:3001` | Asegurarse de que `npm start` siga funcionando sin errores. |
| El frontend abre pero no carga datos | Revisar la consola del navegador (F12), la terminal del backend y las rutas `fetch()`. |
| No aparecen médicos o turnos | Comprobar que haya especialidades, profesionales y horarios cargados en la base usada. |
| `401` o sesión vencida en «Mis atenciones» | Cerrar sesión e iniciar nuevamente para obtener un token JWT válido. |
| `Unexpected token '<'` al leer JSON | Una petición recibió HTML en vez de JSON; revisar dirección, ruta y respuesta HTTP. |
| Puerto ocupado | Verificar que no haya otro proceso usando el puerto 3001 o cerrar la ejecución anterior. |

## 10. Comandos útiles

```bash
node --version      # Versión de Node.js
npm --version       # Versión de npm
npm install         # Instalar dependencias
npm start           # Iniciar servidor
npm run dev         # Iniciar con nodemon (si está disponible)
npm audit           # Consultar advertencias de dependencias
```

**No ejecutar `npm audit fix --force` sin revisar el impacto**: puede instalar versiones incompatibles, especialmente en Sequelize.

## 11. Notas para la entrega

- No incluir `node_modules/`, `.env` ni contraseñas en el repositorio o ZIP de entrega.
- Sí incluir `package.json` y `package-lock.json`.
- Entregar también un respaldo **sin datos personales reales** o instrucciones/datos ficticios para la demostración, si el docente lo solicita.
- El proyecto sigue siendo una versión académica y necesita una revisión de seguridad antes de cualquier despliegue público o uso clínico.
