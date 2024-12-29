const { excel_oku } = require("../helpers");
const { main } = require("../tablo2");

describe("Tablo 2'yi Oluştur", () => {
  let data;
  beforeAll(async () => {
    await main();
    data = await excel_oku("Tablolar/Tablo 2.xlsx", 2);
  });

  test("Etki oranlarını yaz.", () => {
    const etki_orani = Object.values(data[0])[1];
    const beklenen_etki_orani = "5";
    expect(etki_orani).toBe(beklenen_etki_orani);
  });

  test("Değerlendirme kriterlerini (ödev, quiz vb.) yaz.", () => {
    const degerlendirme_kriteri = Object.values(data[1])[1];
    const beklenen_degerlendirme_kriteri = "Ödev1";
    expect(degerlendirme_kriteri).toBe(beklenen_degerlendirme_kriteri);
  });

  test("Ders çıktılarını yaz.", () => {
    const ders_ciktisi = Object.values(data[2])[0];
    const beklenen_ders_ciktisi =
      "Öğrenciler klasik ve güncel yazılım geliştirme süreçlerini, her birinin karşılaştırmalı avantajları, dezavantajları ve uygulayabilecekleri durumları içerecek şekilde öğrenir";
    expect(ders_ciktisi).toBe(beklenen_ders_ciktisi);
  });

  test("Toplam formülünü yaz.", () => {
    const toplam_formul = Object.values(data[2])[1].formula;
    const beklenen_toplam_formul = "SUM(B3:G3)";
    expect(toplam_formul).toBe(beklenen_toplam_formul);
  });
});
