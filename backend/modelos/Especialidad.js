module.exports = (sequelize, DataTypes) => {

    const Especialidad = sequelize.define("Especialidad", {

        id_especialidad: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }

    });

    // Relaciones de Especialidad
    Especialidad.associate = (models) => {

        // Especialidad 1:N Profesional
        Especialidad.hasMany(models.Profesional, {
            foreignKey: "id_especialidad"
        });

    };

    return Especialidad;
};