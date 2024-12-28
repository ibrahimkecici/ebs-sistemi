class EBSValidator {
    constructor() {
        this.errors = [];
    }

    // Değerlendirme Kriterlerini Doğrulama
    validateAssessmentCriteria(criteria) {
        try {
            // Minimum 3 kriter kontrolü
            if (Object.keys(criteria).length < 3) {
                throw new Error('En az 3 değerlendirme kriteri belirlenmelidir!');
            }

            // Ağırlıkların toplamı kontrolü
            const totalWeight = Object.values(criteria).reduce((sum, weight) => sum + weight, 0);
            if (totalWeight > 100) {
                throw new Error('Değerlendirme kriterleri ağırlıkları toplamı 100\'ü geçemez!');
            }

            return true;
        } catch (error) {
            this.errors.push(error.message);
            return false;
        }
    }

    // Öğrenci Not Tablosunu Doğrulama
    validateStudentGrades(grades) {
        try {
            Object.entries(grades).forEach(([studentId, gradeObj]) => {
                // Öğrenci numarası format kontrolü
                if (!studentId.match(/^2\*{6}\d{1,2}$/)) {
                    throw new Error(`Geçersiz öğrenci numarası formatı: ${studentId}`);
                }

                // Not değerleri kontrolü (0-100 arası)
                Object.entries(gradeObj).forEach(([criterion, grade]) => {
                    if (grade < 0 || grade > 100) {
                        throw new Error(`${studentId} numaralı öğrencinin ${criterion} notu 0-100 aralığında olmalıdır!`);
                    }
                });
            });

            return true;
        } catch (error) {
            this.errors.push(error.message);
            return false;
        }
    }

    // İlişki Matrisini Doğrulama
    validateRelationshipMatrix(matrix) {
        try {
            Object.entries(matrix).forEach(([rowKey, row]) => {
                Object.entries(row).forEach(([colKey, value]) => {
                    if (value < 0 || value > 1) {
                        throw new Error(`İlişki matrisindeki değer geçersiz! Satır: ${rowKey}, Sütun: ${colKey}, Değer: ${value} (0-1 aralığında olmalı)`);
                    }
                });
            });

            return true;
        } catch (error) {
            this.errors.push(error.message);
            return false;
        }
    }

    // Ağırlıklı Değerlendirme Tablosunu Doğrulama
    validateWeightedAssessmentTable(table) {
        try {
            Object.entries(table).forEach(([outcomeId, assessments]) => {
                Object.entries(assessments).forEach(([criterionId, value]) => {
                    if (value !== 0 && value !== 1) {
                        throw new Error(`Ağırlıklı değerlendirme tablosundaki değer geçersiz! Çıktı: ${outcomeId}, Kriter: ${criterionId}, Değer: ${value} (Sadece 0 veya 1 olabilir)`);
                    }
                });
            });

            return true;
        } catch (error) {
            this.errors.push(error.message);
            return false;
        }
    }

    // Program Çıktıları Başarı Oranı Hesaplaması Doğrulama
    validateProgramOutcomeCalculation(table) {
        try {
            Object.entries(table).forEach(([outcomeId, values]) => {
                // Başarı oranı kontrolü
                const successRate = values.successRate;
                if (successRate < 0 || successRate > 100) {
                    throw new Error(`Program çıktısı başarı oranı geçersiz! Çıktı: ${outcomeId}, Oran: ${successRate} (0-100 aralığında olmalı)`);
                }

                // İlişki değeri kontrolü
                const relationshipValue = values.relationshipValue;
                if (relationshipValue < 0 || relationshipValue > 1) {
                    throw new Error(`Program çıktısı ilişki değeri geçersiz! Çıktı: ${outcomeId}, Değer: ${relationshipValue} (0-1 aralığında olmalı)`);
                }
            });

            return true;
        } catch (error) {
            this.errors.push(error.message);
            return false;
        }
    }

    // Son hataları alma
    getErrors() {
        return this.errors;
    }

    // Hata listesini temizleme
    clearErrors() {
        this.errors = [];
    }
}

module.exports = EBSValidator;