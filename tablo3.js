const ExcelJS = require("exceljs");
const {
  excel_oku,
  excel_olustur,
  toplam_formulu_kullan,
  dosya_ac,
} = require("./helpers.js");

const dosya_adi = "Tablolar/Tablo 3.xlsx";

async function main() {
  const ders_degerlendirme_iliskisi = await excel_oku(
    "Tablolar/Tablo 2.xlsx",
    2
  );

  // Veri dizisi ve etki oranlarının başlatılması
  let data = [];
  const etki_oranlari = ders_degerlendirme_iliskisi.shift();

  // Her bir ilişki için hesaplamaların yapılması
  for (let i = 1; i < ders_degerlendirme_iliskisi.length; i++) {
    const iliski = ders_degerlendirme_iliskisi[i];
    const basliklar = Object.keys(iliski);
    let satir = {};

    // Her bir başlık için etki oranı hesaplaması
    for (let j = 0; j < basliklar.length; j++) {
      const baslik = basliklar[j];
      if (typeof iliski[baslik] == "number") {
        satir[baslik] = (etki_oranlari[baslik] * iliski[baslik]) / 100;
      } else {
        if (typeof iliski[baslik] != "object") satir[baslik] = iliski[baslik];
      }
    }

    data.push(satir);
  }

  // Tablo başlıklarının oluşturulması
  const basliklar = [...Object.keys(data[0]), "Toplam"];

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
