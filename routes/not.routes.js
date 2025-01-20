const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const xlsx = require("xlsx");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Sadece Excel dosyaları yüklenebilir!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("file");

// Validation middleware
const validateNot = [
  body("ogrenciNo").notEmpty().trim(),
  body("kriterId").isInt(),
  body("aldigiNot").isFloat({ min: 0, max: 100 }),
];

// Not Ekle
router.post("/notEkle", validateNot, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ogrenciNo, kriterId, aldigiNot } = req.body;

    // Insert or update grade
    const [result] = await pool.query(
      "INSERT INTO notlar (ogrenci_no, kriter_id, aldigi_not) VALUES (?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE aldigi_not = VALUES(aldigi_not)",
      [ogrenciNo, kriterId, aldigiNot]
    );

    res.status(201).json({
      message: "Not başarıyla kaydedildi",
      notId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Not Yükle (Excel)
router.post("/notYukle", (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "Dosya yükleme hatası: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Lütfen bir Excel dosyası yükleyin" });
    }

    try {
      const dersId = req.body.dersId;
      if (!dersId) {
        return res.status(400).json({ message: "Ders ID gerekli" });
      }

      // Dersin değerlendirme kriterlerini getir
      const [kriterler] = await pool.query(
        "SELECT id, kriter_adi FROM degerlendirme_kriterleri WHERE ders_id = ?",
        [dersId]
      );

      if (kriterler.length === 0) {
        return res.status(404).json({
          message: "Bu ders için değerlendirme kriterleri bulunamadı",
        });
      }

      // Excel'deki sütun adlarını kriter adlarıyla eşleştir
      const kriterMap = new Map();
      const workbook = xlsx.readFile(req.file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // İlk satırdan sütun başlıklarını al
      const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];

      // Kriterleri başlıklarla eşleştir
      kriterler.forEach((kriter) => {
        kriterMap.set(kriter.id, kriter.kriter_adi);
      });

      console.log(kriterMap, "kriterMap");

      const data = xlsx.utils.sheet_to_json(worksheet);
      const errors = [];
      const success = [];

      for (const row of data) {
        const ogrenciNo = row["Öğrenci No"];
        const notlar = {};

        // Her bir sütun başlığı için not değerlerini al
        headers.forEach((header) => {
          if (header !== "Öğrenci No" && row[header] !== undefined) {
            notlar[header] = row[header];
          }
        });

        if (!ogrenciNo) {
          continue;
        }

        try {
          // Öğrencinin sistemde kayıtlı olup olmadığını kontrol et
          const [ogrenci] = await pool.query(
            "SELECT ogrenci_no FROM ogrenciler WHERE ogrenci_no = ?",
            [ogrenciNo]
          );

          if (ogrenci.length === 0) {
            errors.push(`Öğrenci numarası ${ogrenciNo} sistemde kayıtlı değil`);
            continue;
          }

          // Her bir kriter için notları kontrol et ve ekle/güncelle
          for (const [kriterId, kriterAdi] of kriterMap) {
            const header = headers.find(
              (h) => h && kriterAdi.toLowerCase().includes(h.toLowerCase())
            );
            if (header && row[header] !== undefined) {
              await pool.query(
                "INSERT INTO notlar (ogrenci_no, kriter_id, aldigi_not) VALUES (?, ?, ?) " +
                  "ON DUPLICATE KEY UPDATE aldigi_not = VALUES(aldigi_not)",
                [ogrenciNo, kriterId, row[header]]
              );
            }
          }

          success.push(
            `${ogrenciNo} numaralı öğrencinin notları başarıyla eklendi/güncellendi`
          );
        } catch (error) {
          errors.push(
            `${ogrenciNo} numaralı öğrencinin notları eklenirken hata oluştu: ${error.message}`
          );
        }
      }

      res.json({
        message: "İşlem tamamlandı",
        success: success,
        errors: errors,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });
});

// Not Düzenle
router.put("/notDuzenle", validateNot, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ogrenciNo, kriterId, aldigiNot } = req.body;

    const [result] = await pool.query(
      "UPDATE notlar SET aldigi_not = ? WHERE ogrenci_no = ? AND kriter_id = ?",
      [aldigiNot, ogrenciNo, kriterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not bulunamadı" });
    }

    res.json({ message: "Not başarıyla güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Not Sil
router.delete("/notSil", async (req, res) => {
  try {
    const { ogrenciNo, kriterId } = req.body;

    const [result] = await pool.query(
      "DELETE FROM notlar WHERE ogrenci_no = ? AND kriter_id = ?",
      [ogrenciNo, kriterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not bulunamadı" });
    }

    res.json({ message: "Not başarıyla silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Ders Notları
router.get("/dersNotlar/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [notlar] = await pool.query(
      `SELECT n.*, o.ogrenci_adi, o.ogrenci_soyadi, dk.kriter_adi 
             FROM notlar n 
             JOIN ogrenciler o ON n.ogrenci_no = o.ogrenci_no 
             JOIN degerlendirme_kriterleri dk ON n.kriter_id = dk.id 
             WHERE dk.ders_id = ?`,
      [dersId]
    );

    res.json(notlar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Öğrenci Notları
router.get("/ogrenciNotlar/:ogrenciNo", async (req, res) => {
  try {
    const ogrenciNo = req.params.ogrenciNo;
    const [notlar] = await pool.query(
      `SELECT n.*, d.ders_adi, dk.kriter_adi 
             FROM notlar n 
             JOIN degerlendirme_kriterleri dk ON n.kriter_id = dk.id 
             JOIN dersler d ON dk.ders_id = d.id 
             WHERE n.ogrenci_no = ?`,
      [ogrenciNo]
    );

    res.json(notlar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Excel Şablonu Dışa Aktar
router.get("/excelSablonu/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;

    // Get evaluation criteria for the course
    const [kriterler] = await pool.query(
      "SELECT id, kriter_adi, etki_orani FROM degerlendirme_kriterleri WHERE ders_id = ?",
      [dersId]
    );

    // Get students for the course
    const [ogrenciler] = await pool.query("SELECT ogrenci_no FROM ogrenciler");

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const wsData = [];

    // Add headers
    const headers = ["Öğrenci No"];
    kriterler.forEach((kriter) => {
      headers.push(`${kriter.kriter_adi}`);
    });
    wsData.push(headers);

    // Add student rows
    ogrenciler.forEach((ogrenci) => {
      const row = [ogrenci.ogrenci_no];
      // Add empty cells for each criterion
      kriterler.forEach(() => row.push(""));
      wsData.push(row);
    });

    const ws = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(workbook, ws, "Not Şablonu");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=not_sablonu.xlsx"
    );

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
