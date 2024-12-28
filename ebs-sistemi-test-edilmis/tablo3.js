const { excel_oku, excel_olustur } = require("./helpers.js");
const EBSValidator = require("./src/validator.js");

async function main() {
  try {
    const validator = new EBSValidator();

    const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");
    const degerKriter = await excel_oku("Tablolar/degerlendirme_kriterleri.xlsx");
    const tablo2 = await excel_oku("Tablolar/tablo2.xlsx");
    const dosya_adi = "Tablolar/tablo3.xlsx";

    let basliklar = ["Ders Çıktısı"];
    let data = [];

    // Değerlendirme kriterlerini ve ağırlıkları doğrula
    const kriterler = {};
    degerKriter.forEach(kriter => {
      if (kriter.Kriter && kriter.Ağırlık) {
        kriterler[kriter.Kriter] = parseFloat(kriter.Ağırlık);
        basliklar.push(kriter.Kriter);
      }
    });

    if (!validator.validateAssessmentCriteria(kriterler)) {
      console.error("HATA: Değerlendirme kriterleri doğrulama hataları:");
      validator.getErrors().forEach(error => console.error(`- ${error}`));
      process.exit(1);
    }

    // Ağırlıklı değerlendirme hesaplaması
    for (let i = 1; i < ders_ciktilari.length; i++) {
      const row = {};
      row["Ders Çıktısı"] = ders_ciktilari[i]["Öğrenme Çıktısı"];
      
      degerKriter.forEach(kriter => {
        if (kriter.Kriter && kriter.Ağırlık) {
          const weight = parseFloat(kriter.Ağırlık) / 100;
          const value = tablo2[i - 1][kriter.Kriter];
          row[kriter.Kriter] = value * weight;
        }
      });

      // Hesaplanan değerleri doğrula
      const values = Object.values(row).slice(1).map(Number);
      if (values.some(v => v < 0 || v > 1)) {
        console.error(`HATA: Ağırlıklı değer 0-1 aralığında olmalıdır. Çıktı: ${row["Ders Çıktısı"]}`);
        process.exit(1);
      }

      data.push(row);
    }

    basliklar.push("TOPLAM");
    data.forEach(row => {
      const total = Object.values(row)
        .slice(1)
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      row["TOPLAM"] = total.toFixed(2);
    });

    await excel_olustur(basliklar, data, dosya_adi, true);
    console.log(`Yeni Excel dosyası başarıyla oluşturuldu: ${dosya_adi}`);

  } catch (error) {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error.message);
    process.exit(1);
  }
}

main();