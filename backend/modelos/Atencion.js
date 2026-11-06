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

        // Relaciona la atención con un turno
        id_turno: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true
        },

        motivo_consulta: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        observacion: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        diagnostico: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        indicaciones: {
            type: DataTypes.TEXT,
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

        Atencion.belongsTo(models.Turno, {
            foreignKey: "id_turno"
        });

    };

    return Atencion;
};