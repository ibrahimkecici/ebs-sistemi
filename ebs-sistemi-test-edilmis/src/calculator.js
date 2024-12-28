// Hesap makinesi fonksiyonlarının uygulanması

// Öğrenci ders çıktılarının hesaplanması fonksiyonu
exports.calculateStudentCourseOutcomes = (studentGrades, weights) => {
    const grades = studentGrades.grades;
    
    // Notları doğrula
    Object.values(grades).forEach(grade => {
        if (grade < 0 || grade > 100) {
            throw new Error('Geçersiz not değeri! Notlar 0-100 arasında olmalıdır.');
        }
    });

    // Ağırlıklı toplamı hesapla
    let total = 0;
    Object.keys(grades).forEach(assessment => {
        total += grades[assessment] * weights[assessment];
    });

    return {
        student_id: studentGrades.student_id, // Öğrenci kimliği
        total: total // Ağırlıklı toplam
    };
};

// Öğrenci program çıktılarının hesaplanması fonksiyonu
exports.calculateStudentProgramOutcomes = (courseOutcomes, relationshipMatrix) => {
    const programOutcomes = {};
    
    // Program çıktılarının hesaplanması
    Object.keys(relationshipMatrix).forEach(program => {
        let total = 0;
        Object.keys(courseOutcomes).forEach(outcome => {
            total += courseOutcomes[outcome] * relationshipMatrix[program][outcome];
        });
        programOutcomes[program] = total;
    });

    return programOutcomes; // Program çıktıları
};

// Ağırlıklı değerlendirme tablosu oluşturma fonksiyonu
exports.createWeightedAssessmentTable = (matrix, weights) => {
    // Matris değerlerini doğrula
    matrix.forEach(row => {
        row.forEach(value => {
            if (value !== 0 && value !== 1) {
                throw new Error('Geçersiz matris değeri! Değerler sadece 0 veya 1 olabilir.');
            }
        });
    });

    // Ağırlıklı tabloyu oluştur
    return matrix.map(row => {
        return row.map((value, index) => value * weights[index]);
    });
};

// İlişki matrisini doğrulama fonksiyonu
exports.validateRelationshipMatrix = (matrix) => {
    matrix.forEach(row => {
        row.forEach(value => {
            if (value < 0 || value > 1) {
                throw new Error('Geçersiz ilişki matrisi değeri! Değerler 0-1 arasında olmalıdır.');
            }
        });
    });
    return true; // Matris geçerli
};
