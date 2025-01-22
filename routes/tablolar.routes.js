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
        `WITH OgrenciDersNotlari AS (
          SELECT DISTINCT
            o.ogrenci_no,
            o.ogrenci_adi,
            o.ogrenci_soyadi
          FROM ogrenciler o
          JOIN notlar n ON n.ogrenci_no = o.ogrenci_no
          JOIN degerlendirme_kriterleri dk ON dk.id = n.kriter_id
          WHERE dk.ders_id = ?
        ),
        DersCiktilariVeKriterler AS (
          SELECT 
            doc.id as ders_ciktisi_id,
            doc.ogrenme_ciktisi as ders_ciktisi,
            dk.id as degerlendirme_kriteri_id,
            dk.kriter_adi,
            dk.etki_orani,
            COALESCE(dcdk.deger, 0) as iliski_degeri
          FROM ders_ogrenme_ciktilari doc
          JOIN degerlendirme_kriterleri dk ON dk.ders_id = doc.ders_id
          LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
            ON dcdk.ders_ciktisi_id = doc.id 
            AND dcdk.degerlendirme_kriteri_id = dk.id
          WHERE doc.ders_id = ?
        ),
        OgrenciNotlari AS (
          SELECT 
            odn.ogrenci_no,
            odn.ogrenci_adi,
            odn.ogrenci_soyadi,
            dck.ders_ciktisi_id,
            dck.ders_ciktisi,
            dck.kriter_adi,
            dck.etki_orani,
            dck.iliski_degeri,
            COALESCE(n.aldigi_not, 0) / 100 as aldigi_not
          FROM OgrenciDersNotlari odn
          CROSS JOIN DersCiktilariVeKriterler dck
          LEFT JOIN notlar n 
            ON n.ogrenci_no = odn.ogrenci_no 
            AND n.kriter_id = dck.degerlendirme_kriteri_id
        )
        SELECT 
          ogrenci_no,
          ogrenci_adi,
          ogrenci_soyadi,
          ders_ciktisi_id,
          ders_ciktisi,
          kriter_adi,
          ROUND(
            SUM(aldigi_not * etki_orani * iliski_degeri) / 
            NULLIF(SUM(etki_orani * iliski_degeri), 0)
          , 4) as deger,
          ROUND(
            SUM(etki_orani * iliski_degeri)
          , 4) as maxDeger
        FROM OgrenciNotlari
        GROUP BY 
          ogrenci_no, 
          ogrenci_adi, 
          ogrenci_soyadi,
          ders_ciktisi_id, 
          ders_ciktisi,
          kriter_adi
        ORDER BY 
          ogrenci_no, 
          ders_ciktisi_id, 
          kriter_adi`,
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
        `WITH AllCombinations AS (
          SELECT 
              o.ogrenci_no,
              o.ogrenci_adi,
              o.ogrenci_soyadi,
              doc.id as ders_ciktisi_id,
              doc.ogrenme_ciktisi as ders_ciktisi
          FROM ogrenciler o
          CROSS JOIN ders_ogrenme_ciktilari doc
          JOIN dersler d ON d.id = doc.ders_id AND d.program_id = ?
          WHERE o.program_id = ?
        ),
        DersCiktisiBasariOranlari AS (
          SELECT 
              ac.ogrenci_no,
              ac.ogrenci_adi,
              ac.ogrenci_soyadi,
              ac.ders_ciktisi_id,
              ac.ders_ciktisi,
              COALESCE(
                ROUND(
                  SUM(COALESCE(n.aldigi_not, 0) * dk.etki_orani * dcdk.deger) / 
                  NULLIF(SUM(dk.etki_orani * dcdk.deger), 0),
                  2
                ),
                0
              ) as dersCiktisiBasariOrani
          FROM AllCombinations ac
          LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
            ON dcdk.ders_ciktisi_id = ac.ders_ciktisi_id
          LEFT JOIN degerlendirme_kriterleri dk 
            ON dk.id = dcdk.degerlendirme_kriteri_id
          LEFT JOIN notlar n 
            ON n.ogrenci_no = ac.ogrenci_no 
            AND n.kriter_id = dk.id
          GROUP BY ac.ogrenci_no, ac.ders_ciktisi_id
      ),
      ProgramCiktisiOrtalama AS (
          SELECT 
              dcbo.ogrenci_no,
              dcbo.ogrenci_adi,
              dcbo.ogrenci_soyadi,
              poc.id as program_ciktisi_id,
              poc.ogrenme_ciktisi as program_ciktisi,
              dcbo.ders_ciktisi_id,
              dcbo.ders_ciktisi,
              dcbo.dersCiktisiBasariOrani,
              COALESCE(pdci.deger, 0) as iliskiDegeri,
              ROUND(
                dcbo.dersCiktisiBasariOrani * COALESCE(pdci.deger, 0),
                2
              ) as weighted_success,
              ROUND(
                AVG(dcbo.dersCiktisiBasariOrani * COALESCE(pdci.deger, 0)) OVER (
                  PARTITION BY dcbo.ogrenci_no, poc.id
                ),
                2
              ) as ortalama_basari
          FROM DersCiktisiBasariOranlari dcbo
          CROSS JOIN program_ogrenme_ciktilari poc
          LEFT JOIN program_ders_ciktisi_iliskisi pdci 
            ON pdci.program_ciktisi_id = poc.id 
            AND pdci.ders_ciktisi_id = dcbo.ders_ciktisi_id
          WHERE poc.program_id = ?
      )
      SELECT 
          pcbo.ogrenci_no,
          pcbo.ogrenci_adi,
          pcbo.ogrenci_soyadi,
          pcbo.program_ciktisi,
          pcbo.ders_ciktisi,
          pcbo.dersCiktisiBasariOrani as ders_ciktisi_basari_orani,
          pcbo.weighted_success,
          pcbo.ortalama_basari
      FROM ProgramCiktisiOrtalama pcbo
      ORDER BY 
          pcbo.ogrenci_no,
          pcbo.program_ciktisi,
          pcbo.ders_ciktisi`,
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
    const [results] = await pool.query(
      `WITH OgrenciDersNotlari AS (
        SELECT DISTINCT
          o.ogrenci_no,
          o.ogrenci_adi,
          o.ogrenci_soyadi
        FROM ogrenciler o
        JOIN notlar n ON n.ogrenci_no = o.ogrenci_no
        JOIN degerlendirme_kriterleri dk ON dk.id = n.kriter_id
        WHERE dk.ders_id = ?
      ),
      DersCiktilariVeKriterler AS (
        SELECT 
          doc.id as ders_ciktisi_id,
          doc.ogrenme_ciktisi as ders_ciktisi,
          dk.id as degerlendirme_kriteri_id,
          dk.kriter_adi,
          dk.etki_orani,
          COALESCE(dcdk.deger, 0) as iliski_degeri
        FROM ders_ogrenme_ciktilari doc
        JOIN degerlendirme_kriterleri dk ON dk.ders_id = doc.ders_id
        LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
          ON dcdk.ders_ciktisi_id = doc.id 
          AND dcdk.degerlendirme_kriteri_id = dk.id
        WHERE doc.ders_id = ?
      ),
      OgrenciNotlari AS (
        SELECT 
          odn.ogrenci_no,
          odn.ogrenci_adi,
          odn.ogrenci_soyadi,
          dck.ders_ciktisi_id,
          dck.ders_ciktisi,
          dck.kriter_adi,
          dck.etki_orani,
          dck.iliski_degeri,
          COALESCE(n.aldigi_not, 0) / 100 as aldigi_not
        FROM OgrenciDersNotlari odn
        CROSS JOIN DersCiktilariVeKriterler dck
        LEFT JOIN notlar n 
          ON n.ogrenci_no = odn.ogrenci_no 
          AND n.kriter_id = dck.degerlendirme_kriteri_id
      )
      SELECT 
        ogrenci_no,
        ogrenci_adi,
        ogrenci_soyadi,
        ders_ciktisi_id,
        ders_ciktisi,
        kriter_adi,
        COALESCE(
          ROUND(
            SUM(aldigi_not * etki_orani * iliski_degeri) / 
            NULLIF(SUM(etki_orani * iliski_degeri), 0)
          , 4),
          0
        ) as deger,
        COALESCE(
          ROUND(
            SUM(etki_orani * iliski_degeri)
          , 4),
          0
        ) as maxDeger
      FROM OgrenciNotlari
      GROUP BY 
        ogrenci_no, 
        ogrenci_adi, 
        ogrenci_soyadi,
        ders_ciktisi_id, 
        ders_ciktisi,
        kriter_adi
      ORDER BY 
        ogrenci_no, 
        ders_ciktisi_id, 
        kriter_adi`,
      [dersId, dersId]
    );

    // Get unique değerlendirme kriterleri for columns
    const kriterler = Array.from(
      new Set(results.map((item) => item.kriter_adi))
    );

    // Group by student
    const studentGroups = results.reduce((acc, curr) => {
      if (!acc[curr.ogrenci_no]) {
        acc[curr.ogrenci_no] = {
          student: {
            ogrenci_no: curr.ogrenci_no,
            ogrenci_adi: curr.ogrenci_adi,
            ogrenci_soyadi: curr.ogrenci_soyadi,
          },
          outcomes: {},
        };
      }
      if (!acc[curr.ogrenci_no].outcomes[curr.ders_ciktisi_id]) {
        acc[curr.ogrenci_no].outcomes[curr.ders_ciktisi_id] = {
          ders_ciktisi: curr.ders_ciktisi,
          values: {},
        };
      }
      acc[curr.ogrenci_no].outcomes[curr.ders_ciktisi_id].values[
        curr.kriter_adi
      ] = {
        deger: curr.deger || 0,
        maxDeger: curr.maxDeger || 0,
      };
      return acc;
    }, {});

    // Create Excel data with headers
    const excelData = [];
    const headerRow = [
      "Ders Çıktısı",
      ...kriterler,
      "Toplam",
      "MAX",
      "%BAŞARI",
    ];
    excelData.push(headerRow);

    // Add data rows for each student
    Object.values(studentGroups).forEach((group) => {
      // Add student header
      excelData.push([
        `${group.student.ogrenci_no} - ${group.student.ogrenci_adi} ${group.student.ogrenci_soyadi}`,
      ]);

      // Add outcomes for this student
      Object.values(group.outcomes).forEach((outcome) => {
        const row = [outcome.ders_ciktisi];
        let totalValue = 0;
        let maxTotalValue = 0;

        kriterler.forEach((kriter) => {
          const value = parseFloat(outcome.values[kriter]?.deger || 0);
          const maxValue = parseFloat(outcome.values[kriter]?.maxDeger || 0);
          row.push(value === 0 ? "0.00%" : `${(value * 100).toFixed(2)}%`);
          totalValue += value * maxValue;
          maxTotalValue += maxValue;
        });

        const basariOrani =
          maxTotalValue > 0 ? (totalValue / maxTotalValue) * 100 : 0;

        // Convert total and max to percentage out of 100
        const totalPercentage = totalValue * 100;
        const maxPercentage = maxTotalValue * 100;

        // Format the values with proper checks
        const totalValueFormatted =
          isNaN(totalPercentage) || totalPercentage === 0
            ? "0.00%"
            : `${totalPercentage.toFixed(2)}%`;
        const maxValueFormatted =
          isNaN(maxPercentage) || maxPercentage === 0
            ? "0.00%"
            : `${maxPercentage.toFixed(2)}%`;
        const basariOraniFormatted = isNaN(basariOrani)
          ? "0.00%"
          : `${basariOrani.toFixed(2)}%`;

        row.push(totalValueFormatted);
        row.push(maxValueFormatted);
        row.push(basariOraniFormatted);

        excelData.push(row);
      });

      // Add empty row between students
      excelData.push([]);
    });

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 60 }, // Ders Çıktısı column
      ...kriterler.map(() => ({ wch: 15 })), // Değerlendirme Kriterleri columns
      { wch: 15 }, // Toplam column
      { wch: 15 }, // MAX column
      { wch: 15 }, // %BAŞARI column
    ];
    ws["!cols"] = colWidths;

    // Style student header rows
    Object.keys(studentGroups).forEach((_, index) => {
      const rowIndex =
        index *
        (Object.keys(studentGroups[Object.keys(studentGroups)[0]].outcomes)
          .length +
          2);
      const cell = xlsx.utils.encode_cell({ r: rowIndex - 1, c: 0 });
      if (!ws[cell]) ws[cell] = {};
      ws[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F5F5F5" } },
      };
    });

    xlsx.utils.book_append_sheet(wb, ws, "Öğrenci Ders Başarı Oranları");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

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
      const [results] = await pool.query(
        `WITH AllCombinations AS (
          SELECT 
              o.ogrenci_no,
              o.ogrenci_adi,
              o.ogrenci_soyadi,
              doc.id as ders_ciktisi_id,
              doc.ogrenme_ciktisi as ders_ciktisi
          FROM ogrenciler o
          CROSS JOIN ders_ogrenme_ciktilari doc
          JOIN dersler d ON d.id = doc.ders_id AND d.program_id = ?
          WHERE o.program_id = ?
        ),
        DersCiktisiBasariOranlari AS (
          SELECT 
              ac.ogrenci_no,
              ac.ogrenci_adi,
              ac.ogrenci_soyadi,
              ac.ders_ciktisi_id,
              ac.ders_ciktisi,
              COALESCE(
                ROUND(
                  SUM(COALESCE(n.aldigi_not, 0) * dk.etki_orani * dcdk.deger) / 
                  NULLIF(SUM(dk.etki_orani * dcdk.deger), 0),
                  2
                ),
                0
              ) as dersCiktisiBasariOrani
          FROM AllCombinations ac
          LEFT JOIN ders_ciktisi_degerlendirme_kriteri dcdk 
            ON dcdk.ders_ciktisi_id = ac.ders_ciktisi_id
          LEFT JOIN degerlendirme_kriterleri dk 
            ON dk.id = dcdk.degerlendirme_kriteri_id
          LEFT JOIN notlar n 
            ON n.ogrenci_no = ac.ogrenci_no 
            AND n.kriter_id = dk.id
          GROUP BY ac.ogrenci_no, ac.ders_ciktisi_id
      ),
      ProgramCiktisiOrtalama AS (
          SELECT 
              dcbo.ogrenci_no,
              dcbo.ogrenci_adi,
              dcbo.ogrenci_soyadi,
              poc.id as program_ciktisi_id,
              poc.ogrenme_ciktisi as program_ciktisi,
              dcbo.ders_ciktisi_id,
              dcbo.ders_ciktisi,
              dcbo.dersCiktisiBasariOrani,
              COALESCE(pdci.deger, 0) as iliskiDegeri,
              ROUND(
                dcbo.dersCiktisiBasariOrani * COALESCE(pdci.deger, 0),
                2
              ) as weighted_success,
              ROUND(
                AVG(dcbo.dersCiktisiBasariOrani * COALESCE(pdci.deger, 0)) OVER (
                  PARTITION BY dcbo.ogrenci_no, poc.id
                ),
                2
              ) as ortalama_basari
          FROM DersCiktisiBasariOranlari dcbo
          CROSS JOIN program_ogrenme_ciktilari poc
          LEFT JOIN program_ders_ciktisi_iliskisi pdci 
            ON pdci.program_ciktisi_id = poc.id 
            AND pdci.ders_ciktisi_id = dcbo.ders_ciktisi_id
          WHERE poc.program_id = ?
      )
      SELECT 
          pcbo.ogrenci_no,
          pcbo.ogrenci_adi,
          pcbo.ogrenci_soyadi,
          pcbo.program_ciktisi,
          pcbo.ders_ciktisi,
          pcbo.dersCiktisiBasariOrani as ders_ciktisi_basari_orani,
          pcbo.weighted_success,
          pcbo.ortalama_basari
      FROM ProgramCiktisiOrtalama pcbo
      ORDER BY 
          pcbo.ogrenci_no,
          pcbo.program_ciktisi,
          pcbo.ders_ciktisi`,
        [programId, programId, programId]
      );

      // Get unique ders çıktıları for columns
      const dersCiktilari = Array.from(
        new Set(results.map((item) => item.ders_ciktisi))
      );

      // Group data by student
      const studentGroups = results.reduce((acc, curr) => {
        const studentKey = `${curr.ogrenci_no}`;
        if (!acc[studentKey]) {
          acc[studentKey] = {
            student: {
              ogrenci_no: curr.ogrenci_no,
              ogrenci_adi: curr.ogrenci_adi,
              ogrenci_soyadi: curr.ogrenci_soyadi,
            },
            dersCiktisiBasariOranlari: {},
            programOutcomes: {},
          };
        }

        // Store ders çıktısı success rates at student level
        if (!acc[studentKey].dersCiktisiBasariOranlari[curr.ders_ciktisi]) {
          acc[studentKey].dersCiktisiBasariOranlari[curr.ders_ciktisi] =
            curr.ders_ciktisi_basari_orani;
        }

        const programCiktisiKey = curr.program_ciktisi;
        if (!acc[studentKey].programOutcomes[programCiktisiKey]) {
          acc[studentKey].programOutcomes[programCiktisiKey] = {
            dersCiktisiBasariOranlari: {},
            ortalama_basari: curr.ortalama_basari,
          };
        }

        // Store weighted success rate for each ders çıktısı
        acc[studentKey].programOutcomes[
          programCiktisiKey
        ].dersCiktisiBasariOranlari[curr.ders_ciktisi] = curr.weighted_success;

        return acc;
      }, {});

      // Create Excel data
      const excelData = [];

      // Add headers
      const headerRow = [
        "Program Çıktısı",
        ...dersCiktilari,
        "Ortalama Başarı (%)",
      ];
      excelData.push(headerRow);

      // Add data rows for each student
      Object.values(studentGroups).forEach((group) => {
        // Add student header row with ders çıktısı success rates
        const studentHeaderRow = [
          `${group.student.ogrenci_no} - ${group.student.ogrenci_adi} ${group.student.ogrenci_soyadi}`,
        ];
        dersCiktilari.forEach((dersCiktisi) => {
          const value = group.dersCiktisiBasariOranlari[dersCiktisi];
          studentHeaderRow.push(
            value ? `${Number(value).toFixed(2)}%` : "0.00%"
          );
        });
        studentHeaderRow.push(""); // Empty cell for average
        excelData.push(studentHeaderRow);

        // Add program outcome rows
        Object.entries(group.programOutcomes).forEach(
          ([programCiktisi, outcomeData]) => {
            const row = [programCiktisi];

            // Add weighted success rate for each ders çıktısı
            dersCiktilari.forEach((dersCiktisi) => {
              const value = Number(
                outcomeData.dersCiktisiBasariOranlari[dersCiktisi] || 0
              );
              row.push(value.toFixed(2));
            });

            // Add program outcome success rate
            row.push(Number(outcomeData.ortalama_basari).toFixed(2));

            excelData.push(row);
          }
        );

        // Add empty row between students
        excelData.push(Array(headerRow.length).fill(""));
      });

      // Create workbook and worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 60 }, // Program Çıktısı column
        ...dersCiktilari.map(() => ({ wch: 15 })), // Ders Çıktıları columns
        { wch: 20 }, // Ortalama Başarı column
      ];
      ws["!cols"] = colWidths;

      // Style student header rows
      let rowIndex = 0;
      Object.keys(studentGroups).forEach((_, index) => {
        const cell = xlsx.utils.encode_cell({ r: rowIndex, c: 0 });
        if (!ws[cell]) ws[cell] = {};
        ws[cell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F5F5F5" } },
        };
        rowIndex +=
          Object.keys(
            studentGroups[Object.keys(studentGroups)[0]].programOutcomes
          ).length + 2;
      });

      xlsx.utils.book_append_sheet(wb, ws, "Öğrenci Program Başarı Oranları");
      const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

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
