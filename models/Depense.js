const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");

const Depense = sequelize.define(
	"Depense",
	{
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true
		},
		value: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false
		},
		categoryId: {
			type: DataTypes.INTEGER,
			references: {
				model: Category,
				key: "id"
			}
		}
	},
	{
		timestamps: true
	}
);

Depense.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Depense, { foreignKey: "categoryId" });

module.exports = Depense;
