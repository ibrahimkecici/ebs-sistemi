const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

// Route imports
const programRoutes = require("./routes/program.routes");
const dersRoutes = require("./routes/ders.routes");
const ogrenciRoutes = require("./routes/ogrenci.routes");
const degerlendirmeRoutes = require("./routes/degerlendirme.routes");
const notRoutes = require("./routes/not.routes");
const ogrenmeCiktisiRoutes = require("./routes/ogrenmeCiktisi.routes");
const tablolarRoutes = require("./routes/tablolar.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Routes
app.use("/api", programRoutes);
app.use("/api", dersRoutes);
app.use("/api", ogrenciRoutes);
app.use("/api", degerlendirmeRoutes);
app.use("/api", notRoutes);
app.use("/api", ogrenmeCiktisiRoutes);
app.use("/api", tablolarRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
