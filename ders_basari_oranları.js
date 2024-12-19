const ExcelJS = require("exceljs");
const { excel_oku, excel_olustur } = require("./helpers.js");

const dosya_adi = "Tablolar/Öğrenci Başarı Tablosu.xlsx";

async function main() {
  const ders_ciktilari_excel = await excel_oku("Tablolar/ders_ciktilari.xlsx");
  const program_ciktilari_excel = await excel_oku(
    "Tablolar/program_ciktilari.xlsx"
  );

  const ders_ciktilari_sayisi = ders_ciktilari_excel.length - 1;
  let program_ciktilari = [];

  for (let i = 1; i < program_ciktilari_excel.length; i++) {
    const program_ciktisi = program_ciktilari_excel[i];
    program_ciktilari.push(...Object.values(program_ciktisi));
  }

  const ogrencilerin_not_ortalamalari = await excel_oku(
    "Tablolar/Öğrencilerin_Not_Ortalamalari.xlsx"
  );

  let basliklar = ["Öğrenci No", "Ders Çıktısı"];
  let data = [
    {
      "Öğrenci No": "Prg Çıktı",
      "Ders Çıktısı": "Başarı Oranı",
    },
  ];

  let harfler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  let ogrenci_numaralari = [];
  let ogrenci_basari_oranlari = [];

  for (
    let i = 1;
    i < ogrencilerin_not_ortalamalari.length;
    i += ders_ciktilari_sayisi + 1
  ) {
    const ogrenci = ogrencilerin_not_ortalamalari[i];
    console.log(ogrenci, i);
  }

  for (let i = 1; i < ogrencilerin_not_ortalamalari.length; i++) {
    const ogrenci = ogrencilerin_not_ortalamalari[i];
    const basari_orani = ogrenci["%BAŞARI"];
    if (basari_orani) ogrenci_basari_oranlari.push(basari_orani);
  }

  // console.log(ogrenci_basari_oranlari);

  await excel_olustur(basliklar, data, dosya_adi);
}

main().catch((err) => {
  console.error("Hata oluştu:", err);
});
