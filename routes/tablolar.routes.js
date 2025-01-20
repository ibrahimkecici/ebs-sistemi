const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const xlsx = require("xlsx");
const path = require("path");

// Program Çıktısı - Ders Çıktısı İlişki Tablosu
router.get(
  "/programCiktisiDersCiktisiIliskisiTablosu/:dersId",
  async (req, res) => {
    try {
      const dersId = req.params.dersId;
      const [results] = await pool.query(
        `SELECT 
                poc.id as program_ciktisi_id,
                poc.ogrenme_ciktisi as program_ciktisi,
                doc.id as ders_ciktisi_id,
                doc.ogrenme_ciktisi as ders_ciktisi,
                COALESCE(pdci.deger, 0) as iliskiDegeri
            FROM ders_ogrenme_ciktilari doc
            CROSS JOIN program_ogrenme_ciktilari poc
            LEFT JOIN program_ders_ciktisi_iliskisi pdci 
                ON pdci.program_ciktisi_id = poc.id 
                AND pdci.ders_ciktisi_id = doc.id
            WHERE doc.ders_id = ?`,
        [dersId]
      );

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Ders Çıktısı - Değerlendirme Kriteri Tablosu
router.get(
  "/dersCiktisiDegerlendirmeKriteriTablosu/:dersId",
  async (req, res) => {
    try {
      const dersId = req.params.dersId;
      const [results] = await pool.query(
        `SELECT 
          doc.id as ders_ciktisi_id,
          doc.ogrenme_ciktisi as ders_ciktisi,
          dk.id as degerlendirme_kriteri_id,
          dk.kriter_adi,
          dk.etki_orani,
          COALESCE(dcdk.deger, 0) as iliskiDegeri
        FROM ders_ogrenme_ciktilari doc
        CROSS JOIN degerlendirme_kriterleri dk
        LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
          ON dcdk.ders_ciktisi_id = doc.id 
          AND dcdk.degerlendirme_kriteri_id = dk.id
        WHERE doc.ders_id = ? AND dk.ders_id = ?`,
        [dersId, dersId]
      );

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Ders Ağırlıklı Değerlendirme Tablosu
router.get("/dersAgirlikliDegerlendirmeTablosu/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [results] = await pool.query(
      `SELECT 
                doc.id as ders_ciktisi_id,
                doc.ogrenme_ciktisi as ders_ciktisi,
                dk.id as degerlendirme_kriteri_id,
                dk.kriter_adi,
                dk.etki_orani,
                COALESCE(dcdk.deger * dk.etki_orani, 0) as agirlikliDeger
            FROM ders_ogrenme_ciktilari doc
            CROSS JOIN degerlendirme_kriterleri dk
            LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
                ON dcdk.ders_ciktisi_id = doc.id 
                AND dcdk.degerlendirme_kriteri_id = dk.id
            WHERE doc.ders_id = ? AND dk.ders_id = ?`,
      [dersId, dersId]
    );

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Öğrenci Ders Çıktısı Başarı Oranı Tablosu
router.get(
  "/ogrenciDersCiktisiBasariOraniTablosu/:dersId",
  async (req, res) => {
    try {
      const dersId = req.params.dersId;
      const [results] = await pool.query(
        `WITH OgrenciNotlari AS (
          SELECT 
            doc.id as ders_ciktisi_id,
            doc.ogrenme_ciktisi as ders_ciktisi,
            dk.id as degerlendirme_kriteri_id,
            dk.kriter_adi,
            dk.etki_orani,
            dcdk.deger as iliskiDegeri,
            COALESCE(n.aldigi_not, 0) as aldigi_not,
            CASE WHEN n.aldigi_not IS NOT NULL THEN 1 ELSE 0 END as not_var
          FROM ders_ogrenme_ciktilari doc
          CROSS JOIN degerlendirme_kriterleri dk
          LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
            ON dcdk.ders_ciktisi_id = doc.id 
            AND dcdk.degerlendirme_kriteri_id = dk.id
          LEFT JOIN notlar n ON n.kriter_id = dk.id
          WHERE doc.ders_id = ? AND dk.ders_id = ?
        )
        SELECT 
          ders_ciktisi_id,
          ders_ciktisi,
          kriter_adi,
          ROUND(SUM(aldigi_not * etki_orani * iliskiDegeri) / 
            CASE WHEN SUM(not_var * etki_orani * iliskiDegeri) = 0 THEN 1 
            ELSE SUM(not_var * etki_orani * iliskiDegeri) END, 2) as deger,
          ROUND(SUM(not_var * etki_orani * iliskiDegeri) * 100, 2) as maxDeger
        FROM OgrenciNotlari
        GROUP BY ders_ciktisi_id, ders_ciktisi, kriter_adi
        ORDER BY ders_ciktisi_id, kriter_adi`,
        [dersId, dersId]
      );

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Öğrenci Program Çıktısı Başarı Oranı Tablosu
router.get(
  "/ogrenciProgramCiktisiBasariOraniTablosu/:programId",
  async (req, res) => {
    try {
      const programId = req.params.programId;
      const [results] = await pool.query(
        `WITH DersCiktisiBasariOranlari AS (
                SELECT 
                    o.ogrenci_no,
                    o.ogrenci_adi,
                    o.ogrenci_soyadi,
                    doc.id as ders_ciktisi_id,
                    SUM(COALESCE(n.aldigi_not * dk.etki_orani * dcdk.deger, 0)) / 
                    SUM(CASE WHEN n.aldigi_not IS NOT NULL THEN dk.etki_orani * dcdk.deger ELSE 0 END) as dersCiktisiBasariOrani
                FROM ogrenciler o
                JOIN dersler d ON d.program_id = ?
                JOIN ders_ogrenme_ciktilari doc ON doc.ders_id = d.id
                JOIN ders_ciktisi_degerlendirme_kriteri dcdk ON dcdk.ders_ciktisi_id = doc.id
                JOIN degerlendirme_kriterleri dk ON dk.id = dcdk.degerlendirme_kriteri_id
                LEFT JOIN notlar n ON n.ogrenci_no = o.ogrenci_no AND n.kriter_id = dk.id
                WHERE o.program_id = ?
                GROUP BY o.ogrenci_no, doc.id
            )
            SELECT 
                dcbo.ogrenci_no,
                dcbo.ogrenci_adi,
                dcbo.ogrenci_soyadi,
                poc.id as program_ciktisi_id,
                poc.ogrenme_ciktisi,
                SUM(COALESCE(dcbo.dersCiktisiBasariOrani * pdci.deger, 0)) / 
                SUM(CASE WHEN dcbo.dersCiktisiBasariOrani IS NOT NULL THEN pdci.deger ELSE 0 END) as programCiktisiBasariOrani
            FROM DersCiktisiBasariOranlari dcbo
            CROSS JOIN program_ogrenme_ciktilari poc
            LEFT JOIN program_ders_ciktisi_iliskisi pdci 
                ON pdci.program_ciktisi_id = poc.id 
                AND pdci.ders_ciktisi_id = dcbo.ders_ciktisi_id
            WHERE poc.program_id = ?
            GROUP BY dcbo.ogrenci_no, poc.id`,
        [programId, programId, programId]
      );

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Excel export functions
function createExcelFile(data, filename) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

// Excel Export Routes
router.get(
  "/programCiktisiDersCiktisiIliskisiExcel/:dersId",
  async (req, res) => {
    try {
      const dersId = req.params.dersId;
      const [results] = await pool.query(
        `SELECT 
          poc.id as program_ciktisi_id,
          poc.ogrenme_ciktisi as program_ciktisi,
          doc.id as ders_ciktisi_id,
          doc.ogrenme_ciktisi as ders_ciktisi,
          COALESCE(pdci.deger, 0) as iliskiDegeri
        FROM ders_ogrenme_ciktilari doc
        CROSS JOIN program_ogrenme_ciktilari poc
        LEFT JOIN program_ders_ciktisi_iliskisi pdci 
          ON pdci.program_ciktisi_id = poc.id 
          AND pdci.ders_ciktisi_id = doc.id
        WHERE doc.ders_id = ?`,
        [dersId]
      );

      // Get unique ders çıktıları
      const dersCiktilari = Array.from(
        new Set(results.map((item) => item.ders_ciktisi))
      );

      // Group by program çıktısı
      const groupedByProgram = results.reduce((acc, curr) => {
        if (!acc[curr.program_ciktisi]) {
          acc[curr.program_ciktisi] = {
            program_ciktisi: curr.program_ciktisi,
            relationships: {},
          };
        }
        acc[curr.program_ciktisi].relationships[curr.ders_ciktisi] =
          curr.iliskiDegeri;
        return acc;
      }, {});

      // Create Excel data
      const excelData = [];

      // Add header row with ders çıktıları
      const headerRow = [
        "Program Çıktısı",
        ...dersCiktilari,
        "Toplam İlişki Değeri",
      ];
      excelData.push(headerRow);

      // Add data rows
      Object.values(groupedByProgram).forEach((group) => {
        const row = [group.program_ciktisi];
        let total = 0;

        dersCiktilari.forEach((dersCiktisi) => {
          const value = group.relationships[dersCiktisi] || 0;
          row.push(value);
          total += value;
        });

        row.push(total); // Add total column
        excelData.push(row);
      });

      // Create workbook and worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 60 }, // Program Çıktısı column
        ...dersCiktilari.map(() => ({ wch: 15 })), // Ders Çıktıları columns
        { wch: 20 }, // Total column
      ];
      ws["!cols"] = colWidths;

      xlsx.utils.book_append_sheet(wb, ws, "Program-Ders İlişkisi");
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=program_ders_ciktisi_iliskisi.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

router.get(
  "/dersCiktisiDegerlendirmeKriteriExcel/:dersId",
  async (req, res) => {
    try {
      const dersId = req.params.dersId;
      const [results] = await pool.query(
        `SELECT 
          doc.id as ders_ciktisi_id,
          doc.ogrenme_ciktisi as ders_ciktisi,
          dk.id as degerlendirme_kriteri_id,
          dk.kriter_adi,
          dk.etki_orani,
          COALESCE(dcdk.deger, 0) as iliskiDegeri
        FROM ders_ogrenme_ciktilari doc
        CROSS JOIN degerlendirme_kriterleri dk
        LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
          ON dcdk.ders_ciktisi_id = doc.id 
          AND dcdk.degerlendirme_kriteri_id = dk.id
        WHERE doc.ders_id = ? AND dk.ders_id = ?`,
        [dersId, dersId]
      );

      // Get unique değerlendirme kriterleri
      const kriterler = Array.from(
        new Set(results.map((item) => item.kriter_adi))
      );

      // Group by ders çıktısı
      const groupedByDersCiktisi = results.reduce((acc, curr) => {
        if (!acc[curr.ders_ciktisi]) {
          acc[curr.ders_ciktisi] = {
            ders_ciktisi: curr.ders_ciktisi,
            relationships: {},
          };
        }
        acc[curr.ders_ciktisi].relationships[curr.kriter_adi] =
          curr.iliskiDegeri;
        return acc;
      }, {});

      // Create Excel data
      const excelData = [];

      // Add headers
      const headerRow = ["Ders Çıktısı", ...kriterler, "Toplam İlişki Değeri"];
      excelData.push(headerRow);

      // Add data rows
      Object.entries(groupedByDersCiktisi).forEach(([dersCiktisi, data]) => {
        const row = [];
        row.push(dersCiktisi);
        let total = 0;
        kriterler.forEach((kriter) => {
          const value = data.relationships[kriter] || 0;
          row.push(value);
          total += value;
        });
        row.push(total);
        excelData.push(row);
      });

      // Create workbook and worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 60 }, // Ders Çıktısı column
        ...kriterler.map(() => ({ wch: 15 })), // Değerlendirme Kriterleri columns
        { wch: 20 }, // Total column
      ];
      ws["!cols"] = colWidths;

      xlsx.utils.book_append_sheet(wb, ws, "Ders-Değerlendirme İlişkisi");
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ders_ciktisi_degerlendirme_kriteri.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

router.get("/dersAgirlikliDegerlendirmeExcel/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [results] = await pool.query(
      `SELECT 
        doc.id as ders_ciktisi_id,
        doc.ogrenme_ciktisi as ders_ciktisi,
        dk.id as degerlendirme_kriteri_id,
        dk.kriter_adi,
        dk.etki_orani,
        COALESCE(dcdk.deger * dk.etki_orani, 0) as agirlikliDeger
      FROM ders_ogrenme_ciktilari doc
      CROSS JOIN degerlendirme_kriterleri dk
      LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
        ON dcdk.ders_ciktisi_id = doc.id 
        AND dcdk.degerlendirme_kriteri_id = dk.id
      WHERE doc.ders_id = ? AND dk.ders_id = ?`,
      [dersId, dersId]
    );

    // Get unique değerlendirme kriterleri for columns
    const kriterler = Array.from(
      new Set(results.map((item) => item.kriter_adi))
    );

    // Group by ders çıktısı
    const groupedByDersCiktisi = results.reduce((acc, curr) => {
      if (!acc[curr.ders_ciktisi]) {
        acc[curr.ders_ciktisi] = {
          ders_ciktisi: curr.ders_ciktisi,
          values: {},
        };
      }
      acc[curr.ders_ciktisi].values[curr.kriter_adi] = curr.agirlikliDeger;
      return acc;
    }, {});

    // Create Excel data
    const excelData = [];

    // Add headers
    const headerRow = ["Ders Çıktısı", ...kriterler, "Toplam Ağırlıklı Değer"];
    excelData.push(headerRow);

    // Add data rows
    Object.values(groupedByDersCiktisi).forEach((group) => {
      const row = [group.ders_ciktisi];
      let total = 0;
      kriterler.forEach((kriter) => {
        const value = Number(group.values[kriter] || 0);
        row.push(value.toFixed(2));
        total += value;
      });
      row.push(total.toFixed(2));
      excelData.push(row);
    });

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 60 }, // Ders Çıktısı column
      ...kriterler.map(() => ({ wch: 15 })), // Değerlendirme Kriterleri columns
      { wch: 20 }, // Total column
    ];
    ws["!cols"] = colWidths;

    xlsx.utils.book_append_sheet(wb, ws, "Ders Ağırlıklı Değerlendirme");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ders_agirlikli_degerlendirme.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.get("/ogrenciDersCiktisiBasariOraniExcel/:dersId", async (req, res) => {
  try {
    const dersId = req.params.dersId;
    const [data] = await pool.query(
      `WITH OgrenciNotlari AS (
                SELECT 
                    o.ogrenci_no,
                    o.ogrenci_adi,
                    o.ogrenci_soyadi,
                    dk.id as degerlendirme_kriteri_id,
                    n.aldigi_not,
                    dk.etki_orani
                FROM ogrenciler o
                CROSS JOIN degerlendirme_kriterleri dk
                LEFT JOIN notlar n ON n.ogrenci_no = o.ogrenci_no AND n.kriter_id = dk.id
                WHERE dk.ders_id = ?
            )
            SELECT 
                CONCAT(on1.ogrenci_adi, ' ', on1.ogrenci_soyadi) as 'Öğrenci',
                on1.ogrenci_no as 'Öğrenci No',
                doc.ogrenme_ciktisi as 'Ders Çıktısı',
                ROUND(SUM(COALESCE(on1.aldigi_not * on1.etki_orani * dcdk.deger, 0)) / 
                SUM(CASE WHEN on1.aldigi_not IS NOT NULL THEN on1.etki_orani * dcdk.deger ELSE 0 END) * 100, 2) as 'Başarı Oranı (%)'
            FROM OgrenciNotlari on1
            CROSS JOIN ders_ogrenme_ciktilari doc
            LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
                ON dcdk.ders_ciktisi_id = doc.id 
                AND dcdk.degerlendirme_kriteri_id = on1.degerlendirme_kriteri_id
            WHERE doc.ders_id = ?
            GROUP BY on1.ogrenci_no, doc.id`,
      [dersId, dersId]
    );

    const buffer = createExcelFile(
      data,
      "ogrenci_ders_ciktisi_basari_orani.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ogrenci_ders_ciktisi_basari_orani.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.get(
  "/ogrenciProgramCiktisiBasariOraniExcel/:programId",
  async (req, res) => {
    try {
      const programId = req.params.programId;
      const [data] = await pool.query(
        `WITH DersCiktisiBasariOranlari AS (
                SELECT 
                    o.ogrenci_no,
                    o.ogrenci_adi,
                    o.ogrenci_soyadi,
                    doc.id as ders_ciktisi_id,
                    SUM(COALESCE(n.aldigi_not * dk.etki_orani * dcdk.deger, 0)) / 
                    SUM(CASE WHEN n.aldigi_not IS NOT NULL THEN dk.etki_orani * dcdk.deger ELSE 0 END) as dersCiktisiBasariOrani
                FROM ogrenciler o
                JOIN dersler d ON d.program_id = ?
                JOIN ders_ogrenme_ciktilari doc ON doc.ders_id = d.id
                JOIN ders_ciktisi_degerlendirme_kriteri dcdk ON dcdk.ders_ciktisi_id = doc.id
                JOIN degerlendirme_kriterleri dk ON dk.id = dcdk.degerlendirme_kriteri_id
                LEFT JOIN notlar n ON n.ogrenci_no = o.ogrenci_no AND n.kriter_id = dk.id
                WHERE o.program_id = ?
                GROUP BY o.ogrenci_no, doc.id
            )
            SELECT 
                CONCAT(dcbo.ogrenci_adi, ' ', dcbo.ogrenci_soyadi) as 'Öğrenci',
                dcbo.ogrenci_no as 'Öğrenci No',
                poc.ogrenme_ciktisi as 'Program Çıktısı',
                ROUND(SUM(COALESCE(dcbo.dersCiktisiBasariOrani * pdci.deger, 0)) / 
                SUM(CASE WHEN dcbo.dersCiktisiBasariOrani IS NOT NULL THEN pdci.deger ELSE 0 END) * 100, 2) as 'Başarı Oranı (%)'
            FROM DersCiktisiBasariOranlari dcbo
            CROSS JOIN program_ogrenme_ciktilari poc
            LEFT JOIN program_ders_ciktisi_iliskisi pdci 
                ON pdci.program_ciktisi_id = poc.id 
                AND pdci.ders_ciktisi_id = dcbo.ders_ciktisi_id
            WHERE poc.program_id = ?
            GROUP BY dcbo.ogrenci_no, poc.id`,
        [programId, programId, programId]
      );

      const buffer = createExcelFile(
        data,
        "ogrenci_program_ciktisi_basari_orani.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ogrenci_program_ciktisi_basari_orani.xlsx"
      );
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

module.exports = router;
