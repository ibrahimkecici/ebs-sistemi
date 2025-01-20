import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  IconButton,
  Input,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axiosInstance from "../config/axios";

interface Course {
  _id: string;
  dersAdi: string;
  dersKodu: string;
}

interface Student {
  _id?: string;
  ogrenci_no: string;
  ogrenci_adi: string;
  ogrenci_soyadi: string;
  program_id: number;
  ogrenci_sinifi: number;
  created_at: string;
  updated_at: string;
}

interface EvaluationCriteria {
  id: number;
  ders_id: number;
  kriter_adi: string;
  etki_orani: string;
  created_at: string;
  updated_at: string;
}

interface Grade {
  _id: string;
  ogrenci_no: string;
  kriter_id: string;
  aldigi_not: number;
}

const Grades: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationCriteria[]
  >([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    ogrenci_no: "",
    kriter_id: "",
    aldigi_not: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEvaluationCriteria();
      fetchGrades();
      fetchStudents();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/dersler");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchEvaluationCriteria = async () => {
    try {
      const response = await axiosInstance.get(
        `/dersDegerlendirmeKriterleri/${selectedCourse}`
      );
      setEvaluationCriteria(response.data);
    } catch (error) {
      console.error("Error fetching evaluation criteria:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axiosInstance.get(`/dersNotlar/${selectedCourse}`);
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/ogrenciler");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleOpen = () => {
    if (!selectedCourse) {
      alert("Lütfen önce bir ders seçin");
      return;
    }
    setOpen(true);
    setEditMode(false);
    setFormData({
      ogrenci_no: "",
      kriter_id: "",
      aldigi_not: 0,
    });
  };

  const handleEdit = (grade: Grade) => {
    setSelectedGrade(grade);
    setFormData({
      ogrenci_no: grade.ogrenci_no,
      kriter_id: grade.kriter_id,
      aldigi_not: grade.aldigi_not,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGrade(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedGrade) {
        await axiosInstance.put(`/notDuzenle`, {
          ogrenciNo: formData.ogrenci_no,
          kriterId: formData.kriter_id,
          aldigiNot: formData.aldigi_not,
        });
      } else {
        await axiosInstance.post("/notEkle", {
          ogrenciNo: formData.ogrenci_no,
          kriterId: formData.kriter_id,
          aldigiNot: formData.aldigi_not,
        });
      }
      fetchGrades();
      handleClose();
    } catch (error) {
      console.error("Error saving grade:", error);
    }
  };

  const handleDelete = async (ogrenciNo: string, kriterId: string) => {
    if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      try {
        await axiosInstance.delete(`/notSil`, {
          data: {
            ogrenciNo: ogrenciNo,
            kriterId: kriterId,
          },
        });
        fetchGrades();
      } catch (error) {
        console.error("Error deleting grade:", error);
      }
    }
  };
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dersId", selectedCourse); // Add dersId to form data

    try {
      await axiosInstance.post("/notYukle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchGrades();
    } catch (error) {
      console.error("Error uploading grades:", error);
    }
  };

  const getStudentName = (ogrenciNo: string) => {
    const student = students.find((s) => s.ogrenci_no === ogrenciNo);
    return student
      ? `${student.ogrenci_adi} ${student.ogrenci_soyadi}`
      : ogrenciNo;
  };

  const getCriterionName = (kriterId: string) => {
    const criterion = evaluationCriteria.find(
      (c) => c.id.toString() == kriterId
    );

    console.log(evaluationCriteria, "criterion");
    return criterion
      ? `${criterion.kriter_adi} (%${parseFloat(criterion.etki_orani) * 100})`
      : kriterId;
  };

  const filteredGrades = grades.filter((grade) =>
    studentFilter ? grade.ogrenci_no.includes(studentFilter) : true
  );

  const handleExportTemplate = async () => {
    if (!selectedCourse) {
      alert("Lütfen önce bir ders seçin");
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/excelSablonu/${selectedCourse}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "not_sablonu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting template:", error);
      alert("Şablon dışa aktarılırken bir hata oluştu");
    }
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Notlar
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportTemplate}
            disabled={!selectedCourse}
            sx={{ mr: 1 }}
          >
            Excel Şablonunu Dışa Aktar
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            disabled={!selectedCourse}
            sx={{ mr: 1, minWidth: "fit-content" }}
          >
            Excel Yükle
            <Input
              type="file"
              sx={{ display: "none" }}
              onChange={handleFileUpload}
              disabled={!selectedCourse}
              inputProps={{
                accept:
                  ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            disabled={!selectedCourse}
          >
            Not Ekle
          </Button>
        </Box>
      </Box>

      <TextField
        select
        fullWidth
        label="Ders"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        sx={{ mb: 2 }}
      >
        {courses.map((course) => (
          <MenuItem key={course._id} value={course._id}>
            {course.dersKodu} - {course.dersAdi}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Öğrenci Numarası ile Filtrele"
        value={studentFilter}
        onChange={(e) => setStudentFilter(e.target.value)}
        sx={{ mb: 3 }}
        placeholder="Öğrenci numarası giriniz..."
      />

      {selectedCourse && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Öğrenci No</TableCell>
                <TableCell>Öğrenci Adı</TableCell>
                <TableCell>Değerlendirme Kriteri</TableCell>
                <TableCell>Not</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={`${grade.ogrenci_no}-${grade.kriter_id}`}>
                  <TableCell>{grade.ogrenci_no}</TableCell>
                  <TableCell>{getStudentName(grade.ogrenci_no)}</TableCell>
                  <TableCell>{getCriterionName(grade.kriter_id)}</TableCell>
                  <TableCell>{grade.aldigi_not}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(grade)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleDelete(grade.ogrenci_no, grade.kriter_id)
                      }
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Not Düzenle" : "Yeni Not Ekle"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Öğrenci"
            fullWidth
            value={formData.ogrenci_no}
            onChange={(e) =>
              setFormData({ ...formData, ogrenci_no: e.target.value })
            }
            disabled={editMode}
          >
            {students.map((student) => (
              <MenuItem key={student.ogrenci_no} value={student.ogrenci_no}>
                {student.ogrenci_no} - {student.ogrenci_adi}{" "}
                {student.ogrenci_soyadi}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Değerlendirme Kriteri"
            fullWidth
            value={formData.kriter_id}
            onChange={(e) =>
              setFormData({ ...formData, kriter_id: e.target.value })
            }
            disabled={editMode}
          >
            {evaluationCriteria.map((criterion) => (
              <MenuItem key={criterion.id} value={criterion.id.toString()}>
                {criterion.kriter_adi} (%
                {parseFloat(criterion.etki_orani) * 100})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Not"
            type="number"
            fullWidth
            value={formData.aldigi_not}
            onChange={(e) =>
              setFormData({
                ...formData,
                aldigi_not: parseFloat(e.target.value),
              })
            }
            InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Grades;
