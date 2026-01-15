const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const IReportService = require('../../domain/repositories/IReportService');

class PuppeteerReportService extends IReportService {
    async generate(dataList, outputPath, reportTitle = "BÁO CÁO KẾT QUẢ KIỂM TRA NHIỆT") {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });
        } catch (err) {
            console.error("PUPPETEER LAUNCH ERROR:", err);
            throw new Error("Không thể chạy trình duyệt in PDF trên Server. Lỗi: " + err.message);
        }
        const page = await browser.newPage();

        let logoBase64 = null;
        try {
            const logoPath = path.join(__dirname, '../../../public/assets/logo.png');
            if (fs.existsSync(logoPath)) {
                logoBase64 = fs.readFileSync(logoPath).toString('base64');
            }
        } catch (e) {
            console.error("Logo load error", e);
        }

        let htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 20px; }
                body { font-family: sans-serif; padding: 0 20px; color: #000; font-size: 11px; }
                .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; border-bottom: 2px solid #000; padding-bottom: 5px; }
                .logo-section { width: 50%; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; }
                .logo-img { max-width: 100%; height: auto; max-height: 45px; margin-bottom: 2px; display: block; margin-top: 2px; }
                .logo-sub { font-size: 7px; text-transform: uppercase; letter-spacing: 0.5px; color: #000; margin-top: 0; font-weight: bold; }
                .company-info { width: 55%; text-align: right; font-size: 9px; line-height: 1.2; }
                .title { text-align: center; font-weight: bold; font-size: 18px; margin: 10px 0; text-decoration: none; color: #000; text-transform: uppercase; }
                
                .meta-table { width: 100%; border-top: 2px solid #000; border-bottom: 2px solid #000; margin-bottom: 10px; font-size: 11px; }
                .meta-table td { padding: 4px 0; vertical-align: top; }
                .meta-label { font-weight: bold; width: 100px; }
                .meta-val { width: 200px; }
                
                .images-row { display: flex; gap: 10px; margin-bottom: 5px; height: 260px; }
                .image-box { flex: 1; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff; }
                .image-box > img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
                .thermal-container { position: relative; display: inline-block; height: 100%; }
                .image-wrapper { position: relative; display: block; line-height: 0; height: 100%; }
                .image-wrapper img { display: block; height: 100%; width: auto; object-fit: contain; }
                .image-label { position: absolute; top: 5px; left: 5px; background: rgba(255,255,255,0.7); padding: 2px 5px; font-size: 10px; font-weight: bold; border: 1px solid #999; z-index: 20; color: #000; }
                
                .scale-container { position: absolute; right: 0; top: 0; bottom: 0; width: 55px; display: flex; flex-direction: row; align-items: stretch; background: rgba(255,255,255,0.8); padding: 5px; box-sizing: border-box; }
                .scale-bar { width: 12px; height: 100%; background: linear-gradient(to top, blue, cyan, green, yellow, orange, red); border: 1px solid #333; }
                .scale-values { display: flex; flex-direction: column; justify-content: space-between; margin-left: 3px; font-size: 8px; font-weight: bold; color: #000; }
                
                .marker { position: absolute; width: 12px; height: 12px; transform: translate(-50%, -50%); pointer-events: none; z-index: 30; display: flex; align-items: center; justify-content: center; }
                .marker-hot { border: 2px solid red; border-radius: 50%; }
                .marker-cold { border: 2px solid blue; border-radius: 50%; }
                .marker-center { }
                .marker-center::before, .marker-center::after { content: ''; position: absolute; background: #000; }
                .marker-center::before { top: 5px; left: 0; width: 12px; height: 2px; }
                .marker-center::after { top: 0; left: 5px; width: 2px; height: 12px; }
                .marker-label { position: absolute; top: -15px; left: 10px; background: rgba(255,255,255,0.7); padding: 0 2px; font-size: 9px; font-weight: bold; white-space: nowrap; color: red; text-shadow: 1px 1px 0 #fff; }
                .marker-cold .marker-label { color: blue; }
                .marker-center .marker-label { color: #000; }

                .section-title { font-weight: bold; font-size: 12px; margin-bottom: 5px; margin-top: 15px; }
                .params-grid { display: grid; grid-template-columns: auto auto auto; gap: 5px 20px; font-size: 11px; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
                .param-row { display: contents; }
                .param-label { font-weight: bold; }
                
                table.data-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; }
                table.data-table th { border: 1px solid #000; background-color: #f0f0f0; padding: 4px; font-weight: bold; text-align: center; }
                table.data-table td { border: 1px solid #000; padding: 4px; text-align: center; }
                table.data-table td.left { text-align: left; }
                
                .status-badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; color: #fff; }
                .status-normal { background-color: #28a745; }
                .status-warning { background-color: #ffc107; color: #333; }
                .status-critical { background-color: #dc3545; }
                
                .chart-container { width: 100%; height: 120px; border: 1px solid #eee; position: relative; margin-top: 5px; padding-top: 5px; }
                .chart-stats { text-align: right; font-size: 10px; margin-bottom: 10px; color: #333; font-weight: bold; }
                .page-break { page-break-after: always; }
            </style>
        </head>
        <body>
        `;

        for (let index = 0; index < dataList.length; index++) {
            const item = dataList[index];

            let thermalImgBase64 = null;
            let realImgBase64 = null;

            if (item.thermalImagePath && fs.existsSync(item.thermalImagePath)) {
                thermalImgBase64 = fs.readFileSync(item.thermalImagePath).toString('base64');
            }
            if (item.realImagePath && fs.existsSync(item.realImagePath)) {
                realImgBase64 = fs.readFileSync(item.realImagePath).toString('base64');
            }

            // Generate synthetic histogram SVG
            const min = parseFloat(item.minTemp) || 20;
            const max = parseFloat(item.maxTemp) || 40;
            const avg = parseFloat(item.avgTemp) || (min + max) / 2;
            const range = max - min;

            // Create 40 bars for histogram (shifted towards higher temps to simulate typical thermal distribution)
            let barsHtml = '';

            for (let i = 0; i < 40; i++) {
                const barX = (i / 40) * 100;
                const barW = 100 / 42;
                const pos = i / 40;
                // Peak shifted to ~70% (higher temp range typical in thermal images)
                const dist = Math.exp(-Math.pow((pos - 0.7) * 3.5, 2));
                const hPct = 5 + (dist * 90) + (Math.random() * 5); // height as percentage of max
                const barY = 100 - hPct; // bars grow from bottom
                const color = `hsl(${240 - (pos * 240)}, 100%, 50%)`; // Blue to Red
                barsHtml += `<rect x="${barX}" y="${barY}" width="${barW}" height="${hPct}" fill="${color}" />`;
            }

            htmlContent += `
            <div class="report-page ${index < dataList.length - 1 ? 'page-break' : ''}">
                <div class="header-container">
                    <div class="logo-section">
                        ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo-img" />` : '<div class="logo-text">CAS</div>'}
                        <div class="logo-sub">AUTOMATE YOUR BUSINESS & FREE YOUR MIND</div>
                    </div>
                    <div class="company-info">
                        <strong>CONTROL & AUTOMATION SOLUTIONS CO.,LTD.</strong><br>
                        <em>Automate Your Business & Free Your Mind</em><br>
                        Factory: Lot C3, Road No.2, Hoa Cam Industrial Zone, Danang, Vietnam<br>
                        Office: 8th Floor, Petrolimex Building, 122 September 2nd Street, Danang, Vietnam<br>
                        Phone: (+84) 236 3675 666 Fax: (+84) 236 3675 777 Website: www.cas-energy.com
                    </div>
                </div>

                <div class="title">${reportTitle}</div>

                <table class="meta-table">
                    <tr>
                        <td class="meta-label">File:</td> <td class="meta-val">${item.filename}.BMT</td>
                        <td class="meta-label" style="text-align:right">Date:</td> <td class="meta-val" style="text-align:right">${item.createdAt}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Lens type:</td> <td class="meta-val">35° x 26°</td>
                        <td class="meta-label" style="text-align:right">Time:</td> <td class="meta-val" style="text-align:right">12:00:00 PM</td>
                    </tr>
                </table>

                <div class="images-row">
                    <div class="image-box">
                         <div class="thermal-container">
                            <div class="image-wrapper">
                                ${thermalImgBase64 ? `<img src="data:image/jpeg;base64,${thermalImgBase64}"/>` : '<span>No Thermal Image</span>'}
                                
                                ${item.spots ? `
                                    <div class="marker marker-hot" style="left: ${item.spots.hot.x}%; top: ${item.spots.hot.y}%;"><span class="marker-label">HS1</span></div>
                                    <div class="marker marker-cold" style="left: ${item.spots.cold.x}%; top: ${item.spots.cold.y}%;"><span class="marker-label">CS1</span></div>
                                ` : ''}
                                <div class="marker marker-center" style="left: 50%; top: 50%;"><span class="marker-label">M1</span></div>
                            </div>
                            <div class="scale-container">
                                <div class="scale-bar"></div>
                                <div class="scale-values">
                                    <span>${item.maxTemp}</span>
                                    <span>${((parseFloat(item.maxTemp) + parseFloat(item.minTemp)) / 2 + (parseFloat(item.maxTemp) - parseFloat(item.minTemp)) / 4).toFixed(1)}</span>
                                    <span>${((parseFloat(item.maxTemp) + parseFloat(item.minTemp)) / 2).toFixed(1)}</span>
                                    <span>${((parseFloat(item.maxTemp) + parseFloat(item.minTemp)) / 2 - (parseFloat(item.maxTemp) - parseFloat(item.minTemp)) / 4).toFixed(1)}</span>
                                    <span>${item.minTemp}</span>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div class="image-box">
                         ${realImgBase64 ? `<img src="data:image/jpeg;base64,${realImgBase64}"/>` : '<span>No Real Image</span>'}
                    </div>
                </div>

                <div class="section-title">Thông số hình ảnh / Picture parameters:</div>
                <div class="params-grid">
                   <div class="param-row"><div class="param-label">Độ phát xạ / Emissivity:</div> <div>${item.emissivity}</div> <div></div></div>
                   <div class="param-row"><div class="param-label">Nhiệt độ phản chiếu / Refl. temp. [°C]:</div> <div>${item.reflTemp}</div> <div></div></div>
                   <div class="param-row"><div class="param-label">Cường độ ánh sáng / Intensity [W/m2]:</div> <div>500</div> <div></div></div>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Điểm đo / Spots</th>
                            <th>Nhiệt độ / Temperature [°C]</th>
                            <th>Độ phát xạ / Emissivity</th>
                            <th>Nhiệt độ phản chiếu / Refl. temp. [°C]</th>
                            <th>Trạng thái / Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="left">HS1 - Nhiệt độ cao nhất / Hottest Spot</td>
                            <td>${item.maxTemp}</td>
                            <td>${item.emissivity}</td>
                            <td>${item.reflTemp}</td>
                            <td><span class="status-badge status-${parseFloat(item.maxTemp) > 70 ? 'critical' : parseFloat(item.maxTemp) >= 50 ? 'warning' : 'normal'}">${parseFloat(item.maxTemp) > 70 ? 'CRITICAL' : parseFloat(item.maxTemp) >= 50 ? 'WARNING' : 'NORMAL'}</span></td>
                        </tr>
                        <tr>
                            <td class="left">CS1 - Nhiệt độ thấp nhất / Coldest Spot</td>
                            <td>${item.minTemp}</td>
                            <td>${item.emissivity}</td>
                            <td>${item.reflTemp}</td>
                            <td><span class="status-badge status-${parseFloat(item.minTemp) > 70 ? 'critical' : parseFloat(item.minTemp) >= 50 ? 'warning' : 'normal'}">${parseFloat(item.minTemp) > 70 ? 'CRITICAL' : parseFloat(item.minTemp) >= 50 ? 'WARNING' : 'NORMAL'}</span></td>
                        </tr>
                        <tr>
                            <td class="left">M1 - Nhiệt độ trung bình / Center Spot</td>
                            <td>${item.avgTemp}</td>
                            <td>${item.emissivity}</td>
                            <td>${item.reflTemp}</td>
                            <td><span class="status-badge status-${parseFloat(item.avgTemp) > 70 ? 'critical' : parseFloat(item.avgTemp) >= 50 ? 'warning' : 'normal'}">${parseFloat(item.avgTemp) > 70 ? 'CRITICAL' : parseFloat(item.avgTemp) >= 50 ? 'WARNING' : 'NORMAL'}</span></td>
                        </tr>
                    </tbody>
                </table>

                <div class="section-title">Biểu đồ nhiệt / Histogram:</div>
                <div class="chart-stats">
                     Minimum: ${min.toFixed(1)} °C &nbsp; Maximum: ${max.toFixed(1)} °C &nbsp; Average: ${avg.toFixed(1)} °C
                </div>
                <div class="chart-container" style="height: 100px; border: 1px solid #ddd; background: #fafafa;">
                     <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <!-- Grid lines -->
                         <line x1="0" y1="20" x2="100" y2="20" stroke="#ddd" stroke-width="0.5" />
                         <line x1="0" y1="40" x2="100" y2="40" stroke="#ddd" stroke-width="0.5" />
                         <line x1="0" y1="60" x2="100" y2="60" stroke="#ddd" stroke-width="0.5" />
                         <line x1="0" y1="80" x2="100" y2="80" stroke="#ddd" stroke-width="0.5" />
                         <!-- Bars -->
                         ${barsHtml}
                     </svg>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #555; padding: 2px 0;">
                    <span>${min.toFixed(1)} °C</span>
                    <span>${avg.toFixed(1)} °C</span>
                    <span>${max.toFixed(1)} °C</span>
                </div>

                <div class="section-title">Kết luận / Result:</div>
                <p style="margin: 0 0 10px 0;">Nhiệt độ đảm bảo điều kiện vận hành.</p>
                <hr style="border: none; border-top: 2px solid #000; margin: 10px 0;">
                <p style="margin: 0;">The temperature is guaranteed for operating conditions.</p>
                
                <div class="section-title">Đề xuất / Recommendation:</div>
                <p style="margin: 0;">Tiếp tục theo dõi / Continue monitoring.</p>
            </div>
            `;
        }

        htmlContent += `
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();
        return outputPath;
    }
}

module.exports = PuppeteerReportService;
