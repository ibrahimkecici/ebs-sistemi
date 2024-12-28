// __tests__/ebs-system.test.js
const { calculateStudentCourseOutcomes, 
        calculateStudentProgramOutcomes,
        createWeightedAssessmentTable,
        validateRelationshipMatrix } = require('../src/calculator');

describe('EBS Sistem Testleri', () => {
    describe('Ders Çıktıları Hesaplamaları', () => {
        test('öğrenci ders çıktılarını doğru hesaplamalı', () => {
            const studentGrades = {
                student_id: "2******1",
                grades: {
                    homework1: 80,
                    homework2: 75,
                    quiz: 85,
                    midterm: 70,
                    final: 90
                }
            };

            const weights = {
                homework1: 0.1,
                homework2: 0.1,
                quiz: 0.1,
                midterm: 0.3,
                final: 0.4
            };

            const result = calculateStudentCourseOutcomes(studentGrades, weights);
            expect(result).toBeDefined();
            expect(result.total).toBeLessThanOrEqual(100);
            expect(result.total).toBeGreaterThanOrEqual(0);
        });

        test('geçersiz not değerleri için hata vermeli', () => {
            const invalidGrades = {
                student_id: "2******1",
                grades: {
                    homework1: 120, // 100'den büyük geçersiz değer
                    midterm: -10    // 0'dan küçük geçersiz değer
                }
            };

            expect(() => {
                calculateStudentCourseOutcomes(invalidGrades, {});
            }).toThrow('Geçersiz not değeri! Notlar 0-100 arasında olmalıdır.');
        });
    });

    describe('Program Çıktıları Hesaplamaları', () => {
        test('ders çıktılarına göre program çıktılarını hesaplamalı', () => {
            const courseOutcomes = {
                outcome1: 85,
                outcome2: 75,
                outcome3: 90
            };

            const relationshipMatrix = {
                program1: { outcome1: 0.8, outcome2: 0.4, outcome3: 0.6 },
                program2: { outcome1: 0.3, outcome2: 0.9, outcome3: 0.5 }
            };

            const result = calculateStudentProgramOutcomes(courseOutcomes, relationshipMatrix);
            expect(result).toBeDefined();
            expect(Object.values(result)).toEqual(
                expect.arrayContaining([
                    expect.any(Number)
                ])
            );
        });
    });

    describe('Ağırlıklı Değerlendirme Tablosu', () => {
        test('geçerli değerlerle ağırlıklı değerlendirme tablosu oluşturmalı', () => {
            const assessmentMatrix = [
                [1, 0, 1, 0, 0],
                [1, 1, 1, 0, 1],
                [0, 1, 0, 1, 1]
            ];

            const weights = [0.1, 0.1, 0.1, 0.3, 0.4];
            const table = createWeightedAssessmentTable(assessmentMatrix, weights);

            expect(table).toBeDefined();
            expect(table.length).toBe(assessmentMatrix.length);
            table.forEach(row => {
                expect(row.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1);
            });
        });

        test('değerlendirme matrisi değerleri 0 veya 1 olmalı', () => {
            const invalidMatrix = [
                [1, 0.5, 1], // Geçersiz değer 0.5
                [1, 1, 0]
            ];

            expect(() => {
                createWeightedAssessmentTable(invalidMatrix, [0.3, 0.3, 0.4]);
            }).toThrow('Geçersiz matris değeri! Değerler sadece 0 veya 1 olabilir.');
        });
    });

    describe('İlişki Matrisi Doğrulama', () => {
        test('ilişki matrisi değerleri 0-1 arasında olmalı', () => {
            const validMatrix = [
                [0.8, 0.4, 0.6],
                [0.3, 0.9, 0.5]
            ];

            expect(validateRelationshipMatrix(validMatrix)).toBe(true);
        });

        test('geçersiz ilişki matrisi değerlerini tespit etmeli', () => {
            const invalidMatrix = [
                [1.2, 0.4, 0.6], // 1'den büyük geçersiz değer
                [0.3, 0.9, 0.5]
            ];

            expect(() => {
                validateRelationshipMatrix(invalidMatrix);
            }).toThrow('Geçersiz ilişki matrisi değeri! Değerler 0-1 arasında olmalıdır.');
        });
    });
});