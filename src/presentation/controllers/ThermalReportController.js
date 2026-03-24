const fs = require('fs');
const path = require('path');
const os = require('os');

class ThermalReportController {
    constructor(generateThermalReportUseCase) {
        this.generateThermalReportUseCase = generateThermalReportUseCase;
    }

    async handleUpload(req, res) {
        console.log(`[Controller] handleUpload: files count = ${req.files ? req.files.length : 0}`);
        if (req.files) {
            req.files.forEach(f => console.log(`  - Field: ${f.fieldname}, Name: ${f.originalname}`));
        }
        if ((!req.files || req.files.length === 0) && !req.body.omData) {
            return res.status(400).send('No files or form data uploaded.');
        }

        const tempDir = path.join(os.tmpdir(), 'testo_processing');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        try {
            let remarks = req.body.remarks || [];
            if (!Array.isArray(remarks)) remarks = [remarks];

            let conclusions = req.body.conclusions || [];
            if (!Array.isArray(conclusions)) conclusions = [conclusions];

            let recommendations = req.body.recommendations || [];
            if (!Array.isArray(recommendations)) recommendations = [recommendations];

            const reportTitle = req.body.reportTitle || "BÁO CÁO KẾT QUẢ KIỂM TRA NHIỆT";
            const deviceType = req.body.deviceType || "device"; // Default to generic if missing
            
            let omData = null;
            if (req.body.omData) {
                try {
                    omData = JSON.parse(req.body.omData);
                } catch (e) {
                    console.error("Failed to parse omData:", e);
                }
            }

            const result = await this.generateThermalReportUseCase.execute(req.files, remarks, conclusions, recommendations, tempDir, reportTitle, deviceType, omData);

            res.download(result.reportPath, 'Testo_Thermal_Report.pdf', (err) => {
                if (err) console.error("Error sending file:", err);

                try {
                    result.cleanup();
                } catch (cleanupErr) {
                    console.error("Cleanup error:", cleanupErr);
                }
            });

        } catch (error) {
            console.error("Controller Error:", error);
            fs.appendFileSync('error_log.txt', `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n\n`);
            res.status(500).send(`Error generating report: ${error.message}\n\nStack: ${error.stack}`);
        }
    }
}

module.exports = ThermalReportController;
