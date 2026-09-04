Guía del proyecto — Avance hasta ahora
1. Estructura del proyecto

Decidimos separar el proyecto en frontend y backend:

Proyecto T/
│
├── backend/
│   ├── app.js
│   ├── config.js
│   ├── relaciones.js
│   ├── .env
│   └── modelos/
│       ├── Persona.js
│       ├── Usuario.js
│       ├── Rol.js
│       ├── Paciente.js
│       ├── Profesional.js
│       ├── Especialidad.js
│       ├── Horario.js
│       ├── Sala.js
│       └── Atencion.js
│
└── frontend/
    ├── usuario.html
    ├── registro.html
    ├── admin.html
    ├── profesor.html
    └── alumno.html

**Backend**
Es la parte que se encarga de:

Recibir las solicitudes del frontend.
Comunicarse con PostgreSQL.
Utilizar Sequelize.
Crear y consultar registros.
Manejar las relaciones entre las tablas.

**Frontend**

Es lo que ve el usuario:

Login.
Registro.
Páginas según el tipo de usuario.
HTML, CSS y JavaScript.

2. PostgreSQL

La base de datos se llama:

hospital

Las tablas que dejamos son:

Persona
Rol
Usuario
Paciente
Profesional
Especialidad
Horario
Sala
Atencion

Inicialmente había una tabla Turno, pero decidimos eliminarla porque ya no formaba parte del diseño actual.

Para evitar problemas con las tablas anteriores, eliminamos la base de datos y dejamos que Sequelize la vuelva a crear/sincronizar.

3. Sequelize

Sequelize es el ORM que utilizamos para trabajar con PostgreSQL desde JavaScript.

En vez de escribir todas las consultas SQL manualmente desde JavaScript, podemos hacer cosas como:

Persona.create(...)
Usuario.findOne(...)
Atencion.findAll(...)

Sequelize se encarga de traducir esas operaciones a consultas que PostgreSQL puede ejecutar.

La idea general es:

JavaScript
    ↓
Sequelize
    ↓
PostgreSQL

4. Modelos

Cada tabla de PostgreSQL tiene su modelo correspondiente en la carpeta modelos.

Por ejemplo, Persona.js representa la tabla Persona.

En los modelos definimos:

-Nombre de los campos.
-Tipo de dato.
-Clave primaria.
-allowNull.
-unique.
-autoIncrement.
-Relaciones.

Por ejemplo, en Usuario tenemos:

id_usuario
id_persona
nombre
contraseña
id_rol

Y definimos que nombre es único para que no puedan existir dos usuarios iguales.

5. Relaciones

Las relaciones las estamos haciendo mediante Sequelize, usando associate().

Por ejemplo:

Usuario.belongsTo(models.Persona, {
    foreignKey: "id_persona"
});

Esto significa que un usuario pertenece a una persona.

También:

Usuario.belongsTo(models.Rol, {
    foreignKey: "id_rol"
});

Esto relaciona el usuario con su rol.

Las relaciones principales que dejamos son:

Persona 1:1 Usuario
Usuario N:1 Rol

Persona 1:1 Paciente
Persona 1:1 Profesional

Profesional N:1 Especialidad
Profesional 1:N Horario

Paciente 1:N Atencion
Profesional 1:N Atencion

Horario 1:1 Sala

Una aclaración importante: en la práctica, la forma en que Sequelize expresa cada relación depende de cuál modelo tiene la FK. Por eso tenemos belongsTo, hasMany, etc.

6. Roles

Creamos los cuatro roles que definimos para el proyecto:

id	Rol
1	Administrador
2	Paciente
3	Profesional
4	Supervisor

Esto es importante porque el usuario tiene un id_rol.

Por ejemplo:

id_rol = 1 → Administrador
id_rol = 2 → Paciente

7. Pruebas realizadas con Postman

Antes de conectar todo con el frontend, probamos el backend directamente utilizando Postman.

Esto nos permitió comprobar que la API funcionaba correctamente.

Crear una Persona

Usamos:

POST /personas

Y enviamos los datos en JSON.

Después comprobamos con:

GET /personas

8. Usuarios

También probamos:

POST /usuarios

para crear un usuario.

Y:

GET /usuarios

con:

include: [Persona, Rol]

Esto fue importante porque comprobamos que Sequelize podía traer los datos relacionados.

Obtuvimos algo similar a:

Usuario
 ├── Persona
 └── Rol

9. Profesional

Creamos una especialidad:

Cardiología

Después creamos un profesional relacionado con una persona y esa especialidad.

El resultado confirmó que Sequelize podía devolver:

Profesional
 ├── Persona
 └── Especialidad

10. Horario

Creamos un horario para el profesional:

