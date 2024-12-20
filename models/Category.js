const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define("Category", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true // Pour éviter les doublons de catégories
	}
});

module.exports = Category;
