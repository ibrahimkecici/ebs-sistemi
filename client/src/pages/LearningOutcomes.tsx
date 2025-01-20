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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axiosInstance from "../config/axios";

interface Program {
  id?: string;
  _id?: string;
  program_id?: string;
  programAdi: string;
}

interface Course {
  id?: string;
  _id?: string;
  ders_id?: string;
  dersAdi: string;
  ders_adi?: string;
  dersKodu: string;
  ders_kodu?: string;
  programId?: string;
  program_id?: string;
}

interface ProgramOutcome {
  id: string;
  programId: string;
  ogrenme_ciktisi: string;
}

interface CourseOutcome {
  id: string;
  dersId: string;
  ogrenme_ciktisi: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const LearningOutcomes: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<
    ProgramOutcome | CourseOutcome | null
  >(null);
  const [formData, setFormData] = useState({
    ogrenmeCiktisi: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramOutcomes();
      fetchCourses(selectedProgram);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseOutcomes();
    }
  }, [selectedCourse]);

  const fetchPrograms = async () => {
    try {
      const response = await axiosInstance.get("/programlar");
      console.log("Programs raw response:", response.data);
      const formattedPrograms = response.data.map((program: any) => ({
        id: program._id || program.program_id || program.id,
        programAdi: program.programAdi || program.program_adi,
      }));
      console.log("Formatted programs:", formattedPrograms);
      setPrograms(formattedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchCourses = async (programId: string) => {
    try {
      const response = await axiosInstance.get(
        `/dersler?programId=${programId}`
      );
      console.log("Courses raw response:", response.data);
      const formattedCourses = response.data.map((course: any) => ({
        id: course._id || course.ders_id || course.id,
        dersAdi: course.dersAdi || course.ders_adi,
        dersKodu: course.dersKodu || course.ders_kodu,
        programId: course.programId || course.program_id,
      }));
      console.log("Formatted courses:", formattedCourses);
      setCourses(formattedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchProgramOutcomes = async () => {
    try {
      const response = await axiosInstance.get(
        `/programOgrenmeCiktilari/${selectedProgram}`
      );
      console.log("Program outcomes response:", response.data);
      setProgramOutcomes(response.data);
    } catch (error) {
      console.error("Error fetching program outcomes:", error);
    }
  };

  const fetchCourseOutcomes = async () => {
    try {
      const response = await axiosInstance.get(
        `/dersOgrenmeCiktilari/${selectedCourse}`
      );
      console.log("Course outcomes response:", response.data);
      setCourseOutcomes(response.data);
    } catch (error) {
      console.error("Error fetching course outcomes:", error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpen = () => {
    if (tabValue === 0 && !selectedProgram) {
      alert("Lütfen önce bir program seçin");
      return;
    }
    if (tabValue === 1 && !selectedCourse) {
      alert("Lütfen önce bir ders seçin");
      return;
    }
    setOpen(true);
    setEditMode(false);
    setFormData({
      ogrenmeCiktisi: "",
    });
  };

  const handleEdit = (outcome: ProgramOutcome | CourseOutcome) => {
    setSelectedOutcome(outcome);
    setFormData({
      ogrenmeCiktisi: outcome.ogrenme_ciktisi,
    });
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOutcome(null);
  };

  const handleSubmit = async () => {
    try {
      if (tabValue === 0) {
        // Program Outcomes
        if (editMode && selectedOutcome) {
          await axiosInstance.put(
            `/programOgrenmeCiktisiDuzenle/${selectedOutcome.id}`,
            {
              ...formData,
              programId: selectedProgram,
            }
          );
        } else {
          await axiosInstance.post("/programOgrenmeCiktisiEkle", {
            ...formData,
            programId: selectedProgram,
          });
        }
        fetchProgramOutcomes();
      } else {
        // Course Outcomes
        if (editMode && selectedOutcome) {
          await axiosInstance.put(
            `/dersOgrenmeCiktisiDuzenle/${selectedOutcome.id}`,
            {
              ...formData,
              dersId: selectedCourse,
            }
          );
        } else {
          await axiosInstance.post("/dersOgrenmeCiktisiEkle", {
            ...formData,
            dersId: selectedCourse,
          });
        }
        fetchCourseOutcomes();
      }
      handleClose();
    } catch (error) {
      console.error("Error saving outcome:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Bu öğrenme çıktısını silmek istediğinizden emin misiniz?")
    ) {
      try {
        if (tabValue === 0) {
          await axiosInstance.delete(`/programOgrenmeCiktisiSil/${id}`);
          fetchProgramOutcomes();
        } else {
          await axiosInstance.delete(`/dersOgrenmeCiktisiSil/${id}`);
          fetchCourseOutcomes();
        }
      } catch (error) {
        console.error("Error deleting outcome:", error);
      }
    }
  };

  const renderTable = () => {
    const outcomes = tabValue === 0 ? programOutcomes : courseOutcomes;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Öğrenme Çıktısı</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outcomes.map((outcome, index) => (
              <TableRow key={outcome.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{outcome.ogrenme_ciktisi}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(outcome)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(outcome.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Program Çıktıları" />
          <Tab label="Ders Çıktıları" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Program</InputLabel>
          <Select
            value={selectedProgram}
            label="Program"
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            {programs.map((program) => (
              <MenuItem key={program.id} value={program.id}>
                {program.programAdi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedProgram && (
          <>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Çıktı Ekle
              </Button>
            </Box>
            {renderTable()}
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Program</InputLabel>
          <Select
            value={selectedProgram}
            label="Program"
            onChange={(e) => {
              setSelectedProgram(e.target.value);
              setSelectedCourse("");
            }}
          >
            {programs.map((program) => (
              <MenuItem key={program.id} value={program.id}>
                {program.programAdi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProgram && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Ders</InputLabel>
            <Select
              value={selectedCourse}
              label="Ders"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.dersKodu} - {course.dersAdi}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedCourse && (
          <>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Çıktı Ekle
              </Button>
            </Box>
            {renderTable()}
          </>
        )}
      </TabPanel>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editMode ? "Öğrenme Çıktısı Düzenle" : "Yeni Öğrenme Çıktısı"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Öğrenme Çıktısı"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.ogrenmeCiktisi}
            onChange={(e) =>
              setFormData({ ...formData, ogrenmeCiktisi: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LearningOutcomes;
