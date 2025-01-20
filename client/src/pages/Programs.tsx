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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axiosInstance from "../config/axios";

interface Program {
  _id: string;
  programAdi: string;
  programBilgi: string;
  programFakulte: string;
  programOgretimTuru: string;
  programOgretimSuresi: number;
}

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    programAdi: "",
    programBilgi: "",
    programFakulte: "",
    programOgretimTuru: "",
    programOgretimSuresi: 4,
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axiosInstance.get("/programlar");
      console.log(response.data);
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({
      programAdi: "",
      programBilgi: "",
      programFakulte: "",
      programOgretimTuru: "",
      programOgretimSuresi: 4,
    });
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      programAdi: program.programAdi,
      programBilgi: program.programBilgi,
      programFakulte: program.programFakulte,
      programOgretimTuru: program.programOgretimTuru,
      programOgretimSuresi: program.programOgretimSuresi,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProgram(null);
  };

  const handleSubmit = async () => {
    try {
      const requestData = {
        programAdi: formData.programAdi,
        programBilgi: formData.programBilgi,
        programFakultesi: formData.programFakulte,
        programOgretimTuru: formData.programOgretimTuru,
        programOgretimSuresi: formData.programOgretimSuresi,
      };

      if (editMode && selectedProgram) {
        console.log(selectedProgram._id, "selectedProgram");
        await axiosInstance.put(
          `/programDuzenle/${selectedProgram._id}`,
          requestData
        );
      } else {
        await axiosInstance.post("/programEkle", requestData);
      }
      fetchPrograms();
      handleClose();
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Program kaydedilirken bir hata oluştu!");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu programı silmek istediğinizden emin misiniz?")) {
      try {
        await axiosInstance.delete(`/programSil/${id}`);
        fetchPrograms();
      } catch (error) {
        console.error("Error deleting program:", error);
        alert("Program silinirken bir hata oluştu!");
      }
    }
  };

  const handleViewDetails = (program: Program) => {
    setSelectedProgram(program);
    setDetailsModalOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsModalOpen(false);
    setSelectedProgram(null);
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
          Programlar
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Program Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Program Adı</TableCell>
              <TableCell>Fakülte</TableCell>
              <TableCell>Öğretim Türü</TableCell>
              <TableCell>Öğretim Süresi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program) => (
              <TableRow
                key={program._id}
                onClick={() => handleViewDetails(program)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                <TableCell>{program.programAdi}</TableCell>
                <TableCell>{program.programFakulte}</TableCell>
                <TableCell>{program.programOgretimTuru}</TableCell>
                <TableCell>{program.programOgretimSuresi} Yıl</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={() => handleEdit(program)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(program._id)}
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
          {editMode ? "Program Düzenle" : "Yeni Program Ekle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Program Adı"
            fullWidth
            value={formData.programAdi}
            onChange={(e) =>
              setFormData({ ...formData, programAdi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Program Hakkında"
            fullWidth
            multiline
            rows={4}
            value={formData.programBilgi}
            onChange={(e) =>
              setFormData({ ...formData, programBilgi: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Fakülte"
            fullWidth
            value={formData.programFakulte}
            onChange={(e) =>
              setFormData({ ...formData, programFakulte: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Öğretim Türü"
            fullWidth
            value={formData.programOgretimTuru}
            onChange={(e) =>
              setFormData({ ...formData, programOgretimTuru: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Öğretim Süresi (Yıl)"
            type="number"
            fullWidth
            value={formData.programOgretimSuresi}
            onChange={(e) =>
              setFormData({
                ...formData,
                programOgretimSuresi: parseInt(e.target.value),
              })
            }
            InputProps={{ inputProps: { min: 1, max: 6 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsModalOpen}
        onClose={handleDetailsClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Program Detayları</DialogTitle>
        <DialogContent>
          {selectedProgram && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProgram.programAdi}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Program Bilgisi:</strong>
                <br />
                {selectedProgram.programBilgi}
              </Typography>
              <Typography variant="body1">
                <strong>Fakülte:</strong> {selectedProgram.programFakulte}
              </Typography>
              <Typography variant="body1">
                <strong>Öğretim Türü:</strong>{" "}
                {selectedProgram.programOgretimTuru}
              </Typography>
              <Typography variant="body1">
                <strong>Öğretim Süresi:</strong>{" "}
                {selectedProgram.programOgretimSuresi} Yıl
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Programs;
