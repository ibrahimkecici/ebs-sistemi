const {
  excel_oku,
  excel_olustur,
  toplam_formulu_kullan,
} = require("./helpers.js");
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

  for (let i = 1; i < ders_ciktilari.length; i++) {
    const ders = ders_ciktilari[i];
    data.push({ "Ders Çıktıları/Değerlendirme": ders["Öğrenme Çıktısı"] });
  }

  await excel_olustur(basliklar, data, dosya_adi);
  await toplam_formulu_kullan(dosya_adi, basliklar);
}

main();
