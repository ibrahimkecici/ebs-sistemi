const { excel_oku, excel_olustur } = require("./helpers.js");

// Ana işlem
async function main() {
  const notlar = await excel_oku("Tablolar/notlar.xlsx");
  const ders_ciktilari = await excel_oku("Tablolar/ders_ciktilari.xlsx");
  const program_ciktilari = await excel_oku("Tablolar/program_ciktilari.xlsx");

  let basliklar = ["Program Çıktıları / Öğrenme Çıktıları"];
  let data = [];

  for (let i = 1; i < ders_ciktilari.length; i++) {
    const ders = ders_ciktilari[i];
    basliklar.push(ders["Öğrenme Çıktısı"]);
    const program = program_ciktilari[i];

    if (program) {
      data.push(Object.assign({}, program, { [ders["Öğrenme Çıktısı"]]: "" }));
    }
  }

  basliklar.push("İlişki Değeri");
  await excel_olustur(
    basliklar,
    data,
    "Tablolar/Program-Ders İlişkisi.xlsx",
    true
  );
}

main();
