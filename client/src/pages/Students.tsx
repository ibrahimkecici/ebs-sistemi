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

interface Student {
  _id: string;
  ogrenci_no: string;
  ogrenci_adi: string;
  ogrenci_soyadi: string;
  program_id: number;
  ogrenci_sinifi: number;
}

interface Program {
  _id: number;
  programAdi: string;
  programBilgi: string;
  programFakulte: string;
  programOgretimTuru: string;
  programOgretimSuresi: number;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    ogrenci_no: "",
    ogrenci_adi: "",
    ogrenci_soyadi: "",
    program_id: "",
    ogrenci_sinifi: 1,
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (programs.length > 0 && !editMode && !formData.program_id) {
      setFormData((prev) => ({
        ...prev,
        program_id: programs[0]._id.toString(),
      }));
    }
  }, [programs, editMode]);

  const fetchStudents = async () => {
    try {
      console.log("Fetching students...");
      const response = await axiosInstance.get("/ogrenciler");
      console.log("Students response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));
      if (Array.isArray(response.data)) {
        console.log("Array length:", response.data.length);
        if (response.data.length > 0) {
          console.log("First student:", response.data[0]);
        }
      } else if (typeof response.data === "object") {
        console.log("Response keys:", Object.keys(response.data));
      }
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    }
  };

  const fetchPrograms = async () => {
    try {
      console.log("Fetching programs...");
      const response = await axiosInstance.get("/programlar");
      console.log("Programs response:", response.data);
      console.log("Programs response type:", typeof response.data);
      console.log("Programs is array?", Array.isArray(response.data));
      if (Array.isArray(response.data)) {
        console.log("Programs array length:", response.data.length);
        if (response.data.length > 0) {
          console.log("First program:", response.data[0]);
        }
      }
      setPrograms(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Error fetching programs:", error);
      if (error.response) {
        console.error("Programs error response:", error.response.data);
        console.error("Programs error status:", error.response.status);
      }
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      ogrenci_no: "",
      ogrenci_adi: "",
      ogrenci_soyadi: "",
      program_id: programs.length > 0 ? programs[0]._id.toString() : "",
      ogrenci_sinifi: 1,
    });
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      ogrenci_no: student.ogrenci_no,
      ogrenci_adi: student.ogrenci_adi,
      ogrenci_soyadi: student.ogrenci_soyadi,
      program_id: student.program_id.toString(),
      ogrenci_sinifi: student.ogrenci_sinifi,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ogrenciNo: formData.ogrenci_no,
        ogrenciAdi: formData.ogrenci_adi,
        ogrenciSoyadi: formData.ogrenci_soyadi,
        programId: parseInt(formData.program_id),
        ogrenciSinifi: formData.ogrenci_sinifi,
      };
      console.log("Submitting form data:", submitData);
      if (editMode && selectedStudent) {
        const response = await axiosInstance.put(
          `/ogrenciDuzenle/${selectedStudent.ogrenci_no}`,
          submitData
        );
        console.log("Edit response:", response.data);
      } else {
        const response = await axiosInstance.post("/ogrenciEkle", submitData);
        console.log("Add response:", response.data);
      }
      fetchStudents();
      handleClose();
    } catch (error: any) {
      console.error("Error saving student:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        alert(`Hata: ${error.response.data.message || "Bir hata oluştu"}`);
      }
    }
  };

  const handleDelete = async (ogrenci_no: string) => {
    if (window.confirm("Bu öğrenciyi silmek istediğinizden emin misiniz?")) {
      try {
        await axiosInstance.delete(`/ogrenciSil/${ogrenci_no}`);
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const getStudentProgram = (program_id: number) => {
    const program = programs.find((p) => p._id === program_id);
    return program ? program.programAdi : "";
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
          Öğrenciler
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Öğrenci Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Öğrenci No</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Sınıf</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.ogrenci_no}</TableCell>
                <TableCell>{student.ogrenci_adi}</TableCell>
                <TableCell>{student.ogrenci_soyadi}</TableCell>
                <TableCell>{getStudentProgram(student.program_id)}</TableCell>
                <TableCell>{student.ogrenci_sinifi}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(student)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(student.ogrenci_no)}
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
          {editMode ? "Öğrenci Düzenle" : "Yeni Öğrenci Ekle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Öğrenci No"
            fullWidth
            value={formData.ogrenci_no}
            onChange={(e) =>
              setFormData({ ...formData, ogrenci_no: e.target.value })
            }
            disabled={editMode}
          />
          <TextField
            margin="dense"
            label="Ad"
            fullWidth
            value={formData.ogrenci_adi}
            onChange={(e) =>
              setFormData({ ...formData, ogrenci_adi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Soyad"
            fullWidth
            value={formData.ogrenci_soyadi}
            onChange={(e) =>
              setFormData({ ...formData, ogrenci_soyadi: e.target.value })
            }
          />
          <TextField
            select
            margin="dense"
            label="Program"
            fullWidth
            value={formData.program_id}
            onChange={(e) =>
              setFormData({ ...formData, program_id: e.target.value })
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
            label="Sınıf"
            type="number"
            fullWidth
            value={formData.ogrenci_sinifi}
            onChange={(e) =>
              setFormData({
                ...formData,
                ogrenci_sinifi: parseInt(e.target.value),
              })
            }
            InputProps={{ inputProps: { min: 1, max: 4 } }}
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

export default Students;
