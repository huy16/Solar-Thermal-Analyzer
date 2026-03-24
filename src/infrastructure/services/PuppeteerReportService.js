const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const IReportService = require('../../domain/repositories/IReportService');
const DeviceClassifier = require('../../domain/services/DeviceClassifier');
const { OM_REPORT_DEFAULT_DATA } = require('../../domain/constants/omReportTemplateData');

class PuppeteerReportService extends IReportService {
    async generate(dataList, outputPath, reportTitle = "BÁO CÁO KẾT QUẢ KIỂM TRA NHIỆT") {
        return this.generateFullReport(OM_REPORT_DEFAULT_DATA, dataList, outputPath, reportTitle);
    }

    async generateFullReport(omData, thermalDataList, outputPath, reportTitle = "BIÊN BẢN KIỂM TRA – BẢO TRÌ – BẢO DƯỠNG") {
        let thermalPagesCount = 0;
        if (thermalDataList && thermalDataList.length > 0) {
            if (thermalDataList[0].items) {
                // Categorized format: each category takes Math.max(1, ceil(items/2)) pages
                thermalPagesCount = thermalDataList.reduce((acc, cat) => {
                    const count = cat.items ? cat.items.length : 0;
                    // Even count: full last page means remarks need their own page to avoid dính footer
                    const pages = (count > 0 && count % 2 === 0) ? (count / 2 + 1) : Math.max(1, Math.ceil(count / 2));
                    return acc + pages;
                }, 0);
            } else {
                thermalPagesCount = thermalDataList.length;
            }
        } else {
            // Section 10 always takes at least 1 page (placeholder if empty)
            thermalPagesCount = 1;
        }
        const totalPages = 7 + thermalPagesCount;
        let browser;
        try {
            const launchOptions = {
                headless: "new",
                timeout: 60000,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };
            if (process.versions.electron) {
                const exePath = path.join(process.resourcesPath, 'chromium', 'chrome.exe');
                if (fs.existsSync(exePath)) launchOptions.executablePath = exePath;
            }
            browser = await puppeteer.launch(launchOptions);
        } catch (err) {
            throw new Error("Không thể chạy trình duyệt in PDF: " + err.message);
        }
        
        const page = await browser.newPage();
        let logoBase64 = null;
        try {
            const logoPath = path.join(__dirname, '../../../public/assets/cas_full_logo.png');
            if (fs.existsSync(logoPath)) logoBase64 = fs.readFileSync(logoPath).toString('base64');
        } catch (e) {}

        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&display=swap');
            @page { size: A4; margin: 0; }
            * { box-sizing: border-box; }
            body { font-family: 'Noto Serif', 'Times New Roman', 'Liberation Serif', Times, serif; padding: 0; margin: 0; color: #000; font-size: 10pt; line-height: 1.3; }
            
            .report-page { 
                position: relative; 
                width: 210mm; 
                height: 297mm; 
                page-break-after: always; 
                padding: 15mm 20mm 20mm 20mm; 
                overflow: hidden;
            }
            
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 150pt; color: rgba(0, 86, 179, 0.1); z-index: -1; pointer-events: none; font-weight: bold; }
            .watermark-img { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: -1; width: 500px; }

            .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #0056b3; padding-bottom: 5px; margin-bottom: 10px; width: 100%; }
            .logo-section img { max-height: 45px; }
            .company-info { text-align: right; font-size: 7.2pt; color: #444; line-height: 1.2; opacity: 0.5; }
            
            .title-main { text-align: center; font-weight: bold; font-size: 15pt; color: #000; margin: 5px 0 2px 0; text-transform: uppercase; }
            .title-sub { text-align: center; font-style: italic; font-size: 9pt; margin-bottom: 15px; color: #333; }
            
            .section-header { border-top: 1.5px solid #cc0000; padding-top: 8px; color: #cc0000; font-weight: bold; margin-top: 25px; margin-bottom: 8px; font-size: 11pt; }
            .section-title { font-weight: bold; color: #002d5a; margin-top: 8px; margin-bottom: 5px; font-size: 10pt; }
            
            .info-table { width: 100%; border: none; margin-bottom: 8px; }
            .info-table td { border: none; padding: 2px 0; vertical-align: top; }
            .info-label { font-weight: bold; width: 180px; }
            .info-sublabel { font-size: 8pt; font-style: italic; color: #555; display: block; margin-top: -2px; font-weight: normal; }
            .info-value { font-weight: normal; border-bottom: 1px dotted #ccc; flex-grow: 1; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8.5pt; }
            table, th, td { border: 1px solid #333; }
            th { background: #f2f2f2; padding: 4px; text-align: center; font-weight: bold; }
            td { padding: 4px; vertical-align: middle; }
            .bg-gray { background: #f9f9f9; font-weight: bold; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; font-weight: normal; }

            .checkbox-container { display: flex; justify-content: center; align-items: center; }
            .checkbox { width: 14px; height: 14px; border: 1px solid #000; position: relative; display: inline-block; }
            .checkbox.checked::after { content: '✓'; position: absolute; top: -4px; left: 1px; font-weight: bold; font-size: 12pt; color: #000; }

            .sig-table { width: 100%; border: 1.5px solid #333; margin-top: 10px; table-layout: fixed; }
            .sig-table th { background: #f2f2f2; border-bottom: 1.5px solid #333; padding: 6px; font-size: 9pt; height: 40px; }
            .sig-table td { padding: 8px; vertical-align: top; height: 220px; border-right: 1.5px solid #333; }
            .sig-table td:last-child { border-right: none; }
            .sig-field { margin-top: 10px; font-size: 8.5pt; border-bottom: 1px solid #333; padding-bottom: 2px; }
            .sig-stamp { margin-top: 20px; text-align: center; font-style: italic; color: #666; font-size: 8pt; }

            .footer { 
                position: absolute; 
                bottom: 7mm; 
                left: 20mm;
                right: 20mm;
                text-align: center; 
                font-size: 8pt; 
                color: #666; 
                border-top: 0.5px solid #ccc; 
                padding-top: 3px; 
            }
            
            .tool-img { max-height: 85px; max-width: 140px; display: block; margin: 0 auto; }
            
            .thermal-block { margin-bottom: 12px; page-break-inside: avoid; }
            .marker-text { position: absolute; transform: translate(-50%, -50%); padding: 1px 3px; border-radius: 2px; font-size: 6.5pt; font-weight: bold; color: white; border: 1px solid white; box-shadow: 0px 0px 2px rgba(0,0,0,0.8); z-index: 10; font-family: 'Segoe UI', Arial, sans-serif; pointer-events: none;}
            .marker-hot { background-color: #ef4444; }
            .marker-cold { background-color: #3b82f6; }
            .marker-center { background-color: #22c55e; }
        `;

        let html = `<html><head><meta charset="UTF-8"><style>${styles}</style></head><body>`;

        // PAGE 1: Intro & Equipment
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="title-main">${reportTitle}</div>
            <div class="title-sub">Solar Rooftop System – Inspection, Maintenance & Overhaul Report</div>
            
            <div class="section-header">1. Thông tin / Information</div>
            <table class="info-table">
                <tr><td class="info-label">Khách hàng<br/><span class="info-sublabel">Customers:</span></td><td class="info-value">${omData.projectInfo.customer}</td></tr>
                <tr><td class="info-label">Dự án<br/><span class="info-sublabel">Project:</span></td><td class="info-value">${omData.projectInfo.projectName}</td></tr>
                <tr><td class="info-label">Địa chỉ dự án<br/><span class="info-sublabel">Inspection location:</span></td><td class="info-value">${omData.projectInfo.location}</td></tr>
                <tr><td class="info-label">Đơn vị thực hiện<br/><span class="info-sublabel">Inspection company:</span></td><td class="info-value">${omData.projectInfo.inspectionCompany}</td></tr>
                <tr><td class="info-label">Ngày thực hiện<br/><span class="info-sublabel">Date of inspection:</span></td><td class="info-value">${omData.projectInfo.inspectionDate}</td></tr>
                <tr><td class="info-label">Công suất lắp đặt<br/><span class="info-sublabel">Installed capacity:</span></td><td class="info-value">${omData.projectInfo.capacity ? omData.projectInfo.capacity + ' kWp' : ''}</td></tr>
                <tr><td class="info-label">Ngày vận hành/COD<br/><span class="info-sublabel">COD Date:</span></td><td class="info-value">${omData.projectInfo.codDate || ''}</td></tr>
                <tr><td class="info-label">Lần kiểm tra<br/><span class="info-sublabel">Inspection no.:</span></td><td class="info-value">${omData.projectInfo.inspectionNo}</td></tr>
                <tr><td class="info-label">Kỹ thuật viên<br/><span class="info-sublabel">Technician:</span></td><td class="info-value">${omData.projectInfo.technicians}</td></tr>
            </table>

            <div class="section-header">2. Thiết bị sử dụng / Equipment Used</div>
            <table>
                <tr>
                    <th style="width: 25%;">Tên thiết bị / <span class="italic">Equipment</span></th>
                    <th style="width: 35%;">Hình ảnh / <span class="italic">Photo</span></th>
                    <th style="width: 40%;">Chức năng / <span class="italic">Function</span></th>
                </tr>
                ${(omData.equipmentUsed || []).map(e => `
                    <tr>
                        <td class="text-center font-bold">${e.name}</td>
                        <td>${this._renderToolPhoto(e.photo)}</td>
                        <td class="text-center">${e.function}</td>
                    </tr>
                `).join('')}
            </table>
            ${this._renderFooter(1, totalPages)}
        </div>`;

        // PAGE 2: PV System specs & checklist
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="section-header">3. Hệ thống tấm pin năng lượng mặt trời / PV Panel System</div>
            <div class="section-title">Thông số kỹ thuật / <span class="italic">Specifications</span></div>
            <table>
                <tr><td class="bg-gray">Hãng sản xuất / <span class="italic">Manufacturer</span></td><td class="text-center">${omData.pvSystem.specs.manufacturer}</td><td class="bg-gray">Số lượng tấm / <span class="italic">Panel qty</span></td><td class="text-center">${omData.pvSystem.specs.panelQty}</td></tr>
                <tr><td class="bg-gray">Model tấm pin / <span class="italic">Panel model</span></td><td class="text-center font-bold">${omData.pvSystem.specs.panelModel}</td><td class="bg-gray">Công suất / <span class="italic">Capacity (Wp)</span></td><td class="text-center font-bold">${omData.pvSystem.specs.capacity}</td></tr>
                <tr><td class="bg-gray">Ngày lắp đặt / <span class="italic">Install date</span></td><td class="text-center">${omData.pvSystem.specs.installDate || ''}</td><td class="bg-gray">Bảo hành / <span class="italic">Warranty</span></td><td class="text-center">${omData.pvSystem.specs.warranty || ''}</td></tr>
            </table>
            
            <div class="section-title">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <div class="font-bold" style="margin-bottom: 5px;">Kiểm tra bên ngoài <span class="italic">(External visual inspection)</span></div>
            <table>
                <tr>
                    <th style="width: 45%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 12%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 12%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 31%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${(omData.pvSystem.checklist || []).map(c => `
                    <tr>
                        <td>${c.item.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center">${this._renderCheck(c.status === 'OK')}</td>
                        <td class="text-center">${this._renderCheck(c.status !== 'OK')}</td>
                        <td>${c.remarks || ''}</td>
                    </tr>
                `).join('')}
            </table>

            <div class="font-bold" style="margin-top: 10px; margin-bottom: 5px;">Kiểm tra nhiệt độ <span class="italic">(Thermal imaging check)</span></div>
            <table>
                <tr>
                    <th style="width: 45%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 12%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 12%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 31%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${(omData.pvSystem.thermalCheck || []).map(c => `
                    <tr>
                        <td>${c.item.replace('\n', '<br/>')}</td>
                        <td class="text-center">${this._renderCheck(c.status === 'OK')}</td>
                        <td class="text-center">${this._renderCheck(c.status !== 'OK')}</td>
                        <td>${c.remarks || ''}</td>
                    </tr>
                `).join('')}
            </table>
            <div class="font-bold" style="margin-top: 15px; margin-bottom: 5px;">Điện trở cách điện chuỗi pin <span class="italic">(String insulation resistance test (MΩ))</span></div>
            <div style="font-size: 8.5pt; color: #333; margin-bottom: 10px; line-height: 1.5;">
                <span style="color: #cc0000;">▸</span> Tiêu chuẩn / Standard: IEC 62446 – ≥ 1 MΩ @ 1000 VDC<br/>
                <span style="color: #cc0000;">▸</span> Off Inverter tại app và off Switch DC trước khi đo.
            </div>
            <table class="text-center">
                <tr>
                    <th style="width: 15%;">String</th>
                    <th style="width: 12%;">Số tấm / <span class="italic">Qty</span></th>
                    <th style="width: 12%;">Voc (V)</th>
                    <th style="width: 18%;">IR (+) (MΩ)</th>
                    <th style="width: 18%;">IR (-) (MΩ)</th>
                    <th style="width: 15%;">Đánh giá <span class="italic">Evaluation</span></th>
                    <th style="width: 10%;">Ghi chú <span class="italic">Remarks</span></th>
                </tr>
                ${(omData.pvSystem.insulationResistance || []).map(t => `
                <tr>
                    <td>${t.string || '-'}</td>
                    <td>${t.panelQty || '-'}</td>
                    <td>${t.voc || '-'}</td>
                    <td>${t.irPlus || '-'}</td>
                    <td>${t.irMinus || '-'}</td>
                    <td class="font-bold">${t.evaluation || '-'}</td>
                    <td>${t.remarks || ''}</td>
                </tr>`).join('')}
            </table>

            <div style="margin-top: 15px;">
                <div class="section-header">4. Khung giá đỡ hệ thống pin năng lượng mặt trời / <span class="italic">PV Mounting Structure</span></div>
                <div class="section-title">Thông số kỹ thuật / <span class="italic">Specifications</span></div>
                <table>
                    <tr>
                        <td class="bg-gray font-bold" style="width: 25%;">Loại kết cấu / <span class="italic">Structure type</span></td>
                        <td style="width: 25%; font-weight: bold;">${omData.mountingStructure.specs.type}</td>
                        <td class="bg-gray font-bold" style="width: 25%;">Chất liệu / <span class="italic">Material</span></td>
                        <td style="width: 25%; font-weight: bold;">${omData.mountingStructure.specs.material}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Năm lắp đặt / <span class="italic">Install year</span></td>
                        <td>${omData.mountingStructure.specs.installYear}</td>
                        <td class="bg-gray font-bold">Tình trạng tổng thể / <span class="italic">Overall condition</span></td>
                        <td style="font-weight: bold;">${omData.mountingStructure.specs.overallCondition}</td>
                    </tr>
                </table>
            </div>
            ${this._renderFooter(2, totalPages)}
        </div>`;

        // PAGE 3: PV Mounting Checklist & Solar AC Cabinet
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="section-title">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <div class="font-bold" style="margin-bottom: 5px;">Kiểm tra bên ngoài & cơ khí <span class="italic">(Visual & mechanical inspection)</span></div>
            <table>
                <tr>
                    <th style="width: 45%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 12%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 12%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 31%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${(omData.mountingStructure.checklist || []).map(c => `
                    <tr>
                        <td>${c.item.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center">${this._renderCheck(c.status === 'OK' || c.status === 'Đạt')}</td>
                        <td class="text-center">${this._renderCheck(c.status !== 'OK' && c.status !== 'Đạt')}</td>
                        <td>${c.remarks || ''}</td>
                    </tr>
                `).join('')}
            </table>

            <div style="margin-top: 15px;">
                <div class="section-header">5. Tủ điện AC Solar / <span class="italic">Solar AC Cabinet</span></div>
                <div class="section-title">Thông số / <span class="italic">Specifications</span></div>
                <table>
                    <tr>
                        <td class="bg-gray font-bold" style="width: 25%;">Hãng sản xuất / <span class="italic">Manufacturer</span></td>
                        <td class="text-center font-bold" style="width: 25%;">${omData.acCabinet.specs.manufacturer}</td>
                        <td class="bg-gray font-bold" style="width: 25%;">Model</td>
                        <td class="text-center font-bold" style="width: 25%;">${omData.acCabinet.specs.model}</td>
                    </tr>
                    <tr>
                        <td class="bg-gray font-bold">Số CB / <span class="italic">CB Qty</span></td>
                        <td class="text-center">${omData.acCabinet.specs.cbQty}</td>
                        <td class="bg-gray font-bold">Chỉ số IP / <span class="italic">IP Rating</span></td>
                        <td class="text-center">${omData.acCabinet.specs.ipRating}</td>
                    </tr>
                </table>
                
                <div class="font-bold" style="margin-top: 10px; margin-bottom: 5px;">Kiểm tra khi có điện <span class="italic">(Energized inspection)</span></div>
                <table>
                    <tr>
                        <th style="width: 45%;">Hạng mục / <span class="italic">Inspection item</span></th>
                        <th style="width: 12%;">Đạt <br/><span class="italic">(OK)</span></th>
                        <th style="width: 12%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                        <th style="width: 31%;">Ghi chú / <span class="italic">Remarks</span></th>
                    </tr>
                    ${(omData.acCabinet.energizedCheck || []).map((c, i) => `
                        <tr>
                            <td>${c.item.replace(/\n/g, '<br/>')}</td>
                            <td class="text-center">${this._renderCheck(c.status === 'OK' || c.status === 'Đạt')}</td>
                            <td class="text-center">${this._renderCheck(c.status !== 'OK' && c.status !== 'Đạt')}</td>
                            <td>${c.remarks || ''}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            ${this._renderFooter(3, totalPages)}
        </div>`;

        // PAGE 4: Inverter
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="font-bold" style="margin-top: 5px; margin-bottom: 5px;">Kiểm tra khi không có điện <span class="italic">(De-energized inspection)</span></div>
            <table>
                <tr>
                    <th style="width: 45%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 12%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 12%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 31%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${(omData.acCabinet.deEnergizedCheck || []).map((c, i) => `
                    <tr>
                        <td>${c.item.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center">${this._renderCheck(c.status === 'OK' || c.status === 'Đạt')}</td>
                        <td class="text-center">${this._renderCheck(c.status !== 'OK' && c.status !== 'Đạt')}</td>
                        <td>${c.remarks || ''}</td>
                    </tr>
                `).join('')}
            </table>

            <div class="section-header" style="margin-top: 20px;">6. Biến tần / Inverter</div>
            <div class="section-title">Thông số kỹ thuật / <span class="italic">Specifications</span></div>
            <table>
                <tr>
                    <td class="bg-gray font-bold" style="width: 25%;">Hãng sản xuất / <span class="italic">Manufacturer</span></td>
                    <td style="width: 25%; font-weight: bold;">${omData.inverter.specs.manufacturer}</td>
                    <td class="bg-gray font-bold" style="width: 25%;">Model / Series</td>
                    <td style="width: 25%; font-weight: bold;">${omData.inverter.specs.model}</td>
                </tr>
                <tr>
                    <td class="bg-gray font-bold">Công suất danh định / <span class="italic">Rated power (kW)</span></td>
                    <td>${omData.inverter.specs.power}</td>
                    <td class="bg-gray font-bold">Số lượng / <span class="italic">Quantity</span></td>
                    <td>${omData.inverter.specs.qty}</td>
                </tr>
                <tr>
                    <td class="bg-gray font-bold">Firmware version</td>
                    <td>${omData.inverter.specs.firmware || ''}</td>
                    <td class="bg-gray font-bold">Ngày cài đặt / <span class="italic">Install date</span></td>
                    <td>${omData.inverter.specs.installDate}</td>
                </tr>
            </table>

            <div class="section-title" style="margin-top: 20px;">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 55%;">Hạng mục / <span class="italic">Inspection item</span></th>
                        <th style="width: 15%;">Đạt <br/><span class="italic">(OK)</span></th>
                        <th style="width: 15%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                        <th style="width: 15%;">Ghi chú / <span class="italic">Remarks</span></th>
                    </tr>
                </thead>
                ${omData.inverter.checklist.map((c, i) => `
                    <tr>
                        <td>${c.item.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center">${this._renderCheck(c.status === 'OK' || c.status === 'Đạt')}</td>
                        <td class="text-center">${this._renderCheck(c.status !== 'OK' && c.status !== 'Đạt')}</td>
                        <td>${c.remarks || ''}</td>
                    </tr>
                `).join('')}
            </table>
            ${this._renderFooter(4, totalPages)}
        </div>`;

        // PAGE 6: Others (Section 7, 8, 9)
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="section-header">7. Khung giá đỡ Tủ AC / Inverter / AC Cabinet & Inverter Mounting Frame</div>
            <div class="section-title">Thông số kỹ thuật / <span class="italic">Specifications</span></div>
            <table>
                <tr>
                    <td class="font-bold bg-gray" style="width: 30%;">Loại kết cấu / <span class="italic">Structure type</span></td>
                    <td style="width: 30%;">${omData.others.mountingFrame.specs.type}</td>
                    <td class="font-bold bg-gray" style="width: 20%;">Chất liệu / <span class="italic">Material</span></td>
                    <td style="width: 20%;">${omData.others.mountingFrame.specs.material}</td>
                </tr>
            </table>

            <div class="section-title">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <table>
                <tr>
                    <th style="width: 55%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 15%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 15%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 15%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${omData.others.mountingFrame.checklist.map(c => `
                <tr>
                    <td>${c.item.replace(/\n/g, '<br/>')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Đạt' || c.status === 'OK')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Không Đạt' || c.status === 'Not OK')}</td>
                    <td>${c.remarks || ''}</td>
                </tr>
                `).join('')}
            </table>

            <div class="section-header">8. Máng cáp & Ống ruột gà (AC / DC) / Cable Tray & Conduit (AC / DC)</div>
            <div class="section-title">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <table>
                <tr>
                    <th style="width: 55%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 15%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 15%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 15%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${omData.others.cableTray.map(c => `
                <tr>
                    <td>${c.item.replace(/\n/g, '<br/>')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Đạt' || c.status === 'OK')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Không Đạt' || c.status === 'Not OK')}</td>
                    <td>${c.remarks || ''}</td>
                </tr>
                `).join('')}
            </table>


            <div class="section-header">9. Kết cấu mái nhà / Roof Structure</div>
            <div class="section-title">Hạng mục kiểm tra / <span class="italic">Inspection Items</span></div>
            <table>
                <tr>
                    <th style="width: 55%;">Hạng mục / <span class="italic">Inspection item</span></th>
                    <th style="width: 15%;">Đạt <br/><span class="italic">(OK)</span></th>
                    <th style="width: 15%;">Không đạt <br/><span class="italic">(Not Ok)</span></th>
                    <th style="width: 15%;">Ghi chú / <span class="italic">Remarks</span></th>
                </tr>
                ${omData.others.roofStructure.map(c => `
                <tr>
                    <td>${c.item.replace(/\n/g, '<br/>')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Đạt' || c.status === 'OK' || c.status === 'Không Có')}</td>
                    <td class="text-center">${this._renderCheck(c.status === 'Không Đạt' || c.status === 'Not OK')}</td>
                    <td>${c.remarks || ''}</td>
                </tr>
                `).join('')}
            </table>

            <div class="section-header" style="margin-top: 20px;">10. Kết quả kiểm tra nhiệt ảnh / <span class="italic">Thermal Imaging Results</span></div>
            <div style="font-size: 9pt; color: #333; margin-bottom: 5px; line-height: 1.6;">
                <span style="color: #cc0000;">▸</span> <strong>Thiết bị:</strong> Testo 871  |  <strong>Emissivity:</strong> 0.95  |  <strong>Nhiệt độ phản chiếu:</strong> 20°C<br/>
                <span style="color: #cc0000;">▸</span> <strong>Tiêu chuẩn:</strong> điểm đấu nối ≤ 65°C;  ΔT > 5°C → Warning;  ΔT > 10°C → Critical
            </div>

            ${this._renderFooter(5, totalPages)}
        </div>`;

        // PAGE 7+: Thermal Analysis Pages (Section 10)
        if (thermalDataList && thermalDataList.length > 0) {
            if (thermalDataList[0].items) {
                html += this._renderThermalPages(thermalDataList, logoBase64, 6, totalPages);
            } else {
                let startPage = 6;
                thermalDataList.forEach((item, idx) => {
                    html += this._renderThermalPage(item, logoBase64, startPage + idx, totalPages);
                });
            }
        } else {
            // Render Placeholder for Section 10
            html += `<div class="report-page">
                ${this._renderHeader(logoBase64)}
                ${this._renderWatermark(logoBase64)}
                <div style="margin-top: 100px; text-align: center; color: #666; font-style: italic; font-size: 11pt;">
                    Không có dữ liệu ảnh nhiệt / No thermal imaging data
                </div>
                ${this._renderFooter(6, totalPages)}
            </div>`;
        }

        // PAGE: Earth Resistance & Summary (Section 11 & 12)
        const earthResPage = 6 + thermalPagesCount;
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="section-header">11. Kết quả đo điện trở nối đất / Earth Resistance Test Results</div>
            <div style="font-size: 8.5pt; color: #333; margin-bottom: 10px; line-height: 1.5;">
                <span style="color: #cc0000;">▸</span> Tiêu chuẩn / Standard: IEC 60364 – ≤ 4 Ω<br/>
                <span style="color: #cc0000;">▸</span> Thiết bị đo / Equipment: Kyoritsu 4105A – Earth tester
            </div>
            <table>
                <tr>
                    <th style="width: 40%;">Điểm đo / <span class="italic">Measurement Point</span></th>
                    <th style="width: 15%;">Tiêu chuẩn / <span class="italic">Standard</span></th>
                    <th style="width: 15%;">Giá trị đo / <span class="italic">Value (Ω)</span></th>
                    <th style="width: 15%;">Đánh giá / <span class="italic">Evaluation</span></th>
                </tr>
                ${omData.earthResistance.map(r => `
                    <tr>
                        <td>${r.point.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center">${r.standard}</td>
                        <td class="text-center font-bold">${r.value}</td>
                        <td class="text-center font-bold" style="color: ${r.evaluation === 'OK' ? '#15803d' : '#ef4444'};">${r.evaluation}</td>
                    </tr>
                `).join('')}
            </table>

            <div class="section-header" style="margin-top: 20px;">12. Tổng hợp kết quả kiểm tra / Inspection Summary</div>
            <table>
                <tr>
                    <th style="width: 30%;">Hạng mục / <span class="italic">Module</span></th>
                    <th style="width: 15%;">Mức độ / <span class="italic">Severity</span></th>
                    <th style="width: 25%;">Mô tả sự cố / <span class="italic">Description</span></th>
                    <th style="width: 30%;">Hành động / <span class="italic">Action Required</span></th>
                </tr>
                ${omData.summary.map(s => `
                    <tr>
                        <td>${s.module.replace(/\n/g, '<br/>')}</td>
                        <td class="text-center" style="color: ${s.severity === 'Cao' ? '#ef4444' : s.severity === 'Trung bình' ? '#f59e0b' : '#15803d'}; font-weight: bold;">${s.severity}</td>
                        <td class="text-center">${s.description}</td>
                        <td>${s.action || '-'}</td>
                    </tr>
                `).join('')}
            </table>

            <div style="margin-top: 20px; padding: 10px; border: 1.5px solid #0056b3; background: #f4f9ff; border-radius: 6px;">
                <div style="font-weight: bold; font-size: 10pt; color: #0056b3; margin-bottom: 5px;">Nhận xét tổng quan / <span class="italic">Overall Comments:</span></div>
                <div style="font-size: 9.5pt; color: #333; line-height: 1.5; min-height: 35px;">${omData.overallComments || 'Hệ thống hoạt động bình thường – Tiếp tục vận hành.'}</div>
            </div>

            ${this._renderFooter(earthResPage, totalPages)}
        </div>`;

        // PAGE: Sign-off & Confirmation (Section 13)
        const sigPage = earthResPage + 1;
        html += `<div class="report-page">
            ${this._renderHeader(logoBase64)}
            ${this._renderWatermark(logoBase64)}
            <div class="section-header">13. Ký & Xuất Báo Cáo / <span class="italic">Sign-off & Confirmation</span></div>
            
            <table class="sig-table">
                <tr>
                    <th style="width: 50%;">KỸ THUẬT VIÊN THỰC HIỆN /<br/><span class="italic">INSPECTION TECHNICIAN</span></th>
                    <th style="width: 50%;">KHÁCH HÀNG / ĐẠI DIỆN CLIENT /<br/><span class="italic">REPRESENTATIVE</span></th>
                </tr>
                <tr>
                    <td>
                        <div class="sig-field">Họ tên / <span class="italic">Full Name</span>: ${omData.technicianName || ''}</div>
                        <div class="sig-field">Chức vụ / <span class="italic">Position</span>: ${omData.technicianPosition || ''}</div>
                        <div class="sig-field">Ngày / <span class="italic">Date</span>:</div>
                        <div class="sig-stamp">
                            ${omData.technicianSignature ? `<img src="${omData.technicianSignature}" style="max-height: 80px; max-width: 200px; display: block; margin: 0 auto 5px auto;">` : ''}
                            [Chữ ký & Đóng dấu / <span class="italic">Signature & Stamp</span>]
                        </div>
                    </td>
                    <td>
                        <div class="sig-field">Họ tên / <span class="italic">Full Name</span>: ${omData.clientName || ''}</div>
                        <div class="sig-field">Chức vụ / <span class="italic">Position</span>: ${omData.clientPosition || ''}</div>
                        <div class="sig-field">Ngày / <span class="italic">Date</span>:</div>
                        <div class="sig-stamp">
                            ${omData.clientSignature ? `<img src="${omData.clientSignature}" style="max-height: 80px; max-width: 200px; display: block; margin: 0 auto 5px auto;">` : ''}
                            [Chữ ký / <span class="italic">Signature</span>]
                        </div>
                    </td>
                </tr>
            </table>

            <div style="text-align: center; margin-top: 40px; font-weight: bold; color: #444; font-size: 10pt;">
                — HẾT BIÊN BẢN / <span class="italic">END OF REPORT</span> —
            </div>

            ${this._renderFooter(sigPage, totalPages)}
        </div>`;

        html += `</body></html>`;

        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 90000 });
        await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
        await browser.close();
        return outputPath;
    }

    _renderThermalPages(thermalCats, logo, startPage, totalPages) {
        let html = '';
        let pageOffset = 0;

        thermalCats.forEach(cat => {
            let catItems = cat.items || [];
            let catRemarks = cat.remarks || 'Hệ thống hoạt động bình thường, tổn hao nhiệt tương đối thấp, không phát hiện rủi ro cháy nổ.';
            
            let chunks = [];
            for (let i = 0; i < catItems.length; i += 2) {
                chunks.push(catItems.slice(i, i + 2));
            }
            if (chunks.length === 0) {
                chunks.push([]); 
            }

            chunks.forEach((chunk, chunkIdx) => {
                let isLastChunkOfCat = (chunkIdx === chunks.length - 1);
                let pageNum = startPage + pageOffset;
                let titleSuffix = '';

                html += `<div class="report-page">
                    ${this._renderHeader(logo)}
                    ${this._renderWatermark(logo)}
                    
                    <div style="font-weight: bold; font-size: 13pt; color: #0056b3; border-bottom: 1.5px solid #0056b3; padding-bottom: 5px; margin-bottom: 15px; margin-top: 10px;">
                        ${cat.categoryTitle}${titleSuffix}
                    </div>
                `;

                chunk.forEach(item => {
                    let thermalImg = item.irBase64 || (item.thermalImagePath && fs.existsSync(item.thermalImagePath) ? fs.readFileSync(item.thermalImagePath).toString('base64') : null);
                    let realImg = item.realBase64 || (item.realImagePath && fs.existsSync(item.realImagePath) ? fs.readFileSync(item.realImagePath).toString('base64') : null);
                    
                    let renderBadge = (status) => {
                        let s = (status || 'NORMAL').toUpperCase();
                        let color = '#22c55e';
                        if (s === 'WARNING') color = '#f59e0b';
                        if (s === 'CRITICAL' || s === 'KHẨN') color = '#ef4444';
                        return `<span style="background: ${color}; color: white; padding: 1.5px 5px; border-radius: 3px; font-weight: bold; font-size: 6.5pt; display: inline-block;">${s}</span>`;
                    };

                    html += `
                    <div class="thermal-block">
                        <table style="width: 100%; font-size: 7.5pt; font-weight: bold; margin-bottom: 4px; border: none;">
                            <tr>
                                <td style="width: 15%; border: none; padding: 1px;">File:</td><td style="width: 35%; border: none; padding: 1px;">${item.filename}.BMT</td>
                                <td style="width: 15%; border: none; padding: 1px;">Date:</td><td style="width: 35%; text-align: right; border: none; padding: 1px;">${item.date || '2026-01-11'}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 1px;">Lens type:</td><td style="border: none; padding: 1px;">${item.lensType || '35° x 26°'}</td>
                                <td style="border: none; padding: 1px;">Time:</td><td style="text-align: right; border: none; padding: 1px;">${item.time || '12:00:00 PM'}</td>
                            </tr>
                        </table>

                        <div style="display: flex; margin-bottom: 6px; justify-content: space-between; align-items: stretch;">
                            <div style="width: 275px; border: 1px solid #777; height: 180px; background: #fff; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                ${thermalImg ? `<img src="data:image/jpeg;base64,${thermalImg}" style="width: 100%; height: 100%; object-fit: cover;" />
                                ${item.spots ? `
                                    <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; pointer-events: none;">
                                        <div class="marker-text marker-hot" style="left: ${item.spots.hot.x}%; top: ${item.spots.hot.y}%;">HS1</div>
                                        <div class="marker-text marker-cold" style="left: ${item.spots.cold.x}%; top: ${item.spots.cold.y}%;">CS1</div>
                                        <div class="marker-text marker-center" style="left: 50%; top: 50%;">M1</div>
                                    </div>
                                ` : ''}` : '<span style="color: #666; font-size: 8pt;">No Image</span>'}
                            </div>

                            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: 40px; padding: 1px 0;">
                                <span style="font-size: 7pt; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${item.maxTemp}°C</span>
                                <div style="flex: 1; width: 12px; background: linear-gradient(to bottom, #fff3b0, #ff9800, #f44336, #9c27b0, #3f51b5, #000000); border: 1px solid #555; margin: 2px 0; border-radius: 2px;"></div>
                                <span style="font-size: 7pt; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${item.minTemp}°C</span>
                            </div>

                            <div style="width: 275px; border: 1px solid #777; height: 180px; background: #fff; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                ${realImg ? `<img src="data:image/jpeg;base64,${realImg}" style="width: 100%; height: 100%; object-fit: cover;" />` : '<span style="color: #666; font-size: 8pt;">No Image</span>'}
                            </div>
                        </div>

                        <div style="font-weight: bold; font-size: 8.5pt; margin-bottom: 5px;">Thông số hình ảnh / <span style="font-style: italic; font-weight: normal; font-size: 8pt;">Picture parameters:</span></div>
                        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                            <div style="flex: 1;">
                                <table style="width: 100%; font-size: 7.5pt; font-weight: bold; border: none; margin: 0;">
                                    <tr><td style="width: 70%; border: none; padding: 1px;">Độ phát xạ / <span style="font-style: italic; font-weight: normal;">Emissivity:</span></td><td style="text-align: right; border: none; padding: 1px;">${item.emissivity || '0.95'}</td></tr>
                                    <tr><td style="border: none; padding: 1px;">Nhiệt độ phản chiếu / <span style="font-style: italic; font-weight: normal;">Refl. temp [°C]:</span></td><td style="text-align: right; border: none; padding: 1px;">${item.reflTemp || '20.0'}</td></tr>
                                    <tr><td style="border: none; padding: 1px;">Cường độ ánh sáng / <span style="font-style: italic; font-weight: normal;">Intensity [W/m2]:</span></td><td style="text-align: right; border: none; padding: 1px;">${item.intensity || '500'}</td></tr>
                                </table>
                            </div>
                            <div style="flex: 1;"></div>
                        </div>
                        
                        <table style="width: 100%; font-size: 7.5pt; border-collapse: collapse; text-align: center; border: 1.5px solid #000; font-family: 'Segoe UI', Arial, sans-serif;">
                            <tr style="background: #f0f0f0; font-weight: bold;">
                                <td style="padding: 4px; border: 1px solid #000; width: 35%;">Điểm đo / Spots</td>
                                <td style="border: 1px solid #000; width: 20%;">Nhiệt độ / Temperature<br/>[°C]</td>
                                <td style="border: 1px solid #000; width: 15%;">Độ phát xạ /<br/>Emissivity</td>
                                <td style="border: 1px solid #000; width: 20%;">Nhiệt độ phản chiếu /<br/>Refl. temp. [°C]</td>
                                <td style="border: 1px solid #000; width: 10%;">Trạng thái /<br/>Status</td>
                            </tr>
                            <tr>
                                <td style="text-align: left; padding: 4px; border: 1px solid #000; font-size: 7pt;">HS1 - Nhiệt độ cao nhất / <span style="font-style: italic;">Hottest Spot</span></td>
                                <td style="font-weight: bold; border: 1px solid #000;">${item.maxTemp || '-'}</td>
                                <td style="border: 1px solid #000;">${item.emissivity || '0.95'}</td>
                                <td style="border: 1px solid #000;">${item.reflTemp || '20.0'}</td>
                                <td style="border: 1px solid #000; padding: 4px;">${renderBadge(item.hs1Status)}</td>
                            </tr>
                            <tr>
                                <td style="text-align: left; padding: 4px; border: 1px solid #000; font-size: 7pt;">CS1 - Nhiệt độ thấp nhất / <span style="font-style: italic;">Coldest Spot</span></td>
                                <td style="font-weight: bold; border: 1px solid #000;">${item.minTemp || '-'}</td>
                                <td style="border: 1px solid #000;">${item.emissivity || '0.95'}</td>
                                <td style="border: 1px solid #000;">${item.reflTemp || '20.0'}</td>
                                <td style="border: 1px solid #000; padding: 4px;">${renderBadge(item.cs1Status)}</td>
                            </tr>
                            <tr>
                                <td style="text-align: left; padding: 4px; border: 1px solid #000; font-size: 7pt;">M1 - Nhiệt độ trung bình / <span style="font-style: italic;">Center Spot</span></td>
                                <td style="font-weight: bold; border: 1px solid #000;">${item.centerTemp || '-'}</td>
                                <td style="border: 1px solid #000;">${item.emissivity || '0.95'}</td>
                                <td style="border: 1px solid #000;">${item.reflTemp || '20.0'}</td>
                                <td style="border: 1px solid #000; padding: 4px;">${renderBadge(item.m1Status)}</td>
                            </tr>
                        </table>
                    </div>`;
                });

                if (isLastChunkOfCat) {
                    if (chunk.length === 2) {
                        // Close current page and start a new one for Remarks
                        html += `
                            ${this._renderFooter(pageNum, totalPages)}
                        </div>`;
                        pageOffset++;
                        pageNum = startPage + pageOffset;
                        html += `
                        <div class="report-page">
                            ${this._renderHeader(logo)}
                            ${this._renderWatermark(logo)}
                            <div style="font-weight: bold; font-size: 13pt; color: #0056b3; border-bottom: 1.5px solid #0056b3; padding-bottom: 5px; margin-bottom: 15px; margin-top: 10px;">
                                ${cat.categoryTitle} - Nhận xét / Remarks
                            </div>
                            <div style="margin-top: 20px; padding: 15px; border: 1.5px solid #0056b3; background: #f4f9ff; border-radius: 8px;">
                                <div style="font-weight: bold; font-size: 10pt; color: #0056b3; margin-bottom: 10px;">Đánh giá tổng quan mục ${cat.categoryTitle}:</div>
                                <div style="font-size: 9.5pt; color: #333; line-height: 1.6; font-style: italic;">"${catRemarks}"</div>
                            </div>
                            <div style="margin-top: 40px; font-size: 9pt; color: #666;">
                                <p>• Các vị trí có nhiệt độ bất thường đã được ghi nhận chi tiết trong bảng phân tích phía trên.</p>
                                <p>• Đề nghị theo dõi định kỳ và kiểm tra các điểm đấu nối nếu có cảnh báo (Warning/Critical).</p>
                            </div>
                        `;
                    } else {
                        html += `
                        <div style="margin-top: 20px; padding: 12px; border: 1px solid #0056b3; background: #f4f9ff; border-radius: 6px; page-break-inside: avoid;">
                            <div style="font-weight: bold; font-size: 9pt; color: #0056b3; margin-bottom: 5px;">Nhận xét / Remarks:</div>
                            <div style="font-size: 8.5pt; color: #333; line-height: 1.5; font-style: italic;">"${catRemarks}"</div>
                        </div>
                        `;
                    }
                }

                html += `
                    ${this._renderFooter(pageNum, totalPages)}
                </div>`;
                
                pageOffset++;
            });
        });

        return html;
    }

    _renderThermalPage(item, logo, pageNum, total) {
        let thermalImg = item.irBase64 || (item.thermalImagePath && fs.existsSync(item.thermalImagePath) ? fs.readFileSync(item.thermalImagePath).toString('base64') : null);
        let realImg = item.realBase64 || (item.realImagePath && fs.existsSync(item.realImagePath) ? fs.readFileSync(item.realImagePath).toString('base64') : null);
        const severityClass = (item.severity || 'Normal').toLowerCase();

        return `
        <div class="report-page">
            ${this._renderHeader(logo)}
            ${this._renderWatermark(logo)}
            <div class="section-title" style="margin-top: 10px;">Phân tích nhiệt / <span class="italic">Thermal analysis</span>: ${item.filename || 'Ảnh nhiệt'}</div>
            <table class="meta-table">
                <tr>
                    <td class="bg-gray" style="width: 15%;">File</td>
                    <td style="width: 35%;">${item.filename}.BMT</td>
                    <td class="bg-gray" style="width: 20%;">Trạng thái / <span class="italic">Status</span></td>
                    <td style="width: 30%; color: ${(['khẩn', 'critical'].includes((item.severity || '').toLowerCase())) ? '#cc0000' : (['quan trọng', 'warning'].includes((item.severity || '').toLowerCase())) ? '#f59e0b' : '#22c55e'};" class="font-bold uppercase">${item.severity || 'Normal'}</td>
                </tr>
                <tr>
                    <td class="bg-gray">Ngày / Date</td>
                    <td colspan="3">${item.createdAt || ''}</td>
                </tr>
            </table>

            <div class="thermal-container">
                <div class="img-box">
                    ${thermalImg ? `<img src="data:image/jpeg;base64,${thermalImg}"/>` : '<span>No Thermal Image</span>'}
                    ${item.spots ? `
                                    <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; aspect-ratio: 4/3; max-width: 100%; max-height: 100%; pointer-events: none;">
                                        <div class="marker-text marker-hot" style="left: ${item.spots.hot.x}%; top: ${item.spots.hot.y}%;">HS1</div>
                                        <div class="marker-text marker-cold" style="left: ${item.spots.cold.x}%; top: ${item.spots.cold.y}%;">CS1</div>
                                        <div class="marker-text marker-center" style="left: 50%; top: 50%;">M1</div>
                                    </div>
                    ` : ''}
                </div>
                <!-- Mini Scale -->
                <div style="width: 30px; background: linear-gradient(to top, blue, cyan, green, yellow, orange, red); border: 1px solid #333;"></div>
                <div class="img-box">
                    ${realImg ? `<img src="data:image/jpeg;base64,${realImg}"/>` : '<span>No Real Image</span>'}
                </div>
            </div>

            <table>
                <tr><th>Vị trí / Spot</th><th>Nhiệt độ / Temp (°C)</th><th>Đánh giá / Evaluation</th></tr>
                <tr><td>Hot Spot (HS1)</td><td class="text-center font-bold">${item.maxTemp}</td><td class="text-center italic">${item.severity || 'Normal'}</td></tr>
                <tr><td>Trung tâm (M1)</td><td class="text-center font-bold">${item.centerTemp}</td><td class="text-center">${item.m1Status || 'Normal'}</td></tr>
            </table>

            <div style="margin-top: 10px; padding: 10px; border: 1px solid #cc0000; border-radius: 4px;">
                <div class="font-bold">Kết luận & Đề xuất / Result & Recommendation:</div>
                <div style="margin-top: 5px;">${item.conclusion || 'Hệ thống hoạt động bình thường.'}</div>
                <div style="margin-top: 3px; font-style: italic;">${item.recommendation || '-'}</div>
            </div>
            ${this._renderFooter(pageNum, total)}
        </div>`;
    }

    _renderHeader(logoBase64) {
        return `
            <div class="header-container">
                <div class="logo-section">
                    ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" />` : '<span style="font-weight: bold; font-size: 12pt; color: #0056b3;">CAS</span>'}
                </div>
                <div class="company-info">
                    <span style="font-weight: bold; font-size: 8pt; color: #000;">CONTROL & AUTOMATION SOLUTIONS CO., LTD.</span><br/>
                    Factory: Lot C3, Road No. 2, Hoa Cam Industrial Zone, Danang<br/>
                    Office: 8th Floor, Petrolimex Building, 122 September 2nd Street, Danang<br/>
                    Phone: (+84) 236 3675 666 | www.cas-energy.com
                </div>
            </div>`;
    }

    _renderWatermark(logoBase64) {
        if (logoBase64) {
            return `<img class="watermark-img" src="data:image/png;base64,${logoBase64}" />`;
        }
        return `<div class="watermark">CAS</div>`;
    }

    _renderCheck(checked) {
        return `<div class="checkbox-container"><div class="checkbox${checked ? ' checked' : ''}"></div></div>`;
    }

    _renderFooter(pageNum, totalPages) {
        return `<div class="footer">CAS Energy Solutions – Báo cáo kiểm tra bảo trì | Trang ${pageNum}/${totalPages}</div>`;
    }

    _renderToolPhoto(photoPath) {
        if (!photoPath) return '<span style="color: #999; font-size: 8pt;">No photo</span>';
        try {
            if (photoPath.startsWith('data:')) {
                return `<img class="tool-img" src="${photoPath}" />`;
            }
            const fs = require('fs');
            if (fs.existsSync(photoPath)) {
                const base64 = fs.readFileSync(photoPath).toString('base64');
                const ext = photoPath.split('.').pop().toLowerCase();
                const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
                return `<img class="tool-img" src="data:${mime};base64,${base64}" />`;
            }
        } catch (e) {}
        return '<span style="color: #999; font-size: 8pt;">No photo</span>';
    }
}

module.exports = PuppeteerReportService;
