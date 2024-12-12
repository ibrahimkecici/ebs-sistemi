-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: localhost
-- Üretim Zamanı: 12 Ara 2024, 14:28:01
-- Sunucu sürümü: 10.4.28-MariaDB
-- PHP Sürümü: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `ebs_sistemi`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `Ders_Ciktisi`
--

CREATE TABLE `Ders_Ciktisi` (
  `ID` int(11) NOT NULL,
  `ogrenme_ciktisi` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `Ders_Ciktisi`
--

INSERT INTO `Ders_Ciktisi` (`ID`, `ogrenme_ciktisi`) VALUES
(1, 'Öğrenciler klasik ve güncel yazılım geliştirme süreçlerini, her birinin karşılaştırmalı avantajları, dezavantajları ve uygulayabilecekleri durumları içerecek şekilde öğrenir'),
(2, 'Öğrenciler yazılım geliştirme projeleri ile ilgili riskleri ve risk yönetimi yapabilme yeteneği kazanır'),
(3, 'Öğrenciler bir yazılım geliştirme ekibinin üyesi veya yöneticisi olarak görev yapabilir'),
(4, 'Öğrenciler bir yazılım geliştirme projesi içindeki mesleki ve etik konuları kavrar'),
(5, 'Öğrenciler bir yazılım geliştirme projesinin teknik belgelendirmesini yapabilme yeteneği kazanır');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `program_ciktisi`
--

CREATE TABLE `program_ciktisi` (
  `ID` int(11) NOT NULL,
  `prog_ogrenme_ciktisi` text NOT NULL,
  `katki_1` char(1) NOT NULL,
  `katki_2` char(1) NOT NULL,
  `katki_3` char(1) NOT NULL,
  `katki_4` char(1) NOT NULL,
  `katki_5` char(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `program_ciktisi`
--

INSERT INTO `program_ciktisi` (`ID`, `prog_ogrenme_ciktisi`, `katki_1`, `katki_2`, `katki_3`, `katki_4`, `katki_5`) VALUES
(1, 'Matematik, fen bilimleri ve yazılım mühendisliği disiplinine özgü konularda yeterli bilgi birikimi.', '', '', 'X', '', ''),
(2, 'Karmaşık mühendislik problemlerini saptama, tanımlama.', '', '', '', 'X', ''),
(3, 'Karmaşık bir sistemi, süreci, cihazı veya ürünü gerçekçi kısıtlar ve koşullar altında.', '', '', '', '', 'X');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `Ders_Ciktisi`
--
ALTER TABLE `Ders_Ciktisi`
  ADD PRIMARY KEY (`ID`);

--
-- Tablo için indeksler `program_ciktisi`
--
ALTER TABLE `program_ciktisi`
  ADD PRIMARY KEY (`ID`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `Ders_Ciktisi`
--
ALTER TABLE `Ders_Ciktisi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `program_ciktisi`
--
ALTER TABLE `program_ciktisi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
