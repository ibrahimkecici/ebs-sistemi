const { excel_oku } = require("../helpers");
const { main } = require("../tablo4");

describe("Tablo 4'ü oluştur", () => {
  let data;
  beforeAll(async () => {
    await main();
    data = await excel_oku("Tablolar/Tablo 4.xlsx");
  });

  test("Başlıkları yaz.", () => {
    const baslik = Object.values(data[0])[0];
    const beklenen_baslik = "Ders Çıktı";
    expect(baslik).toBe(beklenen_baslik);
  });

  test("Öğrenci numaralarını yaz.", () => {
    const ogrenci_no = Object.values(data[1])[0];
    const beklenen_ogrenci_no = "Öğrenci NO: 2*******1";
    expect(ogrenci_no).toBe(beklenen_ogrenci_no);
  });

  test("Ders çıktılarını yaz.", () => {
    const ders_ciktisi = Object.values(data[2])[0];
    const beklenen_ders_ciktisi =
      "Öğrenciler klasik ve güncel yazılım geliştirme süreçlerini, her birinin karşılaştırmalı avantajları, dezavantajları ve uygulayabilecekleri durumları içerecek şekilde öğrenir";
    expect(ders_ciktisi).toBe(beklenen_ders_ciktisi);
  });
});
