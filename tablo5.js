const ExcelJS = require("exceljs");
const { excel_oku, excel_olustur, harfler, dosya_ac } = require("./helpers.js");

const dosya_adi = "Tablolar/Tablo 5.xlsx";

async function main() {
  const ders_ciktilari_excel = await excel_oku("Tablolar/Ders Çıktıları.xlsx");
  const program_ciktilari_excel = await excel_oku(
    "Tablolar/Program Çıktıları.xlsx"
  );
  const program_iliski_excel = await excel_oku("Tablolar/Tablo 1.xlsx");

  // Program ilişki matrisinin işlenmesi
  let program_iliski = [];
  for (let i = 1; i < program_iliski_excel.length; i++) {
    const iliski = program_iliski_excel[i];
    program_iliski.push(
      Object.values(iliski).map((prgiliski) => {
        if (typeof prgiliski == "object") {
          return prgiliski.result || 0;
        } else {
          return prgiliski;
        }
      })
    );
  }

  // Ders çıktıları sayısının belirlenmesi
  const ders_ciktilari_sayisi = ders_ciktilari_excel.length - 1;
  let program_ciktilari = [];

  // Program çıktılarının diziye aktarılması
  for (let i = 1; i < program_ciktilari_excel.length; i++) {
    const program_ciktisi = program_ciktilari_excel[i];
    program_ciktilari.push(...Object.values(program_ciktisi));
  }

  const ogrencilerin_not_ortalamalari = await excel_oku(
    "Tablolar/Tablo 4.xlsx"
  );

  let basliklar = ["", "Ders Çıktısı"];
  let data = [];

  let ogrenciler = [];

  // Her öğrenci için ders çıktılarına göre başarı oranlarının hesaplanması
  for (
    let i = 1;
    i < ogrencilerin_not_ortalamalari.length;
    i += ders_ciktilari_sayisi + 1
  ) {
    const ogrenci = ogrencilerin_not_ortalamalari[i];
    ogrenciler.push({
      ogrenci_no: ogrenci["Ders Çıktı"],
      basari_orani: [
        ...ogrencilerin_not_ortalamalari
          .slice(i + 1, i + ders_ciktilari_sayisi + 1)
          .map((not) => {
            // Her birini sırayla dönmek için map kullanılması.
            return not["%BAŞARI"];
          }),
      ],
    });
  }

  // Her öğrenci için veri satırlarının oluşturulması
  for (let i = 0; i < ogrenciler.length; i++) {
    const ogrenci = ogrenciler[i];
    const satirbaslik = { A: "Program Çıktısı" };
    // Boş satır ekle
    if (i != 0) data.push({});
    data.push({ A: ogrenci.ogrenci_no });

    // Her ders çıktısı için başarı oranlarının satırlara eklenmesi
    for (let j = 0; j < ogrenci.basari_orani.length; j++) {
      const ogrencibasari = ogrenci.basari_orani[j];
      satirbaslik[harfler[j + 1]] = ogrencibasari;
    }
    satirbaslik[harfler[ogrenci.basari_orani.length + 1]] = "Başarı Oranı";
    data.push(satirbaslik);

    // Program çıktıları için hesaplama döngüsü
    for (let k = 0; k < program_ciktilari.length; k++) {
      const prgcikti = program_ciktilari[k];

      let basariliski = { A: prgcikti };
      let toplam = 0;

      // Ders çıktıları ile program çıktıları arasındaki ilişkinin hesaplanması
      for (let m = 0; m < ogrenci.basari_orani.length; m++) {
        const basariorani = ogrenci.basari_orani[m];

        const program = program_iliski[k];

        // Program ilişki matrisinden değerlerin alınması ve hesaplanması
        if (program) {
          basariliski[harfler[m + 2]] = basariorani * program[m + 1];
          toplam += basariorani * program[m + 1];
        }
      }
      // Ortalama başarı oranının hesaplanması
      const ortalama = toplam / ogrenci.basari_orani.length;
      const iliski_degeri = program_iliski[k][program_iliski[k].length - 1];

      // İlişki değerine göre başarı oranının hesaplanması
      if (iliski_degeri == 0) {
        basariliski[harfler[ogrenci.basari_orani.length + 2]] = 0;
      } else
        basariliski[harfler[ogrenci.basari_orani.length + 2]] =
          ortalama / iliski_degeri;
      data.push(basariliski);
    }
  }

  await excel_olustur(basliklar, data, dosya_adi);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dosya_adi);

  const worksheet = workbook.worksheets[0]; // İlk sayfayı seç

  const baslik_harf_sonu = harfler[ders_ciktilari_sayisi];
  worksheet.mergeCells(`B1:${baslik_harf_sonu}1`);
  const mergedCell = worksheet.getCell("B1");
  mergedCell.value = "Ders Çıktısı";
  mergedCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.columns[0].width = 35; // Sütun genişliği
  worksheet.columns[0].alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "center",
  };

  await workbook.xlsx.writeFile(dosya_adi);
  console.log("Excel dosyası başarıyla oluşturuldu:", dosya_adi);

  dosya_ac(dosya_adi);
}

// Eğer bu dosya node.js ile çalıştırılıyorsa main fonksiyonunu çalıştır
if (require.main == module) {
  main().catch((err) => {
    console.error("Hata oluştu:", err);
  });
}

module.exports = { main };
