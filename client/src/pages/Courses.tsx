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
  programId: string;
  dersAdi: string;
  dersKodu: string;
  fakulte: string;
  ogretimDuzeyi: string;
  kredi: number;
  ogretimUyesi: string;
  programAdi: string;
}

interface Program {
  _id: string;
  programAdi: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    programId: "",
    dersAdi: "",
    dersKodu: "",
    fakulte: "",
    ogretimDuzeyi: "",
    kredi: 0,
    ogretimUyesi: "",
  });

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get("/dersler");
      console.log("Courses response:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axiosInstance.get("/programlar");
      console.log("Programs response:", response.data);
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      programId: "",
      dersAdi: "",
      dersKodu: "",
      fakulte: "",
      ogretimDuzeyi: "",
      kredi: 0,
      ogretimUyesi: "",
    });
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      programId: course.programId,
      dersAdi: course.dersAdi,
      dersKodu: course.dersKodu,
      fakulte: course.fakulte,
      ogretimDuzeyi: course.ogretimDuzeyi,
      kredi: course.kredi,
      ogretimUyesi: course.ogretimUyesi,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedCourse) {
        await axiosInstance.put(`/dersDuzenle/${selectedCourse._id}`, {
          ...formData,
          programId: formData.programId,
        });
      } else {
        await axiosInstance.post("/dersEkle", {
          ...formData,
          programId: formData.programId,
        });
      }
      fetchCourses();
      handleClose();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu dersi silmek istediğinizden emin misiniz?")) {
      try {
        await axiosInstance.delete(`/dersSil/${id}`);
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  console.log(formData.programId, "casdasas");

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
          Dersler
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Ders Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ders Kodu</TableCell>
              <TableCell>Ders Adı</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Kredi</TableCell>
              <TableCell>Öğretim Üyesi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course._id}>
                <TableCell>{course.dersKodu}</TableCell>
                <TableCell>{course.dersAdi}</TableCell>
                <TableCell>{course.programAdi}</TableCell>
                <TableCell>{course.kredi}</TableCell>
                <TableCell>{course.ogretimUyesi}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(course)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(course._id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Ders Düzenle" : "Yeni Ders Ekle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Program"
            fullWidth
            value={formData.programId || ""}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                programId: e.target.value,
              }))
            }
          >
            {programs.map((program) => (
              <MenuItem key={program._id} value={program._id}>
                {program.programAdi}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Ders Adı"
            fullWidth
            value={formData.dersAdi}
            onChange={(e) =>
              setFormData({ ...formData, dersAdi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Ders Kodu"
            fullWidth
            value={formData.dersKodu}
            onChange={(e) =>
              setFormData({ ...formData, dersKodu: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Fakülte"
            fullWidth
            value={formData.fakulte}
            onChange={(e) =>
              setFormData({ ...formData, fakulte: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Öğretim Düzeyi"
            fullWidth
            value={formData.ogretimDuzeyi}
            onChange={(e) =>
              setFormData({ ...formData, ogretimDuzeyi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Kredi"
            type="number"
            fullWidth
            value={formData.kredi}
            onChange={(e) =>
              setFormData({ ...formData, kredi: parseInt(e.target.value) })
            }
          />
          <TextField
            margin="dense"
            label="Öğretim Üyesi"
            fullWidth
            value={formData.ogretimUyesi}
            onChange={(e) =>
              setFormData({ ...formData, ogretimUyesi: e.target.value })
            }
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

export default Courses;
