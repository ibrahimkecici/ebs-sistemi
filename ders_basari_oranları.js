const ExcelJS = require("exceljs");
const { excel_oku, excel_olustur } = require("./helpers.js");

const dosya_adi = "Tablolar/Öğrenci Başarı Tablosu.xlsx";

async function main() {
  const ders_ciktilari_excel = await excel_oku("Tablolar/ders_ciktilari.xlsx");
  const program_ciktilari_excel = await excel_oku(
    "Tablolar/program_ciktilari.xlsx"
  );
  const program_iliski_excel = await excel_oku(
    "Tablolar/Program-Ders İlişkisi.xlsx"
  );
  let program_iliski = [];
  for (let i = 1; i < program_iliski_excel.length; i++) {
    const iliski = program_iliski_excel[i];
    program_iliski.push(
      Object.values(iliski).map((prgiliski) => {
        if (typeof prgiliski == "object") {
          return prgiliski.result || 0;
        } else;
        {
          return prgiliski;
        }
      })
    );
  }

  const ders_ciktilari_sayisi = ders_ciktilari_excel.length - 1;
  let program_ciktilari = [];

  for (let i = 1; i < program_ciktilari_excel.length; i++) {
    const program_ciktisi = program_ciktilari_excel[i];
    program_ciktilari.push(...Object.values(program_ciktisi));
  }

  const ogrencilerin_not_ortalamalari = await excel_oku(
    "Tablolar/Öğrencilerin_Not_Ortalamalari.xlsx"
  );

  let basliklar = ["", "Ders Çıktısı"];
  let data = [];

  let harfler = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  let ogrenciler = [];

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
            //her birini sırayla dönmek için map kullandık.
            return not["%BAŞARI"];
          }),
      ],
    });
  }

  for (let i = 0; i < ogrenciler.length; i++) {
    const ogrenci = ogrenciler[i];
    const satirbaslik = { A: "Program Çıktısı" };
    data.push({ A: ogrenci.ogrenci_no });
    for (let j = 0; j < ogrenci.basari_orani.length; j++) {
      const ogrencibasari = ogrenci.basari_orani[j];
      satirbaslik[harfler[j + 1]] = ogrencibasari;
    }
    satirbaslik[harfler[ogrenci.basari_orani.length + 1]] = "Başarı Oranı";
    data.push(satirbaslik);

    for (let k = 0; k < program_ciktilari.length; k++) {
      const prgcikti = program_ciktilari[k];

      let basariliski = { A: prgcikti };
      for (let m = 0; m < ogrenci.basari_orani.length; m++) {
        const basariorani = ogrenci.basari_orani[m];

        if (m + 1 < ogrenci.basari_orani.length) {
          // console.log(program_iliski[m][k + 1] * basariorani);
        }
        basariliski[harfler[m + 2]] = program_iliski[m][k + 1] * basariorani;
      }
      data.push(basariliski);
    }
  }

  await excel_olustur(basliklar, data, dosya_adi);
}

main().catch((err) => {
  console.error("Hata oluştu:", err);
});
