const bcrypt = require("bcrypt");

module.exports = function (sequelize, DataTypes) {
    const Collab = sequelize.define("collab", {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                len: [5]
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8]
            }
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            // allowNull: false
        }
    });


    Collab.associate = function (models) {
        Collab.belongsToMany(models.task, {
            through: "collabTasks"
        });

        Collab.belongsToMany(models.event,
            {
                through: "collabEvents"
            });

    };



    // encrypt user password before creation of user model
    Collab.beforeCreate(function (user) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    })

    return Collab;
}