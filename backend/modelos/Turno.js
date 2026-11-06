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
        },

        // Estado del turno del paciente
        estado: {
            type: DataTypes.ENUM(
                "reservado",
                "en_espera",
                "en_consulta",
                "atendido",
                "no_asistio"
            ),
            allowNull: false,
            defaultValue: "reservado"
        },

        // Hora real en la que comienza la consulta
        inicio_atencion: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Hora real en la que termina la consulta
        fin_atencion: {
            type: DataTypes.DATE,
            allowNull: true
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