const express = require('express');
const multer = require('multer');
const path = require('path');

// Clean Architecture Imports
// Infrastructure (Adapters)
const BmtFileRepository = require('./infrastructure/services/BmtFileRepository');
const PuppeteerReportService = require('./infrastructure/services/PuppeteerReportService');

// Application (Use Cases)
const GenerateThermalReport = require('./application/use_cases/GenerateThermalReport');

// Presentation (Controllers)
const ThermalReportController = require('./presentation/controllers/ThermalReportController');

// --- Composition Root ---
// 1. Initialize Repositories/Services
const bmtRepository = new BmtFileRepository();
const reportService = new PuppeteerReportService();

// 2. Initialize Use Cases (Dependency Injection)
const generateThermalReportUseCase = new GenerateThermalReport(bmtRepository, reportService);

// 3. Initialize Controllers
const thermalReportController = new ThermalReportController(generateThermalReportUseCase);

// --- Framework Setup ---
const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Route binding
app.post('/upload', upload.array('files'), (req, res) => {
    thermalReportController.handleUpload(req, res);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('CLEAN ARCHITECTURE ENABLED');
});
