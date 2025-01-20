const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateDegerlendirmeKriteri = [
  body("dersId").isInt(),
  body("kriterAdi").notEmpty().trim(),
  body("etkiOrani").isFloat({ min: 0, max: 1 }),
];

// Değerlendirme Kriteri Ekle
router.post(
  "/degerlendirmeKriteriEkle",
  validateDegerlendirmeKriteri,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dersId, kriterAdi, etkiOrani } = req.body;

      // Insert new evaluation criteria
      const [result] = await pool.query(
        "INSERT INTO degerlendirme_kriterleri (ders_id, kriter_adi, etki_orani) VALUES (?, ?, ?)",
        [dersId, kriterAdi, etkiOrani]
      );

      res.status(201).json({
        message: "Değerlendirme kriteri başarıyla eklendi",
        kriterId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Değerlendirme Kriteri Düzenle
router.put(
  "/degerlendirmeKriteriDuzenle/:id",
  validateDegerlendirmeKriteri,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dersId, kriterAdi, etkiOrani } = req.body;
      const kriterId = req.params.id;

      const [result] = await pool.query(
        "UPDATE degerlendirme_kriterleri SET ders_id = ?, kriter_adi = ?, etki_orani = ? WHERE id = ?",
        [dersId, kriterAdi, etkiOrani, kriterId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Değerlendirme kriteri bulunamadı" });
      }

      res.json({ message: "Değerlendirme kriteri başarıyla güncellendi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Değerlendirme Kriteri Sil
router.delete("/degerlendirmeKriteriSil/:id", async (req, res) => {
  try {
    const kriterId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM degerlendirme_kriterleri WHERE id = ?",
      [kriterId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Değerlendirme kriteri bulunamadı" });
    }

    res.json({ message: "Değerlendirme kriteri başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Değerlendirme Kriterlerini Listele
router.get("/dersDegerlendirmeKriterleri/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [kriterler] = await pool.query(
      "SELECT * FROM degerlendirme_kriterleri WHERE ders_id = ?",
      [dersId]
    );

    res.json(kriterler);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
