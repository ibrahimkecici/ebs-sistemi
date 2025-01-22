# EBS (Eğitim Bilgi Sistemi)

Eğitim Bilgi Sistemi (EBS), eğitim kurumları için kapsamlı bir yönetim sistemidir. Bu sistem, program yönetimi, ders yönetimi, öğrenci takibi, not değerlendirme ve öğrenme çıktılarının yönetimini sağlar.

## Teknoloji Stack'i

### Backend

- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT) authentication

### Frontend

- React
- TypeScript
- Axios
- Material-UI
- React Router

## Kurulum

### Backend Kurulumu

1. Gerekli paketleri yükleyin:

```bash
npm install
```

2. MySQL veritabanını kurun:

```bash
mysql -u root -p < database/schema.sql
```

3. `.env` dosyasını düzenleyin:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ebs_db
```

4. Sunucuyu başlatın:

```bash
npm start
```

### Frontend Kurulumu

1. Client dizinine gidin:

```bash
cd client
```

2. Gerekli paketleri yükleyin:

```bash
npm install
```

3. Geliştirme sunucusunu başlatın:

```bash
npm start
```

Frontend uygulaması varsayılan olarak http://localhost:3000 adresinde çalışacaktır.

## Özellikler

- Program Yönetimi
  - Program ekleme, düzenleme, silme
  - Program detaylarını görüntüleme
- Ders Yönetimi
  - Ders ekleme, düzenleme, silme
  - Ders detaylarını görüntüleme
  - Derslere öğretim üyesi atama
- Öğrenci Yönetimi
  - Öğrenci ekleme, düzenleme, silme
  - Öğrenci bilgilerini görüntüleme
  - Öğrenci program ataması
- Not Sistemi
  - Not girişi (tekli ve toplu)
  - Not düzenleme ve silme
  - Excel ile toplu not yükleme
- Değerlendirme Kriterleri
  - Değerlendirme kriteri ekleme ve düzenleme
  - Kriter bazlı not girişi
  - Etki oranı belirleme
- Öğrenme Çıktıları
  - Program öğrenme çıktıları tanımlama
  - Ders öğrenme çıktıları tanımlama
  - Çıktı-değerlendirme ilişkilendirme

## API Endpointleri

### Program Endpointleri

#### POST /api/programEkle

Program ekler.

```json
{
  "programAdi": "string",
  "programBilgi": "string",
  "programFakultesi": "string",
  "programOgretimTuru": "string",
  "programOgretimSuresi": "number"
}
```

#### PUT /api/programDuzenle/:id

Program bilgilerini günceller.

```json
{
  "programAdi": "string",
  "programBilgi": "string",
  "programFakultesi": "string",
  "programOgretimTuru": "string",
  "programOgretimSuresi": "number"
}
```

#### DELETE /api/programSil/:id

Programı siler.

#### GET /api/programlar

Tüm programları listeler.

### Ders Endpointleri

#### POST /api/dersEkle

Ders ekler.

```json
{
  "programId": "number",
  "dersAdi": "string",
  "dersKodu": "string",
  "fakulte": "string",
  "program": "string",
  "ogretimDuzeyi": "string",
  "kredi": "number",
  "ogretimUyesi": "string"
}
```

#### PUT /api/dersDuzenle/:id

Ders bilgilerini günceller.

```json
{
  "programId": "number",
  "dersAdi": "string",
  "dersKodu": "string",
  "fakulte": "string",
  "program": "string",
  "ogretimDuzeyi": "string",
  "kredi": "number",
  "ogretimUyesi": "string"
}
```

#### DELETE /api/dersSil/:id

Dersi siler.

#### GET /api/dersler

Tüm dersleri listeler.

#### GET /api/ders/:id

Belirli bir dersin detaylarını getirir.

### Öğrenci Endpointleri

#### POST /api/ogrenciEkle

Öğrenci ekler.

```json
{
  "ogrenciNo": "string",
  "ogrenciAdi": "string",
  "ogrenciSoyadi": "string",
  "programId": "number",
  "ogrenciSinifi": "number"
}
```

#### PUT /api/ogrenciDuzenle/:ogrenciNo

Öğrenci bilgilerini günceller.

```json
{
  "ogrenciAdi": "string",
  "ogrenciSoyadi": "string",
  "programId": "number",
  "ogrenciSinifi": "number"
}
```

#### DELETE /api/ogrenciSil/:ogrenciNo

Öğrenciyi siler.

#### GET /api/ogrenciler

Tüm öğrencileri listeler.

#### GET /api/ogrenci/:ogrenciNo

Belirli bir öğrencinin detaylarını getirir.

### Değerlendirme Kriteri Endpointleri

#### POST /api/degerlendirmeKriteriEkle

Değerlendirme kriteri ekler.

```json
{
  "dersId": "number",
  "kriterAdi": "string",
  "etkiOrani": "number"
}
```

#### PUT /api/degerlendirmeKriteriDuzenle/:id

Değerlendirme kriterini günceller.

```json
{
  "dersId": "number",
  "kriterAdi": "string",
  "etkiOrani": "number"
}
```

#### DELETE /api/degerlendirmeKriteriSil/:id

Değerlendirme kriterini siler.

#### GET /api/dersDegerlendirmeKriterleri/:dersId

Bir dersin değerlendirme kriterlerini listeler.

### Not Endpointleri

#### POST /api/notEkle

Not ekler.

```json
{
  "ogrenciNo": "string",
  "kriterId": "number",
  "aldigiNot": "number"
}
```

#### POST /api/notYukle

Excel dosyasından toplu not yükler.

- Form data ile `notlar` adında bir Excel dosyası gönderilmelidir.

#### PUT /api/notDuzenle

Not günceller.

```json
{
  "ogrenciNo": "string",
  "kriterId": "number",
  "aldigiNot": "number"
}
```

#### DELETE /api/notSil

Not siler.

```json
{
  "ogrenciNo": "string",
  "kriterId": "number"
}
```

#### GET /api/dersNotlar/:dersId

Bir dersin tüm notlarını listeler.

#### GET /api/ogrenciNotlar/:ogrenciNo

Bir öğrencinin tüm notlarını listeler.

### Öğrenme Çıktısı Endpointleri

#### POST /api/dersOgrenmeCiktisiEkle

Ders öğrenme çıktısı ekler.

```json
{
  "dersId": "number",
  "ogrenmeCiktisi": "string"
}
```

#### PUT /api/dersOgrenmeCiktisiDuzenle/:id

Ders öğrenme çıktısını günceller.

```json
{
  "dersId": "number",
  "ogrenmeCiktisi": "string"
}
```

#### DELETE /api/dersOgrenmeCiktisiSil/:id

Ders öğrenme çıktısını siler.

#### GET /api/dersOgrenmeCiktilari/:dersId

Bir dersin öğrenme çıktılarını listeler.

#### POST /api/programOgrenmeCiktisiEkle

Program öğrenme çıktısı ekler.

```json
{
  "programId": "number",
  "ogrenmeCiktisi": "string"
}
```

#### PUT /api/programOgrenmeCiktisiDuzenle/:id

Program öğrenme çıktısını günceller.

```json
{
  "programId": "number",
  "ogrenmeCiktisi": "string"
}
```

#### DELETE /api/programOgrenmeCiktisiSil/:id

Program öğrenme çıktısını siler.

#### GET /api/programOgrenmeCiktilari/:programId

Bir programın öğrenme çıktılarını listeler.

### İlişki Endpointleri

#### POST /api/programCiktisiDersCiktisiIliskisiGuncelle

Program çıktısı ile ders çıktısı arasındaki ilişkiyi günceller.

```json
{
  "programCiktisiId": "number",
  "dersCiktisiId": "number",
  "deger": "number"
}
```

#### POST /api/dersCiktisiDegerlendirmeKriteriGuncelle

Ders çıktısı ile değerlendirme kriteri arasındaki ilişkiyi günceller.

```json
{
  "dersCiktisiId": "number",
  "degerlendirmeKriteriId": "number",
  "deger": "number"
}
```

### Tablo Endpointleri

#### GET /api/programCiktisiDersCiktisiIliskisiTablosu/:dersId

Program çıktısı - ders çıktısı ilişki tablosunu getirir.

#### GET /api/dersCiktisiDegerlendirmeKriteriTablosu/:dersId

Ders çıktısı - değerlendirme kriteri tablosunu getirir.

#### GET /api/dersAgirlikliDegerlendirmeTablosu/:dersId

Ders ağırlıklı değerlendirme tablosunu getirir.

#### GET /api/ogrenciDersCiktisiBasariOraniTablosu/:dersId

Öğrenci ders çıktısı başarı oranı tablosunu getirir.

#### GET /api/ogrenciProgramCiktisiBasariOraniTablosu/:programId

Öğrenci program çıktısı başarı oranı tablosunu getirir.

### Excel Export Endpointleri

#### GET /api/programCiktisiDersCiktisiIliskisiExcel/:dersId

Program çıktısı - ders çıktısı ilişki tablosunu Excel olarak indirir.

#### GET /api/dersCiktisiDegerlendirmeKriteriExcel/:dersId

Ders çıktısı - değerlendirme kriteri tablosunu Excel olarak indirir.

#### GET /api/dersAgirlikliDegerlendirmeExcel/:dersId

Ders ağırlıklı değerlendirme tablosunu Excel olarak indirir.

#### GET /api/ogrenciDersCiktisiBasariOraniExcel/:dersId

Öğrenci ders çıktısı başarı oranı tablosunu Excel olarak indirir.

#### GET /api/ogrenciProgramCiktisiBasariOraniExcel/:programId

Öğrenci program çıktısı başarı oranı tablosunu Excel olarak indirir.
