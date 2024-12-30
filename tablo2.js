const {
  excel_oku,
  excel_olustur,
  toplam_formulu_kullan,
  dosya_ac,
} = require("./helpers.js");
const ExcelJS = require("exceljs");
const dosya_adi = "Tablolar/Tablo 2.xlsx";

async function main() {
  const ders_ciktilari = await excel_oku("Tablolar/Ders Çıktıları.xlsx");

  let basliklar = ["Etki Oranları", "5", "5", "10", "10", "30", "40", "Toplam"];

  // İlk satır verilerinin tanımlanması
  let data = [
    {
      "Ders Çıktıları/Değerlendirme": "Ders Çıktıları /Değerlendirme",
      Ödev1: "Ödev1",
      Ödev2: "Ödev2",
      Quiz: "Quiz",
      Quiz4: "Quiz4",
      Vize: "Vize",
      Final: "Final",
      Toplam: "Toplam",
    },
  ];

  // Ders çıktılarının tabloya eklenmesi
  for (let i = 1; i < ders_ciktilari.length; i++) {
    const ders = ders_ciktilari[i];
    data.push({ "Ders Çıktıları/Değerlendirme": ders["Öğrenme Çıktısı"] });
  }

  await excel_olustur(basliklar, data, dosya_adi);
  console.log(`Yeni Excel dosyası oluşturuldu: ${dosya_adi}`);
  await toplam_formulu_kullan(dosya_adi, basliklar);

  dosya_ac(dosya_adi);
}

// Eğer bu dosya node.js ile çalıştırılıyorsa main fonksiyonunu çalıştır
if (require.main == module) {
  main();
}

module.exports = { main };
