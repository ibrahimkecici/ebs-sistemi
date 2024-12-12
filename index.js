var mysql = require("mysql2/promise");
const { table } = require("table");

async function veriCek(table_adi, basliklar) {
  var connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ebs_sistemi",
  });

  await connection.connect();

  const sql = "SELECT * FROM " + table_adi;
  const [rows, fields] = await connection.query(sql);

  const data = [basliklar];
  for (let i = 0; i < rows.length; i++) {
    const result = rows[i];
    data.push(Object.values(result));
  }
  console.log(table(data));

  /*  console.log(results)
    console.table(results) */

  await connection.end();
}

veriCek("Ders_Ciktisi", ["Sayı", "Öğrenme Çıktısı"]);
veriCek("program_ciktisi", [
  "Sayı",
  "Program Öğrenme Çıktıları",
  "Katkı Değeri: 1",
  "Katkı Değeri: 2",
  "Katkı Değeri: 3",
  "Katkı Değeri: 4",
  "Katkı Değeri: 5",
]);
