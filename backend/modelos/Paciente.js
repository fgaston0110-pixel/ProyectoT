module.exports = (sequelize, DataTypes) => {

    const Paciente = sequelize.define("Paciente", {

        id_paciente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },

        historial: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        obra_social: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        condicion: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        numero_turno: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    });

    // Relaciones de Paciente
    Paciente.associate = (models) => {

        // Paciente pertenece a una Persona
        Paciente.belongsTo(models.Persona, {
            foreignKey: "id_persona"
        });

        // Paciente tiene muchas Atenciones
        Paciente.hasMany(models.Atencion, {
            foreignKey: "id_paciente"
        });

    };

    return Paciente;
};