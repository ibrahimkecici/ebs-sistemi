const ExcelJS = require("exceljs");
const { excel_oku, excel_olustur, dosya_ac } = require("./helpers.js");

const dosya_adi = "Tablolar/Tablo 4.xlsx";

async function main() {
  const agirlikli_degerlendirme = await excel_oku("Tablolar/Tablo 3.xlsx");
  const ogrenci_not_tablosu = await excel_oku(
    "Tablolar/Öğrenci Not Tablosu.xlsx"
  );

  const ders_basliklari = Object.keys(agirlikli_degerlendirme[0]).filter(
    (key) => key !== "Ders Çıktıları /Değerlendirme" && key !== "Toplam"
  );
  const basliklar = [
    "Ders Çıktı",
    ...ders_basliklari,
    "Toplam",
    "MAX",
    "%BAŞARI",
  ];

  let data = [];

  // Her öğrenci için ağırlıklı not hesapla
  for (let i = 1; i < ogrenci_not_tablosu.length; i++) {
    const ogrenci = ogrenci_not_tablosu[i];
    data.push({});
    data.push({ "Ders Çıktı": "Öğrenci NO: " + ogrenci.Ogrenci_No });
    const notlar = {};

    for (let j = 1; j < agirlikli_degerlendirme.length; j++) {
      const degerlendirme = agirlikli_degerlendirme[j];
      const ders_cikti = degerlendirme["Ders Çıktıları /Değerlendirme"];
      notlar["Ders Çıktı"] = ders_cikti;

      let toplam = 0;
      let max = 0;
      ders_basliklari.forEach((ders) => {
        const agirlik = degerlendirme[ders];
        const ogrenci_notu = ogrenci[ders] || 0; // Eğer not yoksa 0 kabul edilir
        const agirlikli_not = ogrenci_notu * agirlik;
        toplam += agirlikli_not;
        max += agirlik * 100;
        notlar[ders] = agirlikli_not.toFixed(2); // Ondalık sayıyı düzenle
      });

      notlar["Toplam"] = toplam.toFixed(2);
      notlar["MAX"] = max.toFixed(2); // Toplam not
      notlar["%BAŞARI"] = max == 0 ? 0 : ((toplam / max) * 100).toFixed(2); // Başarı yüzdesi
      data.push({ ...notlar });
    }
  }

  await excel_olustur(basliklar, data, dosya_adi);

  console.log(`Yeni Excel dosyası oluşturuldu: ${dosya_adi}`);

  dosya_ac(dosya_adi);
}

// Eğer bu dosya node.js ile çalıştırılıyorsa main fonksiyonunu çalıştır
if (require.main == module) {
  main().catch((err) => {
    console.error("Hata oluştu:", err);
  });
}

module.exports = { main };
