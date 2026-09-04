module.exports = (sequelize, DataTypes) => {

    const Turno = sequelize.define("Turno", {

        id_turno: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_paciente: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        id_horario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        fecha_turno: {
            type: DataTypes.DATE,
            allowNull: false
        }

    });

    // Relaciones de Turno
    Turno.associate = (models) => {

        // Turno pertenece a un Paciente
        Turno.belongsTo(models.Paciente, {
            foreignKey: "id_paciente"
        });

        // Turno pertenece a un Horario
        Turno.belongsTo(models.Horario, {
            foreignKey: "id_horario"
        });

    };

    return Turno;
};