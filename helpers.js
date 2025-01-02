const ExcelJS = require("exceljs");
let harfler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

require("dotenv").config();

const { exec } = require("child_process");

// Dosyayı aç
function dosya_ac(dosya_adi) {
  if (process.env.MODE != "test") {
    exec(`open "${dosya_adi}"`, (err) => {
      if (err) {
        console.error(`Dosya açılamadı: ${err.message}`);
      } else {
        console.log(`Dosya başarıyla açıldı: ${dosya_adi}`);
      }
    });
  }
}

async function excel_oku(dosya_adi, baslik_satiri = 1) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dosya_adi);

  const worksheet = workbook.worksheets[0]; // İlk sayfayı seç
  const data = [];

  // Sayfadaki verileri oku
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 0) {
      // Başlık satırını atla
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(baslik_satiri).getCell(colNumber).value; // Başlıklar
        rowData[header] = cell.value;
      });
      data.push(rowData);
    }
  });

  return data;
}

async function excel_olustur(basliklar, data, dosya_adi, formul = false) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Tablo 1");

  // Başlıkları ekle
  worksheet.addRow(basliklar);

  // Verileri ekle
  for (let i = 0; i < data.length; i++) {
    const rowData = Object.values(data[i]);
    rowData.push(null); // İlişki Değeri için boş hücre
    worksheet.addRow(rowData);
  }

  // Sütun genişliği ve metin kaydırma
  worksheet.columns.forEach((column) => {
    column.width = 35; // Sütun genişliği
    column.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "left",
    };
  });

  // Formülü "İlişki Değeri" sütununa ekle
  if (formul) {
    const relationColumn = basliklar.length;

    for (let i = 2; i <= worksheet.rowCount; i++) {
      worksheet.getCell(i, relationColumn).value = {
        formula: `SUM(B${i}:${String.fromCharCode(
          65 + relationColumn - 2
        )}${i}) / COUNTA(B${i}:${String.fromCharCode(
          65 + relationColumn - 2
        )}${i})`,
      };
    }
  }

  // Excel dosyasını kaydet
  await workbook.xlsx.writeFile(dosya_adi);
}

async function toplam_formulu_kullan(dosya_adi, basliklar) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dosya_adi);

  const worksheet = workbook.worksheets[0]; // İlk sayfayı seç
  const toplamColumn = basliklar.indexOf("Toplam") + 1; // "Toplam" sütununun indeksini al
  const startColumn = 2; // B sütunundan başla
  const endColumn = toplamColumn - 1; // "Toplam" sütunundan bir önceki sütuna kadar

  // Satır bazında formül ekleme
  for (let i = 2; i <= worksheet.rowCount; i++) {
    worksheet.getCell(i, toplamColumn).value = {
      formula: `SUM(${String.fromCharCode(
        64 + startColumn
      )}${i}:${String.fromCharCode(64 + endColumn)}${i})`,
    };
  }

  await workbook.xlsx.writeFile(dosya_adi);
}

module.exports = {
  excel_oku,
  excel_olustur,
  toplam_formulu_kullan,
  harfler,
  dosya_ac,
};
