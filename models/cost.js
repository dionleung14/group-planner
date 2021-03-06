module.exports = function (sequelize, DataTypes) {
    const Cost = sequelize.define("cost", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.STRING,
        cost: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        purchased: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    // associate to collab for foreign key - each cost belongs to an event
    Cost.associate = function (models) {
        Cost.belongsTo(models.event);
    };

    return Cost;
}