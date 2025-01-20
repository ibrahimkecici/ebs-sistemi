const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateDers = [
  body("dersAdi").notEmpty().trim(),
  body("dersKodu").notEmpty().trim(),
  body("fakulte").notEmpty().trim(),
  body("ogretimDuzeyi").notEmpty().trim(),
  body("kredi").isFloat({ min: 0 }),
  body("ogretimUyesi").notEmpty().trim(),
];

// Ders Ekle
router.post("/dersEkle", validateDers, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      dersAdi,
      dersKodu,
      fakulte,
      ogretimDuzeyi,
      kredi,
      ogretimUyesi,
      programId,
    } = req.body;

    // Check if course exists
    const [existing] = await pool.query(
      "SELECT * FROM dersler WHERE ders_kodu = ?",
      [dersKodu]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Bu ders zaten mevcut" });
    }

    // Insert new course
    const [result] = await pool.query(
      "INSERT INTO dersler (program_id,ders_adi, ders_kodu, fakulte, ogretim_duzeyi, kredi, ogretim_uyesi) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        programId,
        dersAdi,
        dersKodu,
        fakulte,
        ogretimDuzeyi,
        kredi,
        ogretimUyesi,
      ]
    );

    res.status(201).json({
      message: "Ders başarıyla eklendi",
      dersId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Düzenle
router.put("/dersDuzenle/:id", validateDers, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      programId,
      dersAdi,
      dersKodu,
      fakulte,
      ogretimDuzeyi,
      kredi,
      ogretimUyesi,
    } = req.body;
    const dersId = req.params.id;

    const [result] = await pool.query(
      "UPDATE dersler SET program_id = ?, ders_adi = ?, ders_kodu = ?, fakulte = ?, ogretim_duzeyi = ?, kredi = ?, ogretim_uyesi = ? WHERE id = ?",
      [
        programId,
        dersAdi,
        dersKodu,
        fakulte,
        ogretimDuzeyi,
        kredi,
        ogretimUyesi,
        dersId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ders bulunamadı" });
    }

    res.json({ message: "Ders başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Sil
router.delete("/dersSil/:id", async (req, res) => {
  try {
    const dersId = req.params.id;

    const [result] = await pool.query("DELETE FROM dersler WHERE id = ?", [
      dersId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ders bulunamadı" });
    }

    res.json({ message: "Ders başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Dersleri Listele
router.get("/dersler", async (req, res) => {
  try {
    const [dersler] = await pool.query(
      `SELECT 
        d.id as _id,
        d.program_id as programId,
        d.ders_adi as dersAdi,
        d.ders_kodu as dersKodu,
        d.fakulte,
        d.ogretim_duzeyi as ogretimDuzeyi,
        d.kredi,
        d.ogretim_uyesi as ogretimUyesi,
        p.program_adi as programAdi
      FROM dersler d
      JOIN programlar p ON d.program_id = p.id`
    );
    console.log("Fetched courses:", dersler);
    res.json(dersler);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Tek Ders Getir
router.get("/ders/:id", async (req, res) => {
  try {
    const dersId = req.params.id;
    const [ders] = await pool.query("SELECT * FROM dersler WHERE id = ?", [
      dersId,
    ]);

    if (ders.length === 0) {
      return res.status(404).json({ message: "Ders bulunamadı" });
    }

    res.json(ders[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
