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
  IconButton,
  Box,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axiosInstance from "../config/axios";

interface Course {
  _id: string;
  dersAdi: string;
  dersKodu: string;
}

interface EvaluationCriteria {
  _id: string;
  dersId: string;
  kriterAdi: string;
  etkiOrani: number;
}

// API response interface to match the actual response format
interface ApiEvaluationCriteria {
  id: number;
  ders_id: number;
  kriter_adi: string;
  etki_orani: string;
  created_at: string;
  updated_at: string;
}

const Evaluations: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationCriteria[]
  >([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCriterion, setSelectedCriterion] =
    useState<EvaluationCriteria | null>(null);
  const [formData, setFormData] = useState({
    dersId: "",
    kriterAdi: "",
    etkiOrani: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEvaluationCriteria();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/dersler");
      console.log("Courses response:", response.data);
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
      console.log("Evaluation criteria response:", response.data);

      // Transform the API response to match our frontend interface
      const transformedData: EvaluationCriteria[] = response.data.map(
        (item: ApiEvaluationCriteria) => ({
          _id: item.id.toString(),
          dersId: item.ders_id.toString(),
          kriterAdi: item.kriter_adi,
          etkiOrani: parseFloat(item.etki_orani),
        })
      );

      setEvaluationCriteria(transformedData);
    } catch (error) {
      console.error("Error fetching evaluation criteria:", error);
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
      dersId: selectedCourse,
      kriterAdi: "",
      etkiOrani: 0,
    });
  };

  const handleEdit = (criterion: EvaluationCriteria) => {
    setSelectedCriterion(criterion);
    setFormData({
      dersId: criterion.dersId,
      kriterAdi: criterion.kriterAdi,
      etkiOrani: criterion.etkiOrani,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCriterion(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedCriterion) {
        await axiosInstance.put(
          `/degerlendirmeKriteriDuzenle/${selectedCriterion._id}`,
          formData
        );
      } else {
        await axiosInstance.post("/degerlendirmeKriteriEkle", formData);
      }
      fetchEvaluationCriteria();
      handleClose();
    } catch (error) {
      console.error("Error saving evaluation criterion:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Bu değerlendirme kriterini silmek istediğinizden emin misiniz?"
      )
    ) {
      try {
        await axiosInstance.delete(`/degerlendirmeKriteriSil/${id}`);
        fetchEvaluationCriteria();
      } catch (error) {
        console.error("Error deleting evaluation criterion:", error);
      }
    }
  };

  const getTotalPercentage = () => {
    return evaluationCriteria.reduce(
      (sum, criterion) => sum + criterion.etkiOrani * 100,
      0
    );
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
        <Typography variant="h4" component="h1">
          Değerlendirme Kriterleri
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={!selectedCourse}
        >
          Kriter Ekle
        </Button>
      </Box>

      <TextField
        select
        fullWidth
        label="Ders"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        sx={{ mb: 3 }}
      >
        {courses.map((course) => (
          <MenuItem key={course._id} value={course._id}>
            {course.dersKodu} - {course.dersAdi}
          </MenuItem>
        ))}
      </TextField>

      {selectedCourse && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kriter Adı</TableCell>
                  <TableCell>Etki Oranı (%)</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evaluationCriteria.map((criterion) => (
                  <TableRow key={criterion._id}>
                    <TableCell>{criterion.kriterAdi}</TableCell>
                    <TableCell>{criterion.etkiOrani * 100}%</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(criterion)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(criterion._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <strong>Toplam</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{getTotalPercentage()}%</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {getTotalPercentage() !== 100 && (
            <Typography color="error" sx={{ mt: 2 }}>
              Uyarı: Toplam etki oranı %100 olmalıdır. Şu anki toplam: %
              {getTotalPercentage()}
            </Typography>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode
            ? "Değerlendirme Kriteri Düzenle"
            : "Yeni Değerlendirme Kriteri Ekle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Kriter Adı"
            fullWidth
            value={formData.kriterAdi}
            onChange={(e) =>
              setFormData({ ...formData, kriterAdi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Etki Oranı (%)"
            type="number"
            fullWidth
            value={formData.etkiOrani * 100}
            onChange={(e) =>
              setFormData({
                ...formData,
                etkiOrani: parseFloat(e.target.value) / 100,
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

export default Evaluations;
