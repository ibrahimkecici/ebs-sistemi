const { excel_oku } = require("../helpers");
const { main } = require("../tablo5");

describe("Tablo 5'i oluştur", () => {
  let data;
  beforeAll(async () => {
    await main();
    data = await excel_oku("Tablolar/Tablo 5.xlsx");
  });

  test("Ders çıktısı başlığını yaz.", () => {
    const baslik = Object.values(data[0])[1];
    const beklenen_baslik = "Ders Çıktısı";
    expect(baslik).toBe(beklenen_baslik);
  });

  test("Başlıkları yaz.", () => {
    const baslik = Object.values(data[2])[0];
    const beklenen_baslik = "Program Çıktısı";
    expect(baslik).toBe(beklenen_baslik);
  });

  test("Öğrenci numaralarını yaz.", () => {
    const ogrenci_no = Object.values(data[1])[0];
    const beklenen_ogrenci_no = "Öğrenci NO: 2*******1";
    expect(ogrenci_no).toBe(beklenen_ogrenci_no);
  });

  test("Program çıktılarını yaz.", () => {
    const program_ciktisi = Object.values(data[3])[0];
    const beklenen_cikti =
      "Matematik, fen bilimleri ve yazılım mühendisliği disiplinine özgü konularda yeterli bilgi birikimi; bu alanlardaki kuramsal ve uygulamalı bilgileri, karmaşık mühendislik problemlerinde kullanabilme becerisine sahiptir.";
    expect(program_ciktisi).toBe(beklenen_cikti);
  });
});
