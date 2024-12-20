const express = require("express");
const sequelize = require("./config/database");
const Depense = require("./models/Depense");
const Category = require("./models/Category");
require("dotenv").config();

const app = express();
const { Op } = require("sequelize"); // Op est nécessaire pour les opérateurs de Sequelize

const cors = require("cors");

app.use(
	cors({
		origin: "http://localhost:5173", // URL de ton frontend Vue.js
		credentials: true // Pour autoriser les cookies et les identifiants partagés
	})
);
app.use(express.json());

// Synchronisation de la base de données
sequelize
	.sync()
	.then(() => console.log("Base de données synchronisée"))
	.catch((err) => console.error("Erreur de synchronisation :", err));

// Routes
// Obtenir toutes les dépenses
app.get("/depenses", async (req, res) => {
	try {
		const today = new Date();
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

		const depenses = await Depense.findAll({
			include: {
				model: Category, // Assure-toi d'importer et de définir la relation dans Sequelize
				attributes: ["name"] // Nous ne voulons que le 'name' de la catégorie
			},
			where: {
				date: {
					[Op.gte]: startOfMonth, // Dépenses à partir du premier jour du mois
					[Op.lte]: endOfMonth // Dépenses jusqu'au dernier jour du mois
				}
			},
			order: [
				["date", "DESC"] // Trie les dépenses par la colonne 'date' du plus récent au plus ancien
			]
		});

		const depensesWithCategoryName = depenses.map((depense) => ({
			id: depense.id,
			name: depense.name,
			description: depense.description,
			value: depense.value,
			date: depense.date,
			categoryId: depense.categoryId,
			categoryName: depense.Category.name // Le 'name' de la catégorie joint
		}));

		res.json(depensesWithCategoryName);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Ajouter une nouvelle dépense
app.post("/depenses", async (req, res) => {
	const { name, description, value, date, categoryId } = req.body;

	try {
		const depense = await Depense.create({
			name,
			description,
			value,
			date,
			categoryId
		});

		res.status(201).json(depense);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Obtenir une dépense par ID
app.get("/depenses/:id", async (req, res) => {
	try {
		const depense = await Depense.findByPk(req.params.id);
		if (depense) {
			res.json(depense);
		} else {
			res.status(404).json({ message: "Dépense non trouvée" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Modifier une dépense
app.put("/depenses/:id", async (req, res) => {
	try {
		const depense = await Depense.findByPk(req.params.id);
		if (depense) {
			await depense.update(req.body);
			res.json(depense);
		} else {
			res.status(404).json({ message: "Dépense non trouvée" });
		}
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Supprimer une dépense
app.delete("/depenses/:id", async (req, res) => {
	try {
		const depense = await Depense.findByPk(req.params.id);
		if (depense) {
			await depense.destroy();
			res.status(204).end();
		} else {
			res.status(404).json({ message: "Dépense non trouvée" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

app.get("/categories", async (req, res) => {
	try {
		const categories = await Category.findAll();
		res.json(categories);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Créer une nouvelle catégorie
app.post("/categories", async (req, res) => {
	const { name } = req.body;

	try {
		// Vérifier si la catégorie existe déjà
		const existingCategory = await Category.findOne({ where: { name } });
		if (existingCategory) {
			return res.status(400).json({ message: "Category already exists" });
		}

		// Créer la nouvelle catégorie
		const newCategory = await Category.create({ name });
		res.status(201).json(newCategory);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Démarrer le serveur
app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
