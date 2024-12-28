const { excel_oku, excel_olustur } = require("./helpers.js");
const EBSValidator = require("./src/validator.js");

async function main() {
  try {
    const validator = new EBSValidator();

    const program_ciktilari = await excel_oku("Tablolar/program_ciktilari.xlsx");
    const tablo1 = await excel_oku("Tablolar/tablo1.xlsx");
    const ogrenci_notlar = await excel_oku("Tablolar/ogrenci_not_tablosu.xlsx");
    const dosya_adi = "Tablolar/tablo5.xlsx";

    // Her öğrenci için işlem yap
    for (const ogrenci of ogrenci_notlar) {
      const ogrenciNo = ogrenci["Öğrenci No"];

      // Öğrenci numarası formatını kontrol et
      if (!validator.validateStudentGrades({ [ogrenciNo]: {} })) {
        console.error("HATA: Öğrenci numarası doğrulama hatası:");
        validator.getErrors().forEach(error => console.error(`- ${error}`));
        process.exit(1);
      }

      let basliklar = ["Program Çıktısı"];
      const ders_ciktilari = await excel_oku(`Tablolar/tablo4_${ogrenciNo}.xlsx`);

      // Başlıkları oluştur
      ders_ciktilari.forEach(cikti => {
        if (cikti["Ders Çıktısı"]) {
          basliklar.push(cikti["Ders Çıktısı"]);
        }
      });
      basliklar.push("Başarı Oranı");

      let data = [];

      // Program çıktıları için hesaplamalar
      for (let i = 1; i < program_ciktilari.length; i++) {
        const row = {};
        row["Program Çıktısı"] = program_ciktilari[i]["Program Çıktısı"];

        // Başarı oranı hesaplama
        let basariToplam = 0;
        let iliskiliDersSayisi = 0;

        // Her ders çıktısı için hesaplama
        ders_ciktilari.forEach((cikti, index) => {
          const dersIliskiDegeri = parseFloat(tablo1[i - 1][`Çıktı ${index + 1}`] || 0);
          const dersBasariOrani = parseFloat(cikti["% Başarı"] || 0);

          // İlişki değerini doğrula (0-1 arası olmalı)
          if (dersIliskiDegeri < 0 || dersIliskiDegeri > 1) {
            console.error(`HATA: İlişki değeri 0-1 aralığında olmalıdır. Program Çıktısı: ${row["Program Çıktısı"]}, Ders Çıktısı: ${cikti["Ders Çıktısı"]}`);
            process.exit(1);
          }

          // Başarı oranını doğrula (0-100 arası olmalı)
          if (dersBasariOrani < 0 || dersBasariOrani > 100) {
            console.error(`HATA: Başarı oranı 0-100 aralığında olmalıdır. Ders Çıktısı: ${cikti["Ders Çıktısı"]}`);
            process.exit(1);
          }

          row[cikti["Ders Çıktısı"]] = dersBasariOrani.toFixed(1);

          if (dersIliskiDegeri > 0) {
            basariToplam += dersBasariOrani;
            iliskiliDersSayisi++;
          }
        });

        // İlişki değerini al
        const iliskiDegeri = parseFloat(tablo1[i - 1]["İlişki Değeri"]);

        // İlişki değerini doğrula
        if (iliskiDegeri <= 0 || iliskiDegeri > 1) {
          console.error(`HATA: İlişki değeri 0-1 aralığında olmalıdır. Program Çıktısı: ${row["Program Çıktısı"]}`);
          process.exit(1);
        }

        // Final başarı oranını hesapla
        const ortalamaBasari = iliskiliDersSayisi > 0 ? basariToplam / iliskiliDersSayisi : 0;
        const basariOrani = (ortalamaBasari / iliskiDegeri).toFixed(1);

        // Son başarı oranını doğrula
        if (parseFloat(basariOrani) < 0 || parseFloat(basariOrani) > 100) {
          console.error(`HATA: Hesaplanan başarı oranı geçersiz! Program Çıktısı: ${row["Program Çıktısı"]}, Oran: ${basariOrani}`);
          process.exit(1);
        }

        row["Başarı Oranı"] = basariOrani;
        data.push(row);
      }

      // Program çıktıları hesaplamalarını doğrula
      const programOutcomes = data.map(row => ({
        outcomeId: row["Program Çıktısı"],
        successRate: parseFloat(row["Başarı Oranı"]),
        relationshipValue: parseFloat(tablo1.find(t => t["Program Çıktısı"] === row["Program Çıktısı"])?.["İlişki Değeri"] || 0)
      }));

      if (!validator.validateProgramOutcomeCalculation(programOutcomes)) {
        console.error("HATA: Program çıktıları hesaplama doğrulama hataları:");
        validator.getErrors().forEach(error => console.error(`- ${error}`));
        process.exit(1);
      }

      // Excel dosyasını oluştur
      const ogrenci_dosya = dosya_adi.replace(".xlsx", `_${ogrenciNo}.xlsx`);
      await excel_olustur(basliklar, data, ogrenci_dosya, true);
      console.log(`${ogrenciNo} için Tablo 5 Excel dosyası başarıyla oluşturuldu: ${ogrenci_dosya}`);
    }

  } catch (error) {
    console.error("Beklenmeyen bir hata oluştu:");
    console.error(error.message);
    process.exit(1);
  }
}

main();