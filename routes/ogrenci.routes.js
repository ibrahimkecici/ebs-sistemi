const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateOgrenci = [
  body("ogrenciNo").notEmpty().trim(),
  body("ogrenciAdi").notEmpty().trim(),
  body("ogrenciSoyadi").notEmpty().trim(),
  body("programId").isInt(),
  body("ogrenciSinifi").isInt({ min: 1 }),
];

// Öğrenci Ekle
router.post("/ogrenciEkle", validateOgrenci, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ogrenciNo, ogrenciAdi, ogrenciSoyadi, programId, ogrenciSinifi } =
      req.body;

    // Check if student exists
    const [existing] = await pool.query(
      "SELECT * FROM ogrenciler WHERE ogrenci_no = ?",
      [ogrenciNo]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Bu öğrenci numarası zaten kayıtlı" });
    }

    // Insert new student
    const [result] = await pool.query(
      "INSERT INTO ogrenciler (ogrenci_no, ogrenci_adi, ogrenci_soyadi, program_id, ogrenci_sinifi) VALUES (?, ?, ?, ?, ?)",
      [ogrenciNo, ogrenciAdi, ogrenciSoyadi, programId, ogrenciSinifi]
    );

    res.status(201).json({
      message: "Öğrenci başarıyla eklendi",
      ogrenciId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Öğrenci Düzenle
router.put("/ogrenciDuzenle/:ogrenciNo", validateOgrenci, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ogrenciAdi, ogrenciSoyadi, programId, ogrenciSinifi } = req.body;
    const ogrenciNo = req.params.ogrenciNo;

    const [result] = await pool.query(
      "UPDATE ogrenciler SET ogrenci_adi = ?, ogrenci_soyadi = ?, program_id = ?, ogrenci_sinifi = ? WHERE ogrenci_no = ?",
      [ogrenciAdi, ogrenciSoyadi, programId, ogrenciSinifi, ogrenciNo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    res.json({ message: "Öğrenci bilgileri başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Öğrenci Sil
router.delete("/ogrenciSil/:ogrenciNo", async (req, res) => {
  try {
    const ogrenciNo = req.params.ogrenciNo;

    const [result] = await pool.query(
      "DELETE FROM ogrenciler WHERE ogrenci_no = ?",
      [ogrenciNo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    res.json({ message: "Öğrenci başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Öğrencileri Listele
router.get("/ogrenciler", async (req, res) => {
  try {
    const [ogrenciler] = await pool.query("SELECT * FROM ogrenciler");
    res.json(ogrenciler);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Tek Öğrenci Getir
router.get("/ogrenci/:ogrenciNo", async (req, res) => {
  try {
    const ogrenciNo = req.params.ogrenciNo;
    const [ogrenci] = await pool.query(
      "SELECT * FROM ogrenciler WHERE ogrenci_no = ?",
      [ogrenciNo]
    );

    if (ogrenci.length === 0) {
      return res.status(404).json({ message: "Öğrenci bulunamadı" });
    }

    res.json(ogrenci[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
