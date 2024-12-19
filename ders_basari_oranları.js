const ExcelJS = require("exceljs");
const { excel_oku } = require("./helpers.js");

const dosya_adi = "Tablolar/Öğrenci Başarı Tablosu.xlsx";

async function main() {
  const agirlikli_degerlendirme = await excel_oku(
    "Tablolar/Ağırlıklı Değerlendirme.xlsx"
  );
  const ogrenci_not_tablosu = await excel_oku(
    "Tablolar/Öğrenci Not Tablosu.xlsx"
  );
  const program_ciktilari = await excel_oku("Tablolar/program_ciktilari.xlsx");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sonuçlar");

  const ders_ciktilari = Object.keys(agirlikli_degerlendirme[0]).filter(
    (key) => key !== "Ders Çıktı"
  );
  const basliklar = ["Prg Çıktı", ...ders_ciktilari, "Başarı Oranı"];
  worksheet.addRow(basliklar);

  ogrenci_not_tablosu.forEach((ogrenci) => {
    agirlikli_degerlendirme.forEach((degerlendirme, index) => {
      const program_cikti = program_ciktilari["program_ciktilari"];

      console.log(program_ciktilari);

      const ders_notlari = ders_ciktilari.map((ders) => ogrenci[ders] || 0);

      const iliski_degeri = Object.values(degerlendirme)
        .filter((value) => typeof value === "number")
        .reduce((acc, val) => acc + val, 0);

      const ortalama =
        ders_notlari.reduce((acc, val) => acc + val, 0) / ders_notlari.length;
      const basari_orani =
        iliski_degeri !== 0 ? (ortalama / iliski_degeri).toFixed(2) : 0;

      const satir = [program_cikti, ...ders_notlari, basari_orani];
      worksheet.addRow(satir);
    });
  });

  await workbook.xlsx.writeFile(dosya_adi);
  console.log(`Excel dosyası oluşturuldu: ${dosya_adi}`);
}

main().catch((err) => {
  console.error("Hata oluştu:", err);
});
