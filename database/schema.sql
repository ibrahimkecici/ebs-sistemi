-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ebs_db;
USE ebs_db;

-- Programs table
CREATE TABLE IF NOT EXISTS programlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_adi VARCHAR(255) NOT NULL,
    program_bilgi TEXT,
    program_fakultesi VARCHAR(255) NOT NULL,
    program_ogretim_turu VARCHAR(50) NOT NULL,
    program_ogretim_suresi INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS dersler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    ders_adi VARCHAR(255) NOT NULL,
    ders_kodu VARCHAR(50) NOT NULL UNIQUE,
    fakulte VARCHAR(255) NOT NULL,
    ogretim_duzeyi VARCHAR(50) NOT NULL,
    kredi DECIMAL(4,2) NOT NULL,
    ogretim_uyesi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programlar(id) ON DELETE CASCADE
);

-- Students table
CREATE TABLE IF NOT EXISTS ogrenciler (
    ogrenci_no VARCHAR(20) PRIMARY KEY,
    ogrenci_adi VARCHAR(100) NOT NULL,
    ogrenci_soyadi VARCHAR(100) NOT NULL,
    program_id INT NOT NULL,
    ogrenci_sinifi INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programlar(id) ON DELETE CASCADE
);

-- Evaluation criteria table
CREATE TABLE IF NOT EXISTS degerlendirme_kriterleri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ders_id INT NOT NULL,
    kriter_adi VARCHAR(255) NOT NULL,
    etki_orani DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ders_id) REFERENCES dersler(id) ON DELETE CASCADE
);

-- Grades table
CREATE TABLE IF NOT EXISTS notlar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ogrenci_no VARCHAR(20) NOT NULL,
    kriter_id INT NOT NULL,
    aldigi_not DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ogrenci_no) REFERENCES ogrenciler(ogrenci_no) ON DELETE CASCADE,
    FOREIGN KEY (kriter_id) REFERENCES degerlendirme_kriterleri(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ogrenci_kriter (ogrenci_no, kriter_id)
);

-- Course learning outcomes table
CREATE TABLE IF NOT EXISTS ders_ogrenme_ciktilari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ders_id INT NOT NULL,
    ogrenme_ciktisi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ders_id) REFERENCES dersler(id) ON DELETE CASCADE
);

-- Program learning outcomes table
CREATE TABLE IF NOT EXISTS program_ogrenme_ciktilari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    ogrenme_ciktisi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programlar(id) ON DELETE CASCADE
);

-- Program outcome - Course outcome relationship table
CREATE TABLE IF NOT EXISTS program_ders_ciktisi_iliskisi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_ciktisi_id INT NOT NULL,
    ders_ciktisi_id INT NOT NULL,
    deger TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_ciktisi_id) REFERENCES program_ogrenme_ciktilari(id) ON DELETE CASCADE,
    FOREIGN KEY (ders_ciktisi_id) REFERENCES ders_ogrenme_ciktilari(id) ON DELETE CASCADE,
    UNIQUE KEY unique_program_ders_ciktisi (program_ciktisi_id, ders_ciktisi_id)
);

-- Course outcome - Evaluation criteria relationship table
CREATE TABLE IF NOT EXISTS ders_ciktisi_degerlendirme_kriteri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ders_ciktisi_id INT NOT NULL,
    degerlendirme_kriteri_id INT NOT NULL,
    deger TINYINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ders_ciktisi_id) REFERENCES ders_ogrenme_ciktilari(id) ON DELETE CASCADE,
    FOREIGN KEY (degerlendirme_kriteri_id) REFERENCES degerlendirme_kriterleri(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ders_ciktisi_kriter (ders_ciktisi_id, degerlendirme_kriteri_id)
); 