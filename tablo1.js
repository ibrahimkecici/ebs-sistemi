const { excel_oku, excel_olustur } = require("./helpers.js");

// Ana işlem
async function main() {
  const notlar = await excel_oku("Tablolar/Öğrenci Not Tablosu.xlsx");
  const ders_ciktilari = await excel_oku("Tablolar/Ders Çıktıları.xlsx");
  const program_ciktilari = await excel_oku("Tablolar/Program Çıktıları.xlsx");

  let basliklar = ["Program Çıktıları / Öğrenme Çıktıları"];
  let data = [];

  for (let m = 1; m < ders_ciktilari.length; m++) {
    const ders = ders_ciktilari[m];
    basliklar.push(ders["Öğrenme Çıktısı"]);
  }

  for (let k = 1; k < program_ciktilari.length; k++) {
    const prgcikti = program_ciktilari[k];
    data.push(Object.assign({}, prgcikti));
  }

  basliklar.push("İlişki Değeri");
  await excel_olustur(basliklar, data, "Tablolar/Tablo 1.xlsx", true);
}

main();
