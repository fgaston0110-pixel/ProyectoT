module.exports = (sequelize, DataTypes) => {

    const Profesional = sequelize.define("Profesional", {

        id_profesional: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },

        matricula: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },

        id_especialidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    });

    // Relaciones de Profesional
    Profesional.associate = (models) => {

        // Profesional pertenece a una Persona
        Profesional.belongsTo(models.Persona, {
            foreignKey: "id_persona"
        });

        // Profesional pertenece a una Especialidad
        Profesional.belongsTo(models.Especialidad, {
            foreignKey: "id_especialidad"
        });

        // Profesional tiene muchos Horarios
        Profesional.hasMany(models.Horario, {
            foreignKey: "id_profesional"
        });

        // Profesional tiene muchas Atenciones
        Profesional.hasMany(models.Atencion, {
            foreignKey: "id_profesional"
        });

    };

    return Profesional;
};