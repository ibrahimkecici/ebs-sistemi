const { excel_oku, excel_olustur } = require("./helpers.js");
const ExcelJS = require("exceljs");
const dosya_adi = "Tablolar/Ders-Değerlendirme İlişkisi.xlsx";

async function main() {
  const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");

  let basliklar = ["Etki Oranları", "10", "20", "30", "40", "Toplam"];
  let data = [
    {
      "Ders Çıktıları/Değerlendirme": "Ders Çıktıları /Değerlendirme",
      Ödev1: "Ödev 1",
      Quiz: "Quiz",
      Vize: "Vize",
      Final: "Final",
      Toplam: "Toplam",
    },
  ];

  for (let i = 0; i < ders_ciktilari.length; i++) {
    const ders = ders_ciktilari[i];
    data.push({ "Ders Çıktıları/Değerlendirme": ders["Öğrenme Çıktısı"] });
  }

  await excel_olustur(basliklar, data, dosya_adi);

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

main();
