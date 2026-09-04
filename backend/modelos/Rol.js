module.exports = (sequelize, DataTypes) => {

    const Rol = sequelize.define("Rol", {

        id_rol: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        tipo_rol: {
            type: DataTypes.STRING(30),
            allowNull: false
        }

    });

    // Relaciones de Rol
    Rol.associate = (models) => {

        // Rol 1:N Usuario
        Rol.hasMany(models.Usuario, {
            foreignKey: "id_rol"
        });

    };

    return Rol;
};