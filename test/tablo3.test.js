const { excel_oku } = require("../helpers");
const { main } = require("../tablo3");

describe("Tablo 3'ü Oluştur", () => {
  let data;
  beforeAll(async () => {
    await main();
    data = await excel_oku("Tablolar/Tablo 3.xlsx");
  });

  test("Ders çıktılarını yaz.", () => {
    const ders_ciktisi = Object.values(data[1])[0];
    const beklenen_cikti =
      "Öğrenciler klasik ve güncel yazılım geliştirme süreçlerini, her birinin karşılaştırmalı avantajları, dezavantajları ve uygulayabilecekleri durumları içerecek şekilde öğrenir";
    expect(ders_ciktisi).toBe(beklenen_cikti);
  });

  test("Toplam formülünü yaz.", () => {
    const formul = Object.values(data[1])[1].formula;
    const beklenen_formul = "SUM(B2:A2)";
    expect(formul).toBe(beklenen_formul);
  });
});
