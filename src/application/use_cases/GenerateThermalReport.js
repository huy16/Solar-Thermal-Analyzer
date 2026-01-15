const path = require('path');
const fs = require('fs');

class GenerateThermalReport {
    constructor(bmtRepository, reportService) {
        this.bmtRepository = bmtRepository;
        this.reportService = reportService;
    }

    async execute(files, remarks, conclusions, recommendations, tempDir, reportTitle) {
        const thermalImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const remark = remarks[i] || ""; // Match by index
            const conclusion = conclusions[i] || "";
            const recommendation = recommendations[i] || "";
            const bmtPath = file.path;
            try {
                // Parse BMT to get Entity
                // Pass originalname to keep correct file identity
                const thermalImage = await this.bmtRepository.parse(bmtPath, tempDir, file.originalname);
                thermalImage.remarks = remark; // Set remark
                thermalImage.conclusion = conclusion;
                thermalImage.recommendation = recommendation;

                // Calculate Severity
                const maxTemp = parseFloat(thermalImage.maxTemp);
                if (!isNaN(maxTemp)) {
                    if (maxTemp > 70) {
                        thermalImage.severity = "Critical";
                    } else if (maxTemp >= 50) {
                        thermalImage.severity = "Warning";
                    } else {
                        thermalImage.severity = "Normal";
                    }
                }

                thermalImages.push(thermalImage);
            } finally {
                // Cleanup upload
                if (fs.existsSync(bmtPath)) fs.unlinkSync(bmtPath);
            }
        }

        const reportName = `Report_${Date.now()}.pdf`;
        const reportPath = path.join(tempDir, reportName);

        // Generate Report
        await this.reportService.generate(thermalImages, reportPath, reportTitle);

        return {
            reportPath,
            reportName,
            cleanup: () => {
                if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
                thermalImages.forEach(img => {
                    if (fs.existsSync(img.thermalImagePath)) fs.unlinkSync(img.thermalImagePath);
                    if (img.realImagePath && fs.existsSync(img.realImagePath)) fs.unlinkSync(img.realImagePath);
                });
            }
        };
    }
}

module.exports = GenerateThermalReport;
