import express from "express";
import pool from "../db/connection.js";

const router = express.Router();

// GET all preset drinks (for dropdown)
router.get("/presets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM drinks WHERE is_custom = false ORDER BY name",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting presets:", error);
    res.status(500).json({ error: "Failed to get preset drinks" });
  }
});

// GET today's stats (MOVED BEFORE the "/" route!)
router.get("/stats/today", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(drinks.caffeine_mg), 0) as total_caffeine,
        COUNT(intake_logs.id) as total_drinks
      FROM intake_logs
      JOIN drinks ON intake_logs.drink_id = drinks.id
      WHERE DATE(intake_logs.consumed_at) = CURRENT_DATE
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

// GET today's logged drinks (with JOIN to get drink details)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        intake_logs.id,
        intake_logs.consumed_at,
        drinks.name AS drink_name,
        drinks.caffeine_mg,
        drinks.is_custom
      FROM intake_logs
      JOIN drinks ON intake_logs.drink_id = drinks.id
      WHERE DATE(intake_logs.consumed_at) = CURRENT_DATE
      ORDER BY intake_logs.consumed_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting intake logs:", error);
    res.status(500).json({ error: "Failed to get drinks" });
  }
});

// POST log a drink (preset OR custom)
router.post("/", async (req, res) => {
  try {
    const { drink_id, custom_name, custom_caffeine_mg } = req.body;

    let finalDrinkId = drink_id;

    // If custom drink provided, create it first
    if (custom_name && custom_caffeine_mg) {
      // Check if this custom drink already exists
      const existing = await pool.query(
        "SELECT id FROM drinks WHERE name = $1 AND is_custom = true",
        [custom_name],
      );

      if (existing.rows.length > 0) {
        // Custom drink already exists, use ID
        finalDrinkId = existing.rows[0].id;
      } else {
        // Create new custom drink
        const newDrink = await pool.query(
          "INSERT INTO drinks (name, caffeine_mg, is_custom) VALUES ($1, $2, true) RETURNING id",
          [custom_name, custom_caffeine_mg],
        );
        finalDrinkId = newDrink.rows[0].id;
      }
    }

    // Validation
    if (!finalDrinkId) {
      return res.status(400).json({
        error: "Either drink_id or (custom_name + custom_caffeine_mg) required",
      });
    }

    // Log the drink in intake_logs
    const result = await pool.query(
      "INSERT INTO intake_logs (drink_id) VALUES ($1) RETURNING *",
      [finalDrinkId],
    );

    // Get full drink details to return to frontend
    const drinkDetails = await pool.query(
      `
      SELECT 
        intake_logs.id,
        intake_logs.consumed_at,
        drinks.name AS drink_name,
        drinks.caffeine_mg,
        drinks.is_custom
      FROM intake_logs
      JOIN drinks ON intake_logs.drink_id = drinks.id
      WHERE intake_logs.id = $1
    `,
      [result.rows[0].id],
    );

    res.status(201).json(drinkDetails.rows[0]);
  } catch (error) {
    console.error("Error logging drink:", error);
    res.status(500).json({ error: "Failed to log drink" });
  }
});

// DELETE a logged drink
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM intake_logs WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Drink not found" });
    }

    res.json({
      message: "Drink deleted successfully",
      id: parseInt(id),
    });
  } catch (error) {
    console.error("Error deleting drink:", error);
    res.status(500).json({ error: "Failed to delete drink" });
  }
});

export default router;
