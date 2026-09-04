module.exports = (sequelize, DataTypes) => {

    const Atencion = sequelize.define("Atencion", {

        id_atencion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_paciente: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        id_profesional: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        observacion: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        diagnostico: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        indicaciones: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        fecha_atencion: {
            type: DataTypes.DATE,
            allowNull: false
        }

    });

    // Relaciones de Atencion
    Atencion.associate = (models) => {

        // Atencion pertenece a un Paciente
        Atencion.belongsTo(models.Paciente, {
            foreignKey: "id_paciente"
        });

        // Atencion pertenece a un Profesional
        Atencion.belongsTo(models.Profesional, {
            foreignKey: "id_profesional"
        });

    };

    return Atencion;
};