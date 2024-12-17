const ExcelJS = require("exceljs");
const {
  excel_oku,
  excel_olustur,
  toplam_formulu_kullan,
} = require("./helpers.js");

const dosya_adi = "Tablolar/Ağırlıklı Değerlendirme.xlsx";

async function main() {
  const ders_degerlendirme_iliskisi = await excel_oku(
    "Tablolar/Ders-Değerlendirme İlişkisi.xlsx",
    2
  );

  let data = [];
  const etki_oranlari = ders_degerlendirme_iliskisi.shift();

  for (let i = 1; i < ders_degerlendirme_iliskisi.length; i++) {
    const iliski = ders_degerlendirme_iliskisi[i];
    const basliklar = Object.keys(iliski);
    let satir = {};
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

  const basliklar = [...Object.keys(data[0]), "Toplam"];

  await excel_olustur(basliklar, data, dosya_adi);

  await toplam_formulu_kullan(dosya_adi, basliklar);
}

main();
