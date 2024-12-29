const { excel_oku } = require("../helpers");
const { main } = require("../tablo1");

describe("Tablo 1'i Oluştur", () => {
  let data;
  beforeAll(async () => {
    await main();
    data = await excel_oku("Tablolar/Tablo 1.xlsx");
  });

  test("Program çıktılarını yaz.", async () => {
    const program_ciktisi = Object.values(data[1])[0];
    const beklenen_cikti =
      "Matematik, fen bilimleri ve yazılım mühendisliği disiplinine özgü konularda yeterli bilgi birikimi; bu alanlardaki kuramsal ve uygulamalı bilgileri, karmaşık mühendislik problemlerinde kullanabilme becerisine sahiptir.";
    expect(program_ciktisi).toBe(beklenen_cikti);
  });

  test("Öğrenme çıktılarını yaz.", async () => {
    const ogrenme_ciktisi = Object.keys(data[0])[1];
    const beklenen_cikti =
      "Öğrenciler klasik ve güncel yazılım geliştirme süreçlerini, her birinin karşılaştırmalı avantajları, dezavantajları ve uygulayabilecekleri durumları içerecek şekilde öğrenir";
    expect(ogrenme_ciktisi).toBe(beklenen_cikti);
  });

  test("Formülü yaz.", async () => {
    const formul = Object.values(data[1])[1].formula;
    const beklenen_formul = "SUM(B2:F2) / COUNTA(B2:F2)";
    expect(formul).toBe(beklenen_formul);
  });

  // test("Ders çıktılarını doğru yaz.", () => {});
});
