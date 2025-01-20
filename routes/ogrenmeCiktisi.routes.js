const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateDersOgrenmeCiktisi = [
  body("dersId").isInt(),
  body("ogrenmeCiktisi").notEmpty().trim(),
];

const validateProgramOgrenmeCiktisi = [
  body("programId").isInt(),
  body("ogrenmeCiktisi").notEmpty().trim(),
];

// Ders Öğrenme Çıktısı Ekle
router.post(
  "/dersOgrenmeCiktisiEkle",
  validateDersOgrenmeCiktisi,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dersId, ogrenmeCiktisi } = req.body;

      const [result] = await pool.query(
        "INSERT INTO ders_ogrenme_ciktilari (ders_id, ogrenme_ciktisi) VALUES (?, ?)",
        [dersId, ogrenmeCiktisi]
      );

      res.status(201).json({
        message: "Ders öğrenme çıktısı başarıyla eklendi",
        ciktiId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Ders Öğrenme Çıktısı Düzenle
router.put(
  "/dersOgrenmeCiktisiDuzenle/:id",
  validateDersOgrenmeCiktisi,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dersId, ogrenmeCiktisi } = req.body;
      const ciktiId = req.params.id;

      const [result] = await pool.query(
        "UPDATE ders_ogrenme_ciktilari SET ders_id = ?, ogrenme_ciktisi = ? WHERE id = ?",
        [dersId, ogrenmeCiktisi, ciktiId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Ders öğrenme çıktısı bulunamadı" });
      }

      res.json({ message: "Ders öğrenme çıktısı başarıyla güncellendi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Ders Öğrenme Çıktısı Sil
router.delete("/dersOgrenmeCiktisiSil/:id", async (req, res) => {
  try {
    const ciktiId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM ders_ogrenme_ciktilari WHERE id = ?",
      [ciktiId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Ders öğrenme çıktısı bulunamadı" });
    }

    res.json({ message: "Ders öğrenme çıktısı başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Öğrenme Çıktılarını Listele
router.get("/dersOgrenmeCiktilari/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [ciktilar] = await pool.query(
      "SELECT * FROM ders_ogrenme_ciktilari WHERE ders_id = ?",
      [dersId]
    );

    res.json(ciktilar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Program Öğrenme Çıktısı Ekle
router.post(
  "/programOgrenmeCiktisiEkle",
  validateProgramOgrenmeCiktisi,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { programId, ogrenmeCiktisi } = req.body;

      const [result] = await pool.query(
        "INSERT INTO program_ogrenme_ciktilari (program_id, ogrenme_ciktisi) VALUES (?, ?)",
        [programId, ogrenmeCiktisi]
      );

      res.status(201).json({
        message: "Program öğrenme çıktısı başarıyla eklendi",
        ciktiId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Program Öğrenme Çıktısı Düzenle
router.put(
  "/programOgrenmeCiktisiDuzenle/:id",
  validateProgramOgrenmeCiktisi,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { programId, ogrenmeCiktisi } = req.body;
      const ciktiId = req.params.id;

      const [result] = await pool.query(
        "UPDATE program_ogrenme_ciktilari SET program_id = ?, ogrenme_ciktisi = ? WHERE id = ?",
        [programId, ogrenmeCiktisi, ciktiId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Program öğrenme çıktısı bulunamadı" });
      }

      res.json({ message: "Program öğrenme çıktısı başarıyla güncellendi" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Program Öğrenme Çıktısı Sil
router.delete("/programOgrenmeCiktisiSil/:id", async (req, res) => {
  try {
    const ciktiId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM program_ogrenme_ciktilari WHERE id = ?",
      [ciktiId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Program öğrenme çıktısı bulunamadı" });
    }

    res.json({ message: "Program öğrenme çıktısı başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Program Öğrenme Çıktılarını Listele
router.get("/programOgrenmeCiktilari/:programId", async (req, res) => {
  try {
    const programId = req.params.programId;
    const [ciktilar] = await pool.query(
      "SELECT * FROM program_ogrenme_ciktilari WHERE program_id = ?",
      [programId]
    );

    res.json(ciktilar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Program Çıktısı - Ders Çıktısı İlişkisi Güncelle
router.post("/programCiktisiDersCiktisiIliskisiGuncelle", async (req, res) => {
  try {
    const { programCiktisiId, dersCiktisiId, deger } = req.body;

    await pool.query(
      "INSERT INTO program_ders_ciktisi_iliskisi (program_ciktisi_id, ders_ciktisi_id, deger) VALUES (?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE deger = VALUES(deger)",
      [programCiktisiId, dersCiktisiId, deger]
    );

    res.json({ message: "İlişki başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Çıktısı - Değerlendirme Kriteri İlişkisi Güncelle
router.post("/dersCiktisiDegerlendirmeKriteriGuncelle", async (req, res) => {
  try {
    const { dersCiktisiId, degerlendirmeKriteriId, deger } = req.body;

    await pool.query(
      "INSERT INTO ders_ciktisi_degerlendirme_kriteri (ders_ciktisi_id, degerlendirme_kriteri_id, deger) VALUES (?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE deger = VALUES(deger)",
      [dersCiktisiId, degerlendirmeKriteriId, deger]
    );

    res.json({ message: "İlişki başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
