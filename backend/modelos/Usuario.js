module.exports = (sequelize, DataTypes) => {

    const Usuario = sequelize.define("Usuario", {

        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },

        nombre: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },

        contraseña: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    });

    // Relaciones de Usuario
    Usuario.associate = (models) => {

        // Usuario pertenece a una Persona
        Usuario.belongsTo(models.Persona, {
            foreignKey: "id_persona"
        });

        // Usuario pertenece a un Rol
        Usuario.belongsTo(models.Rol, {
            foreignKey: "id_rol"
        });

    };

    return Usuario;
};