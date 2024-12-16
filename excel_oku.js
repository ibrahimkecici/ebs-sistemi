const ExcelJS = require("exceljs");

async function excel_oku(dosya_adi) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dosya_adi);

  const worksheet = workbook.worksheets[0]; // İlk sayfayı seç
  const data = [];

  // Sayfadaki verileri oku
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Başlık satırını atla
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value; // Başlıklar
        rowData[header] = cell.value;
      });
      data.push(rowData);
    }
  });

  return data;
}

async function excel_olustur(basliklar, data, dosya_adi) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Tablo 1");

  // Başlıkları ekle
  worksheet.addRow(basliklar);

  // Verileri ekle
  for (let i = 0; i < data.length; i++) {
    const rowData = Object.values(data[i]);
    rowData.push(null); // İlişki Değeri için boş hücre
    worksheet.addRow(rowData);
  }

  // Sütun genişliği ve metin kaydırma
  worksheet.columns.forEach((column) => {
    column.width = 35; // Sütun genişliği
    column.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "left",
    };
  });

  // Formülü "İlişki Değeri" sütununa ekle
  const relationColumn = basliklar.length; // İlişki Değeri sütununun indeksi
  for (let i = 2; i <= worksheet.rowCount; i++) {
    worksheet.getCell(i, relationColumn).value = {
      formula: `SUM(B${i}:${String.fromCharCode(
        65 + relationColumn - 2
      )}${i}) / COUNTA(B${i}:${String.fromCharCode(
        65 + relationColumn - 2
      )}${i})`,
    };
  }

  // Excel dosyasını kaydet
  await workbook.xlsx.writeFile(dosya_adi);
  console.log("Excel dosyası oluşturuldu ve formüller eklendi.");
}

// Ana işlem
async function main() {
  const notlar = await excel_oku("notlar.xlsx");
  const ders_ciktilari = await excel_oku("ders_ciktilari.xlsx");
  const program_ciktilari = await excel_oku("program_ciktilari.xlsx");

  let basliklar = ["Program Çıktıları / Öğrenme Çıktıları"];
  let data = [];

  for (let i = 0; i < ders_ciktilari.length; i++) {
    const ders = ders_ciktilari[i];
    basliklar.push(ders["Öğrenme Çıktısı"]);
    const program = program_ciktilari[i];

    if (program) {
      data.push(Object.assign({}, program, { [ders["Öğrenme Çıktısı"]]: "" }));
    }
  }

  basliklar.push("İlişki Değeri");
  await excel_olustur(basliklar, data, "test.xlsx");
}

main();
