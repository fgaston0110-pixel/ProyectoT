module.exports = (sequelize, DataTypes) => {

    const Persona = sequelize.define("Persona", {

        id_persona: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        apellido: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        dni: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },

        direccion: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        sexo: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        edad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        zona: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        
        nacionalidad: {
            type: DataTypes.STRING(50),
            allowNull: true

        }

    });

    // Relaciones
    Persona.associate = (models) => {

        // Persona 1:1 Usuario
        Persona.hasOne(models.Usuario, {
            foreignKey: "id_persona"
        });

        // Persona 1:1 Paciente
        Persona.hasOne(models.Paciente, {
            foreignKey: "id_persona"
        });

        // Persona 1:1 Profesional
        Persona.hasOne(models.Profesional, {
            foreignKey: "id_persona"
        });

    };

    return Persona;
};