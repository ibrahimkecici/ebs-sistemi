import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import Programs from "./pages/Programs";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Evaluations from "./pages/Evaluations";
import Grades from "./pages/Grades";
import LearningOutcomes from "./pages/LearningOutcomes";
import Tables from "./pages/Tables";

const App: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Routes>
          <Route path="/" element={<Programs />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/students" element={<Students />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/learning-outcomes" element={<LearningOutcomes />} />
          <Route path="/tables" element={<Tables />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
