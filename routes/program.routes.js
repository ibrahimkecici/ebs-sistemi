const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateProgram = [
  body("programAdi").notEmpty().trim(),
  body("programBilgi").notEmpty().trim(),
  body("programFakultesi").notEmpty().trim(),
  body("programOgretimTuru").notEmpty().trim(),
  body("programOgretimSuresi").isInt({ min: 1 }),
];

// Program Ekle
router.post("/programEkle", validateProgram, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      programAdi,
      programBilgi,
      programFakultesi,
      programOgretimTuru,
      programOgretimSuresi,
    } = req.body;

    // Check if program exists
    const [existing] = await pool.query(
      "SELECT * FROM programlar WHERE program_adi = ?",
      [programAdi]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Bu program zaten mevcut" });
    }

    // Insert new program
    const [result] = await pool.query(
      "INSERT INTO programlar (program_adi, program_bilgi, program_fakultesi, program_ogretim_turu, program_ogretim_suresi) VALUES (?, ?, ?, ?, ?)",
      [
        programAdi,
        programBilgi,
        programFakultesi,
        programOgretimTuru,
        programOgretimSuresi,
      ]
    );

    res.status(201).json({
      message: "Program başarıyla eklendi",
      programId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Program Düzenle
router.put("/programDuzenle/:id", validateProgram, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      programAdi,
      programBilgi,
      programFakultesi,
      programOgretimTuru,
      programOgretimSuresi,
    } = req.body;
    const programId = req.params.id;

    const [result] = await pool.query(
      "UPDATE programlar SET program_adi = ?, program_bilgi = ?, program_fakultesi = ?, program_ogretim_turu = ?, program_ogretim_suresi = ? WHERE id = ?",
      [
        programAdi,
        programBilgi,
        programFakultesi,
        programOgretimTuru,
        programOgretimSuresi,
        programId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Program bulunamadı" });
    }

    res.json({ message: "Program başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Program Sil
router.delete("/programSil/:id", async (req, res) => {
  try {
    const programId = req.params.id;

    const [result] = await pool.query("DELETE FROM programlar WHERE id = ?", [
      programId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Program bulunamadı" });
    }

    res.json({ message: "Program başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Programları Listele
router.get("/programlar", async (req, res) => {
  try {
    const [programs] = await pool.query(
      `SELECT 
        id as _id,
        program_adi as programAdi,
        program_bilgi as programBilgi,
        program_fakultesi as programFakulte,
        program_ogretim_turu as programOgretimTuru,
        program_ogretim_suresi as programOgretimSuresi
      FROM programlar`
    );
    console.log("Fetched programs:", programs);
    res.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;