Lunes
08:00 - 12:00
Disponible: true

Y comprobamos:

Horario
 └── Profesional

11. Sala

Después creamos:

Sala 01

relacionada con el horario.

El GET devolvió:

Sala
 └── Horario
      └── Profesional

Así comprobamos que esa relación también funcionaba.

12. Paciente

Creamos otra persona:

Carlos Lopez

y después un paciente relacionado con esa persona.

El resultado fue:

Paciente
 └── Persona
      └── Carlos Lopez

También comprobamos la relación mediante include.

13. Atención

Finalmente creamos una atención médica.

La atención tenía:

id_paciente
id_profesional
observacion
diagnostico
indicaciones
fecha_atencion

Creamos una atención para:

Paciente: Carlos
Profesional: Maria

Y el GET devolvió:

Atencion
 ├── Paciente
 └── Profesional

Con esto comprobamos prácticamente todas las relaciones principales del modelo.

14. API del backend

En app.js tenemos las rutas que permiten comunicarnos con los modelos.

Por ejemplo:

POST /personas
GET  /personas

POST /usuarios
GET  /usuarios

POST /rol
GET  /roles

POST /pacientes
GET  /pacientes

POST /atenciones
GET  /atenciones

Y así sucesivamente para las demás entidades.

15. Login

Después de probar las tablas, pasamos al login.

Antes el login tenía los usuarios escritos directamente en JavaScript, algo como:

let fas = "juan";
let gas = "pepe";

Eso lo eliminamos.

Ahora el login utiliza el backend.

Creamos:

POST /login

El frontend envía:

{
    "nombre": "juanperez",
    "contraseña": "123456"
}

El backend utiliza Sequelize para buscar ese usuario en PostgreSQL.

Si existe, devuelve:

{
    "mensaje": "Login correcto",
    "usuario": "juanperez",
    "rol": "Administrador",
    "persona": {...}
}

16. Fetch

Para conectar el frontend con el backend utilizamos fetch().

Por ejemplo:

const respuesta = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        nombre: usuario,
        contraseña: contraseña
    })
});

fetch() permite que el JavaScript del frontend haga una petición HTTP al backend.

La comunicación queda:

usuario.html
      ↓
    fetch()
      ↓
POST /login
      ↓
Express
      ↓
Sequelize
      ↓
PostgreSQL

17. Login según el rol

Después de recibir la respuesta del backend, el frontend analiza el rol:

if (resultado.rol === "Administrador") {
    window.location.href = "admin.html";
}
else if (resultado.rol === "Profesional") {
    window.location.href = "profesor.html";
}
else if (resultado.rol === "Paciente") {
    window.location.href = "alumno.html";
}

Esto ya está probado y funcionando.

Probamos:

Usuario: juanperez
Contraseña: 123456

y correctamente nos llevó a:

admin.html

18. Registro — donde estamos ahora

El registro ya funcionaba anteriormente, pero solamente creaba una Persona.

Ahora queremos mejorarlo.

La idea es que cuando alguien se registre:

Formulario
    ↓
POST /registro
    ↓
Crear Persona
    ↓
Obtener id_persona
    ↓
Crear Usuario
    ↓
Asignar id_rol = 2
    ↓
Paciente

De esta forma, una persona que se registra automáticamente tendrá un usuario de tipo Paciente.

Esto todavía no lo terminamos. Es el siguiente paso que vamos a hacer.

📌 Estado actual
✅ TERMINADO
- PostgreSQL conectado.
- Sequelize funcionando.
- Modelos creados.
- Tablas creadas.
- Relaciones configuradas.
- Datos probados con Postman.
- API REST funcionando.
- GET y POST.
- include de relaciones.
- CORS.
- Login conectado a PostgreSQL.
- fetch() funcionando.
- Redirección según rol funcionando.
- Los cuatro roles creados.

🔄 EN PROCESO

Registro completo:

Persona + Usuario + Rol

Resumen corto: 

Hasta ahora armamos el backend con Node.js, Express y Sequelize conectado a PostgreSQL. Creamos los modelos de las nueve tablas y configuramos sus relaciones mediante Sequelize. Probamos la creación y consulta de datos utilizando Postman y comprobamos que las relaciones funcionan mediante include. Después conectamos el frontend con el backend utilizando fetch(). Reemplazamos el login que tenía usuarios escritos manualmente por un login que consulta realmente la base de datos mediante una ruta POST /login. El backend verifica el usuario y contraseña mediante Sequelize y devuelve el rol, y según ese rol el frontend redirige a la página correspondiente. Actualmente estamos terminando el registro para que, además de crear la Persona, cree automáticamente el Usuario y le asigne el rol Paciente.