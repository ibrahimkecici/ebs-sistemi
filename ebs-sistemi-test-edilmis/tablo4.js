const { excel_oku, excel_olustur } = require("./helpers.js");
const EBSValidator = require("./src/validator.js");

async function main() {
  try {
    const validator = new EBSValidator();

    const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");
    const degerKriter = await excel_oku("Tablolar/degerlendirme_kriterleri.xlsx");
    const ogrenci_notlar = await excel_oku("Tablolar/ogrenci_not_tablosu.xlsx");
    const tablo3 = await excel_oku("Tablolar/tablo3.xlsx");
    const dosya_adi = "Tablolar/tablo4.xlsx";

    // Öğrenci notlarını doğrula
    const notlar = {};
    ogrenci_notlar.forEach(ogrenci => {
      const grades = {};
      Object.keys(ogrenci).forEach(key => {
        if (key !== "Öğrenci No") {
          grades[key] = parseFloat(ogrenci[key]);
        }
      });
      notlar[ogrenci["Öğrenci No"]] = grades;
    });

    if (!validator.validateStudentGrades(notlar)) {
      console.error("HATA: Öğrenci notları doğrulama hataları:");
      validator.getErrors().forEach(error => console.error(`- ${error}`));
      process.exit(1);
    }

    // Her öğrenci için hesaplama yap
    for (const ogrenci of ogrenci_notlar) {
      const ogrenciNo = ogrenci["Öğrenci No"];
      let basliklar = ["Ders Çıktısı"];
      let data = [];
      
      // Değerlendirme kriterlerini başlıklara ekle
      degerKriter.forEach(kriter => {
        if (kriter.Kriter) {
          basliklar.push(kriter.Kriter);
        }
      });
      basliklar.push("TOPLAM", "MAX", "% Başarı");

      // Her ders çıktısı için hesaplama
      for (let i = 1; i < ders_ciktilari.length; i++) {
        const row = {};
        row["Ders Çıktısı"] = ders_ciktilari[i]["Öğrenme Çıktısı"];
        
        let totalScore = 0;
        degerKriter.forEach(kriter => {
          if (kriter.Kriter) {
            const weight = parseFloat(tablo3[i - 1][kriter.Kriter]);
            const grade = parseFloat(ogrenci[kriter.Kriter]);
            const score = weight * grade;
            row[kriter.Kriter] = score.toFixed(1);
            totalScore += score;
          }
        });

        row["TOPLAM"] = totalScore.toFixed(1);
        const maxPossible = parseFloat(tablo3[i - 1]["TOPLAM"]) * 100;
        row["MAX"] = maxPossible.toFixed(1);
        row["% Başarı"] = ((totalScore / maxPossible) * 100).toFixed(1);

        // Başarı oranı kontrolü
        if (parseFloat(row["% Başarı"]) < 0 || parseFloat(row["% Başarı"]) > 100) {
          console.error(`HATA: Başarı oranı 0-100 aralığında olmalıdır. Öğrenci: ${ogrenciNo}, Çıktı: ${row["Ders Çıktısı"]}`);
          process.exit(1);
        }

        data.push(row);
      }

      // Öğrenci için Excel dosyası oluştur
      const ogrenci_dosya = dosya_adi.replace(".xlsx", `_${ogrenciNo}.xlsx`);
      await excel_olustur(basliklar, data, ogrenci_dosya, true);
      console.log(`${ogrenciNo} için Excel dosyası oluşturuldu: ${ogrenci_dosya}`);
    }

  } catch (error) {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error.message);
    process.exit(1);
  }
}

main();