const { excel_oku, excel_olustur, dosya_ac } = require("./helpers.js");

async function main() {
  const ders_ciktilari = await excel_oku("Tablolar/Ders Çıktıları.xlsx");
  const program_ciktilari = await excel_oku("Tablolar/Program Çıktıları.xlsx");
  const dosya_adi = "Tablolar/Tablo 1.xlsx";

  let basliklar = ["Program Çıktıları / Öğrenme Çıktıları"];
  let data = [];

  // Ders çıktılarının başlık olarak eklenmesi
  for (let m = 1; m < ders_ciktilari.length; m++) {
    const ders = ders_ciktilari[m];
    basliklar.push(ders["Öğrenme Çıktısı"]);
  }

  // Program çıktılarının veri olarak eklenmesi
  for (let k = 1; k < program_ciktilari.length; k++) {
    const prgcikti = program_ciktilari[k];
    data.push(Object.assign({}, prgcikti));
  }

  basliklar.push("İlişki Değeri");

  // Yeni Excel dosyasının oluşturulması
  await excel_olustur(basliklar, data, "Tablolar/Tablo 1.xlsx", true);
  console.log(`Yeni Excel dosyası oluşturuldu: ${dosya_adi}`);

  dosya_ac(dosya_adi);
}

// Script doğrudan çalıştırıldığında main fonksiyonunu çağır
if (require.main == module) {
  main();
}

module.exports = { main };
