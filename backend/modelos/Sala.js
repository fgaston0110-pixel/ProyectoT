module.exports = (sequelize, DataTypes) => {

    const Sala = sequelize.define("Sala", {

        id_sala: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_horario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },

        numero_sala: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        }

    });

    // Relaciones de Sala
    Sala.associate = (models) => {

        // Sala pertenece a un Horario
        Sala.belongsTo(models.Horario, {
            foreignKey: "id_horario"
        });

    };

    return Sala;
};