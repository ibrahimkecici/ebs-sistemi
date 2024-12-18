const ExcelJS = require("exceljs");
const { excel_oku, excel_olustur } = require("./helpers.js");

const dosya_adi = "Tablolar/Öğrencilerin_Not_Ortalamalari.xlsx";

async function main() {
  // Ağırlıklı değerlendirme ve öğrenci not tablosunu oku
  const agirlikli_degerlendirme = await excel_oku(
    "Tablolar/Ağırlıklı Değerlendirme.xlsx"
  );
  const ogrenci_not_tablosu = await excel_oku(
    "Tablolar/Öğrenci Not Tablosu.xlsx"
  );

  // Başlıkları oluştur
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
    console.log(notlar);
  }

  // Excel dosyasını oluştur
  await excel_olustur(basliklar, data, dosya_adi);

  console.log(`Yeni Excel dosyası oluşturuldu: ${dosya_adi}`);
}

main().catch((err) => {
  console.error("Hata oluştu:", err);
});
