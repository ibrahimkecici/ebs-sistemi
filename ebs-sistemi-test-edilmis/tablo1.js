const { excel_oku, excel_olustur } = require("./helpers.js");
const EBSValidator = require("./src/validator.js");

// Ana işlem
async function main() {
  try {
    const validator = new EBSValidator();
    
    // Excel dosyalarını oku
    const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");
    const program_ciktilari = await excel_oku("Tablolar/program_ciktilari.xlsx");
    const dosya_adi = "Tablolar/tablo1.xlsx";

    let basliklar = ["Program Çıktıları / Öğrenme Çıktıları"];
    let data = [];

    // Ders çıktılarını hazırla
    for (let m = 1; m < ders_ciktilari.length; m++) {
      const ders = ders_ciktilari[m];
      basliklar.push(ders["Öğrenme Çıktısı"]);
    }

    // Program çıktılarını hazırla
    for (let k = 1; k < program_ciktilari.length; k++) {
      const prgcikti = program_ciktilari[k];
      data.push(Object.assign({}, prgcikti));
    }

    // İlişki matrisini oluştur
    const relationshipMatrix = data.map(row => {
      return Object.values(row).slice(1, -1).map(Number);  // Son sütun hariç değerleri al
    });

    // İlişki matrisini doğrula
    if (!validator.validateRelationshipMatrix(relationshipMatrix)) {
      console.error("HATA: İlişki matrisi doğrulama hataları:");
      validator.getErrors().forEach(error => console.error(`- ${error}`));
      process.exit(1);  // Hata durumunda programı sonlandır
    }

    basliklar.push("İlişki Değeri");
    await excel_olustur(basliklar, data, dosya_adi, true);
    console.log(`Yeni Excel dosyası başarıyla oluşturuldu: ${dosya_adi}`);
    
  } catch (error) {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error.message);
    process.exit(1);
  }
}

main();