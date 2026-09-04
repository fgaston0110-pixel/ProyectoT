const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config");

const db = {};

// Inicializamos los modelos
db.Persona = require("./Persona")(sequelize, DataTypes);
db.Rol = require("./Rol")(sequelize, DataTypes);
db.Usuario = require("./Usuario")(sequelize, DataTypes);
db.Paciente = require("./Paciente")(sequelize, DataTypes);
db.Profesional = require("./Profesional")(sequelize, DataTypes);
db.Especialidad = require("./Especialidad")(sequelize, DataTypes);
db.Horario = require("./Horario")(sequelize, DataTypes);
db.Sala = require("./Sala")(sequelize, DataTypes);
db.Turno = require("./Turno")(sequelize, DataTypes);
db.Atencion = require("./Atencion")(sequelize, DataTypes);

// Ejecutamos las asociaciones
Object.keys(db).forEach((modelName) => {

    if (db[modelName].associate) {
        db[modelName].associate(db);
    }

});

// Guardamos la conexión
db.sequelize = sequelize;

// Guardamos la clase Sequelize
db.Sequelize = Sequelize;

module.exports = db;