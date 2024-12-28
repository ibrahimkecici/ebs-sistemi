const { excel_oku, excel_olustur } = require("./helpers.js");
const EBSValidator = require("./src/validator.js");

async function main() {
  try {
    const validator = new EBSValidator();

    const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");
    const degerKriter = await excel_oku("Tablolar/degerlendirme_kriterleri.xlsx");
    const dosya_adi = "Tablolar/tablo2.xlsx";

    // Değerlendirme kriterlerini doğrula
    const kriterler = {};
    degerKriter.forEach(kriter => {
      if (kriter.Ağırlık) {
        kriterler[kriter.Kriter] = parseFloat(kriter.Ağırlık);
      }
    });

    if (!validator.validateAssessmentCriteria(kriterler)) {
      console.error("HATA: Değerlendirme kriterleri doğrulama hataları:");
      validator.getErrors().forEach(error => console.error(`- ${error}`));
      process.exit(1);
    }

    let basliklar = ["Ders Çıktısı"];
    let data = [];

    degerKriter.forEach(kriter => {
      if (kriter.Kriter) {
        basliklar.push(kriter.Kriter);
      }
    });

    for (let i = 1; i < ders_ciktilari.length; i++) {
      const ders = ders_ciktilari[i];
      data.push(Object.assign({}, ders));
    }

    // Ağırlıklı değerlendirme tablosunu doğrula
    const weightedTable = data.map(row => {
      return Object.values(row).slice(1).map(Number);
    });

    if (!validator.validateWeightedAssessmentTable(weightedTable)) {
      console.error("HATA: Ağırlıklı değerlendirme tablosu doğrulama hataları:");
      validator.getErrors().forEach(error => console.error(`- ${error}`));
      process.exit(1);
    }

    await excel_olustur(basliklar, data, dosya_adi, true);
    console.log(`Yeni Excel dosyası başarıyla oluşturuldu: ${dosya_adi}`);

  } catch (error) {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error.message);
    process.exit(1);
  }
}

main();