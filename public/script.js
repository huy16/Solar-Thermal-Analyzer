let OM_DATA = {};
window.currentModuleVoc = 0;

const SAMPLE_PV_DATA = [
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-600', capacity: 600, voc: 47.6, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-605', capacity: 605, voc: 47.8, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-610', capacity: 610, voc: 48, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-615', capacity: 615, voc: 48.2, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-620', capacity: 620, voc: 48.4, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-625', capacity: 625, voc: 48.6, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-630', capacity: 630, voc: 48.8, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC660', capacity: 660, voc: 54.2, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC655', capacity: 655, voc: 54.1, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC650', capacity: 650, voc: 54, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC645', capacity: 645, voc: 53.9, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC640', capacity: 640, voc: 53.8, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC635', capacity: 635, voc: 53.7, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM630', capacity: 630, voc: 48.9, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM625', capacity: 625, voc: 48.7, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM620', capacity: 620, voc: 48.5, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM615', capacity: 615, voc: 48.3, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM610', capacity: 610, voc: 48.1, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM605', capacity: 605, voc: 47.9, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-675MS', capacity: 675, voc: 46, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-670MS', capacity: 670, voc: 45.8, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-665MS', capacity: 665, voc: 45.6, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-660MS', capacity: 660, voc: 45.4, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-655MS', capacity: 655, voc: 45.2, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-650MS', capacity: 650, voc: 45, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-645MS', capacity: 645, voc: 44.8, qty: 100 },
    { manufacturer: 'Astronergy', model: 'CHSM72M-HC 555W', capacity: 555, voc: 50.3, qty: 100 },
    { manufacturer: 'Astronergy', model: 'CHSM72M-HC 550W', capacity: 550, voc: 50.1, qty: 100 },
    { manufacturer: 'Astronergy', model: 'CHSM72M-HC 545W', capacity: 545, voc: 49.9, qty: 100 },
    { manufacturer: 'Astronergy', model: 'CHSM72M-HC 540W', capacity: 540, voc: 49.7, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK700', capacity: 700, voc: 48.26, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK705', capacity: 705, voc: 48.48, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK710', capacity: 710, voc: 48.70, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK715', capacity: 715, voc: 48.92, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK720', capacity: 720, voc: 49.14, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-ND66-GK725', capacity: 725, voc: 49.36, qty: 100 }
];

const SAMPLE_INVERTER_DATA = [
    { manufacturer: 'Huawei', model: 'SUN2000-2KTL-L1', capacity: 2 },
    { manufacturer: 'Huawei', model: 'SUN2000-3KTL-L1', capacity: 3 },
    { manufacturer: 'Huawei', model: 'SUN2000-3.68KTL-L1', capacity: 3.68 },
    { manufacturer: 'Huawei', model: 'SUN2000-4KTL-L1', capacity: 4 },
    { manufacturer: 'Huawei', model: 'SUN2000-4.6KTL-L1', capacity: 4.6 },
    { manufacturer: 'Huawei', model: 'SUN2000-5KTL-L1', capacity: 5 },
    { manufacturer: 'Huawei', model: 'SUN2000-6KTL-L1', capacity: 6 },
    { manufacturer: 'Huawei', model: 'SUN2000-3KTL-M1', capacity: 3 },
    { manufacturer: 'Huawei', model: 'SUN2000-4KTL-M1', capacity: 4 },
    { manufacturer: 'Huawei', model: 'SUN2000-5KTL-M1', capacity: 5 },
    { manufacturer: 'Huawei', model: 'SUN2000-6KTL-M1', capacity: 6 },
    { manufacturer: 'Huawei', model: 'SUN2000-8KTL-M1', capacity: 8 },
    { manufacturer: 'Huawei', model: 'SUN2000-10KTL-M1', capacity: 10 },
    { manufacturer: 'Huawei', model: 'SUN2000-8K-LC0', capacity: 8 },
    { manufacturer: 'Huawei', model: 'SUN2000-10K-LC0', capacity: 10 },
    { manufacturer: 'Huawei', model: 'SUN2000-5K-MAP0', capacity: 5 },
    { manufacturer: 'Huawei', model: 'SUN2000-6K-MAP0', capacity: 6 },
    { manufacturer: 'Huawei', model: 'SUN2000-8K-MAP0', capacity: 8 },
    { manufacturer: 'Huawei', model: 'SUN2000-10K-MAP0', capacity: 10 },
    { manufacturer: 'Huawei', model: 'SUN2000-12K-MAP0', capacity: 12 },
    { manufacturer: 'Huawei', model: 'SUN2000-12KTL-M2', capacity: 12 },
    { manufacturer: 'Huawei', model: 'SUN2000-15KTL-M2', capacity: 15 },
    { manufacturer: 'Huawei', model: 'SUN2000-17KTL-M2', capacity: 17 },
    { manufacturer: 'Huawei', model: 'SUN2000-20KTL-M2', capacity: 20 },
    { manufacturer: 'Huawei', model: 'SUN2000-12KTL-M5', capacity: 12 },
    { manufacturer: 'Huawei', model: 'SUN2000-15KTL-M5', capacity: 15 },
    { manufacturer: 'Huawei', model: 'SUN2000-17KTL-M5', capacity: 17 },
    { manufacturer: 'Huawei', model: 'SUN2000-20KTL-M5', capacity: 20 },
    { manufacturer: 'Huawei', model: 'SUN2000-25KTL-M5', capacity: 25 },
    { manufacturer: 'Huawei', model: 'SUN2000-30KTL-M3', capacity: 30 },
    { manufacturer: 'Huawei', model: 'SUN2000-36KTL-M3', capacity: 36 },
    { manufacturer: 'Huawei', model: 'SUN2000-40KTL-M3', capacity: 40 },
    { manufacturer: 'Huawei', model: 'SUN2000-50KTL-M3', capacity: 50 },
    { manufacturer: 'Huawei', model: 'SUN2000-60KTL-M0', capacity: 60 },
    { manufacturer: 'Huawei', model: 'SUN2000-70KTL-INM0', capacity: 70 },
    { manufacturer: 'Huawei', model: 'SUN2000-100KTL-M2', capacity: 100 },
    { manufacturer: 'Huawei', model: 'SUN2000-115KTL-M2', capacity: 115 },
    { manufacturer: 'Huawei', model: 'SUN2000-150K-MG0', capacity: 150 }
];

const SAMPLE_AC_DATA = [
    { manufacturer: 'CAS/ Việt Nam', model: 'CAS-SB-2ST', cbQty: 5, ipRating: 'IP65' }
];

const SAMPLE_STRUCTURE_PV_DATA = [
    { manufacturer: 'CAS', model: 'Liên kết Rail - Chân L - Sóng Tôn', material: 'Nhôm' }
];

const SAMPLE_STRUCTURE_AC_DATA = [
    { manufacturer: 'CAS', model: 'Liên kết Rail - Ke Vuông - Tường', material: 'Nhôm' }
];

const SAMPLE_INSPECTION_DATA = [
    { model: 'Kiểm tra định kỳ lần 1' },
    { model: 'Kiểm tra định kỳ lần 2' },
    { model: 'Kiểm tra định kỳ lần 3' },
    { model: 'Kiểm tra định kỳ lần 4' },
    { model: 'Kiểm tra đột xuất' },
    { model: 'Nghiệm thu bàn giao' }
];


// Wait for DOM
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup Tabs
    const navItems = document.querySelectorAll('.nav-item, .nav-item-premium');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Highlight the parent group's stepper node
            const allGroups = document.querySelectorAll('.stepper-group');
            allGroups.forEach(group => {
                const node = group.querySelector('.stepper-node');
                const title = group.querySelector('.group-title');
                if (node) {
                    node.classList.remove('bg-primary', 'text-white', 'shadow-md');
                    node.classList.add('bg-slate-200', 'text-slate-500', 'shadow-sm');
                }
                if (title) {
                    title.classList.remove('text-slate-800');
                    title.classList.add('text-slate-700');
                }
            });

            const parentGroup = item.closest('.stepper-group');
            if (parentGroup) {
                const activeNode = parentGroup.querySelector('.stepper-node');
                const activeTitle = parentGroup.querySelector('.group-title');
                if (activeNode) {
                    activeNode.classList.remove('bg-slate-200', 'text-slate-500', 'shadow-sm');
                    activeNode.classList.add('bg-primary', 'text-white', 'shadow-md');
                }
                if (activeTitle) {
                    activeTitle.classList.remove('text-slate-700');
                    activeTitle.classList.add('text-slate-800');
                }

                // Auto-expand the parent group
                const groupId = parentGroup.getAttribute('data-group');
                if (groupId && typeof toggleGroup === 'function') {
                    const content = document.getElementById(`content-group-${groupId}`);
                    if (content && (content.style.opacity === '0' || content.style.maxHeight === '0px')) {
                        toggleGroup(parseInt(groupId));
                    }
                }
            }

            // Update dot colors
            document.querySelectorAll('.node-dot').forEach(dot => {
                dot.classList.remove('bg-primary');
                dot.classList.add('bg-slate-300');
            });
            const activeDot = item.querySelector('.node-dot');
            if (activeDot) {
                activeDot.classList.remove('bg-slate-300');
                activeDot.classList.add('bg-primary');
            }
        });
    });

    // 2. Fetch Default OM Data
    try {
        const response = await fetch('/api/om-template');
        if (response.ok) {
            OM_DATA = await response.json();
            bindDataToForm(OM_DATA);
            refreshAllSelectColors();
            updateSidebarStatus(); // Initial status check
            showToast('Dữ liệu biểu mẫu đã được tải.');
        } else {
            console.error('Failed to load default OM data');
        }
    } catch (err) {
        console.error('Error fetching OM data:', err);
    }

    // 3. Attach Input Listeners for Real-time Sidebar Status
    document.addEventListener('input', (e) => {
        if (e.target.matches('input, textarea, select')) {
            updateSidebarStatus();
        }
    });
});

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;

    // Clear any existing timeout
    if (window.toastTimeout) clearTimeout(window.toastTimeout);

    toast.classList.add('show');
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Select all items in a tab as "Đạt" (OK)
 */
function selectAllNormal(tabId) {
    const tab = document.getElementById(tabId);
    if (!tab) return;
    const selects = tab.querySelectorAll('select');
    let changed = false;

    selects.forEach(select => {
        // Find "OK" or "Đạt" or "Normal" value
        const targetValue = Array.from(select.options).find(opt =>
            opt.value === 'OK' || opt.value === 'Đạt' || opt.value === 'Normal'
        );

        if (targetValue && select.value !== targetValue.value) {
            select.value = targetValue.value;
            // Apply color immediately
            updateSelectColor(select);
            // Trigger change for data binding
            select.dispatchEvent(new Event('change', { bubbles: true }));
            changed = true;
        }
    });

    if (changed) {
        updateSidebarStatus();
        showToast('Đã chọn thành công tất cả hạng mục là: Đạt');
    } else {
        showToast('Tất cả đã ở trạng thái Đạt!');
    }
}

/**
 * Update select color based on value
 */
function updateSelectColor(select) {
    // Reverted to default as requested by user
    select.classList.remove('bg-green-600', 'bg-red-600', 'text-white', 'font-bold', 'status-ok', 'status-nok');
    select.style.color = '';
    select.style.backgroundColor = '';
    select.style.fontWeight = '';
}

// Global listener for select colors
document.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT') {
        updateSelectColor(e.target);
    }
});

document.addEventListener('input', (e) => {
    if (e.target.tagName === 'SELECT') {
        updateSelectColor(e.target);
    }
});

/**
 * Initialize all select colors on load
 */
function refreshAllSelectColors() {
    document.querySelectorAll('select').forEach(updateSelectColor);
}

/**
 * Automatically set Description to "Không" if Severity is "Thấp"
 */
function handleSummarySeverityChange(select) {
    const path = select.getAttribute('data-path'); // e.g., "summary.0.severity"
    if (!path || !path.includes('severity')) return;

    const descPath = path.replace('severity', 'description');
    const descInput = document.querySelector(`[data-path="${descPath}"]`);

    if (descInput) {
        if (select.value === 'Thấp') {
            descInput.value = 'Không';
        } else {
            // Clear for higher priority
            descInput.value = '';
        }
        // Trigger input event to ensure data binding/auto-save picks it up
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Data Binding utility
function bindDataToForm(data) {
    const inputs = document.querySelectorAll('input[data-path], textarea[data-path], select[data-path]');
    inputs.forEach(input => {
        const path = input.getAttribute('data-path');
        const value = getNestedValue(data, path);
        if (value !== undefined && value !== null) {
            input.value = value;
            // Apply color if it's a select
            if (input.tagName === 'SELECT') {
                updateSelectColor(input);
            }
        }
    });
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part, index) => {
        if (!acc[part]) {
            const nextPart = parts[index + 1] || last;
            acc[part] = !isNaN(Number(nextPart)) ? [] : {};
        }
        return acc[part];
    }, obj);
    target[last] = value;
}

// Gather form data back to OM_DATA
function gatherFormData() {
    const inputs = document.querySelectorAll('input[data-path], textarea[data-path], select[data-path]');
    inputs.forEach(input => {
        const path = input.getAttribute('data-path');
        setNestedValue(OM_DATA, path, input.value);
    });

    // Auto evaluate Earth Resistance (<= 4 ohm is OK)
    if (OM_DATA.earthResistance && Array.isArray(OM_DATA.earthResistance)) {
        OM_DATA.earthResistance.forEach(item => {
            const val = parseFloat(item.value);
            if (!isNaN(val)) {
                item.evaluation = val <= 4 ? "OK" : "Not OK";
            }
        });
    }

    return OM_DATA;
}

/**
 * Compresses an image file for faster upload without sacrificing print quality.
 * Keeps original for BMT (raw data), compresses JPG/PNG.
 */
async function compressImage(file, maxWidth = 1600, maxHeight = 1600) {
    if (!file.type.startsWith('image/')) return file;
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Fill with white to prevent black background for transparent PNGs
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob || file);
                }, 'image/jpeg', 0.82);
            };
        };
    });
}

// Auto-evaluate UI function for Earth Resistance
function evaluateEarthResistance(index, value) {
    const evalSpan = document.getElementById(`er-eval-${index}`);
    if (!evalSpan) return;
    const val = parseFloat(value);

    let evaluation = "";
    if (isNaN(val) || value === "") {
        evalSpan.textContent = "";
        evalSpan.className = "ml-2 text-xs font-bold";
    } else {
        if (val <= 4) {
            evaluation = "Đạt";
            evalSpan.textContent = "Đạt";
            evalSpan.className = "ml-2 text-xs font-bold text-green-600";
        } else {
            evaluation = "Không Đạt";
            evalSpan.textContent = "Không Đạt";
            evalSpan.className = "ml-2 text-xs font-bold text-red-600";
        }
    }

    // Sync to Section 12 Summary (Item 7 = index 6)
    // We sync the first measurement as the representative one
    if (index === 0) {
        const summaryDesc = document.querySelector('[data-path="summary.6.description"]');
        if (summaryDesc) {
            if (evaluation === "Đạt") {
                summaryDesc.value = "Hệ thống tiếp địa đạt tiêu chuẩn (≤ 4Ω)";
            } else if (evaluation === "Không Đạt") {
                summaryDesc.value = "Hệ thống tiếp địa không đạt tiêu chuẩn (> 4Ω)";
            } else {
                summaryDesc.value = "";
            }
        }
    }
}

// Upload Logic
const uploadBtn = document.getElementById('uploadBtn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadFiles);
}

async function uploadFiles() {
    // Collect updated form data
    const finalOmData = gatherFormData();

    const statusDiv = document.getElementById('status');
    const uploadBtn = document.getElementById('uploadBtn');

    // Generate the report with or without BMT files


    if (statusDiv) {
        statusDiv.classList.remove('hidden');
        statusDiv.className = 'status processing';
        statusDiv.innerHTML = `
            <div class="spinner-bars">
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
            </div>
            <div class="status-text">Đang khởi tạo báo cáo</div>
            <div class="status-subtext">Vui lòng đợi trong giây lát...</div>
        `;
    } else {
        showToast('Đang khởi tạo tạo báo cáo... Vui lòng đợi...');
    }

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '⏳ Processing...';

    const formData = new FormData();
    const reportTitle = document.getElementById('reportTitle') ? document.getElementById('reportTitle').value : "BIÊN BẢN KIỂM TRA – BẢO TRÌ – BẢO DƯỠNG";

    formData.append('reportTitle', reportTitle);
    formData.append('omData', JSON.stringify(finalOmData)); // Append full data object

    // Append dynamically collected thermal images for Section 10 (pv, ac, inverter)
    if (window.dynamicThermalFiles) {
        for (const [category, fileArray] of Object.entries(window.dynamicThermalFiles)) {
            for (const file of fileArray) {
                let prefix = category;
                if (category === 'ac') prefix = 'cabinet';

                // Only compress standard images, skip .BMT as it contains raw metadata
                let fileToUpload = file;
                const isBMT = file.name.toUpperCase().endsWith('.BMT');
                if (!isBMT && file.type.startsWith('image/')) {
                    fileToUpload = await compressImage(file);
                }

                formData.append('files', fileToUpload, `${prefix}_${file.name}`);
            }
        }
    }

    // Append Technician Signature if present (Compressed)
    const sigInput = document.getElementById('signatureInput');
    if (sigInput && sigInput.files && sigInput.files[0]) {
        const compressedSig = await compressImage(sigInput.files[0], 800, 800);
        formData.append('signature', compressedSig, 'signature.jpg');
    }

    // Append Client Signature if present (Compressed)
    const clientSigInput = document.getElementById('clientSignatureInput');
    if (clientSigInput && clientSigInput.files && clientSigInput.files[0]) {
        const compressedClientSig = await compressImage(clientSigInput.files[0], 800, 800);
        formData.append('clientSignature', compressedClientSig, 'clientSignature.jpg');
    }

    // Gather all checklist image proofs (Compressed)
    const imageInputs = document.querySelectorAll('input[type="file"][data-image-key]');
    for (const input of imageInputs) {
        if (input.files && input.files.length > 0) {
            const key = input.getAttribute('data-image-key');
            const compressedItem = await compressImage(input.files[0]);
            formData.append(key, compressedItem, input.files[0].name);
        }
    }

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Extract filename from header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'Testo_OM_Report.pdf';
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            if (statusDiv) {
                statusDiv.className = 'status success';
                statusDiv.innerHTML = `
                    <span class="material-symbols-outlined text-[48px] mb-2 text-green-500">check_circle</span>
                    <div class="status-text">Xuất báo cáo thành công!</div>
                    <div class="status-subtext">Tải xuống đang bắt đầu...</div>
                `;
                // Auto-hide success after 5 seconds
                setTimeout(() => {
                    statusDiv.classList.add('hidden');
                    statusDiv.classList.remove('status', 'success');
                }, 5000);
            }
            showToast('Tạo báo cáo thành công!');
        } else {
            const errorText = await response.text();
            if (statusDiv) {
                statusDiv.className = 'status error';
                statusDiv.innerHTML = `
                    <span class="material-symbols-outlined text-[42px] mb-2 text-red-500">error</span>
                    <div class="status-text">Lỗi máy chủ</div>
                    <div class="status-subtext">${errorText || 'Vui lòng thử lại sau.'}</div>
                `;
            }
            showToast('Lỗi server: ' + errorText, 'error');
        }
    } catch (error) {
        console.error(error);
        if (statusDiv) {
            statusDiv.className = 'status error';
            statusDiv.innerHTML = `
                <span class="material-symbols-outlined text-[42px] mb-2 text-red-500">error</span>
                <div class="status-text">Lỗi kết nối</div>
                <div class="status-subtext">${error.message || 'Kiểm tra lại đường truyền.'}</div>
            `;
        }
        showToast('Lỗi kết nối: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">picture_as_pdf</span> <span class="relative z-10">Xuất báo cáo PDF</span>';
    }
}

// ==========================================
// Dynamic Thermal Images Logic (Section 10)
// ==========================================
window.dynamicThermalFiles = {
    pv: [],
    ac: [],
    inverter: []
};

function handleDynamicThermalImages(input, containerId) {
    const category = input.getAttribute('data-category');
    if (!category || !window.dynamicThermalFiles[category]) return;

    const newFiles = Array.from(input.files);
    if (newFiles.length === 0) return;

    // Append new files to our global state
    window.dynamicThermalFiles[category] = window.dynamicThermalFiles[category].concat(newFiles);

    // Warning for even numbers (layout issue)
    if (window.dynamicThermalFiles[category].length % 2 === 0) {
        showToast('Cảnh báo: Số lượng ảnh đang là số chẵn. Nên chọn số lẻ (1, 3, 5...) để tránh lỗi layout nhận xét dính footer.');
    }

    // Clear input value so same files can be selected again if needed
    input.value = '';

    renderDynamicThermalGrid(category, containerId);
}

function removeDynamicThermalImage(category, index, containerId) {
    if (window.dynamicThermalFiles[category]) {
        window.dynamicThermalFiles[category].splice(index, 1);
        renderDynamicThermalGrid(category, containerId);
    }
}

/**
 * Extracts the first JPEG image from a BMT binary buffer (client-side).
 * Used for real-time preview of Testo thermal files.
 */
function extractJpegFromBmt(buffer) {
    const jpegStartMarker = [0xFF, 0xD8];
    const jpegEndMarker = [0xFF, 0xD9];

    function findMarker(buf, marker, offset = 0) {
        for (let i = offset; i < buf.length - 1; i++) {
            if (buf[i] === marker[0] && buf[i + 1] === marker[1]) return i;
        }
        return -1;
    }

    const startIdx = findMarker(buffer, jpegStartMarker);
    if (startIdx === -1) return null;

    const endIdx = findMarker(buffer, jpegEndMarker, startIdx + 2);
    if (endIdx === -1) return null;

    const jpegBuffer = buffer.subarray(startIdx, endIdx + 2);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(jpegBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function renderDynamicThermalGrid(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const files = window.dynamicThermalFiles[category];

    // Reset classes
    container.className = 'grid gap-4 mb-4';
    container.innerHTML = '';

    if (files.length === 0) {
        container.classList.add('grid-cols-1');
        container.innerHTML = `
            <div class="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm italic col-span-full">
                Chưa có ảnh nào được chọn.
            </div>
        `;
        return;
    }

    // Always use a consistent grid layout regardless of file count
    // This ensures images are not "too large" when few are present.
    container.classList.add('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');

    files.forEach((file, index) => {
        const itemBox = document.createElement('div');
        itemBox.className = 'thermal-item-box relative border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-slate-50 flex items-center justify-center min-h-[120px] max-h-[400px]';

        // Check if it's an image we can preview
        const isImage = file.type.startsWith('image/');
        const isBMT = file.name.toUpperCase().endsWith('.BMT');

        if (isImage) {
            const img = document.createElement('img');
            img.className = 'w-full h-full object-contain';
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            itemBox.appendChild(img);
        } else if (isBMT) {
            // Preview for .BMT files
            const img = document.createElement('img');
            img.className = 'w-full h-full object-contain hidden';
            const iconWrap = document.createElement('div');
            iconWrap.className = 'flex flex-col items-center justify-center p-4 text-slate-500';
            iconWrap.innerHTML = `
                <span class="material-symbols-outlined text-4xl mb-2 animate-pulse text-primary/40">thermostat</span>
                <span class="text-[10px] font-semibold uppercase truncate w-24 text-center">${file.name}</span>
            `;

            const reader = new FileReader();
            reader.onload = (e) => {
                const buffer = new Uint8Array(e.target.result);
                const b64 = extractJpegFromBmt(buffer);
                if (b64) {
                    img.src = 'data:image/jpeg;base64,' + b64;
                    img.classList.remove('hidden');
                    iconWrap.classList.add('hidden');
                } else {
                    // Fail fallback: change icon opacity or show error
                    iconWrap.querySelector('span').classList.remove('animate-pulse', 'text-primary/40');
                }
            };
            reader.readAsArrayBuffer(file);
            itemBox.appendChild(img);
            itemBox.appendChild(iconWrap);
        } else {
            // Icon for other non-image files
            const iconWrap = document.createElement('div');
            iconWrap.className = 'flex flex-col items-center justify-center p-4 text-slate-500';
            iconWrap.innerHTML = `
                <span class="material-symbols-outlined text-4xl mb-2">insert_drive_file</span>
                <span class="text-xs font-semibold uppercase truncate w-24 text-center">${file.name}</span>
            `;
            itemBox.appendChild(iconWrap);
        }

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.type = 'button'; // prevent form submit
        delBtn.className = 'absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600';
        delBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">close</span>';
        delBtn.onclick = (e) => {
            e.preventDefault();
            removeDynamicThermalImage(category, index, containerId);
        };

        itemBox.appendChild(delBtn);
        container.appendChild(itemBox);
    });
    updateSidebarStatus();
}

// ==========================================
// Signature Upload Logic (Section 13)
// ==========================================
async function handleSignatureUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('File quá lớn. Vui lòng chọn file dưới 2MB.', 'error');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        window.technicianSignatureBase64 = base64; // Store base64 string globally

        const previewImg = document.getElementById('sigPreviewImg');
        const previewContainer = document.getElementById('sigPreviewContainer');
        const uploadBox = document.getElementById('sigUploadBox');

        previewImg.src = base64;
        previewContainer.classList.remove('hidden');
        uploadBox.classList.add('hidden');
        showToast('Đã tải lên chữ ký kỹ thuật viên.');
    };
    reader.readAsDataURL(file);
    updateSidebarStatus();
}

function removeSignature() {
    window.technicianSignatureBase64 = null;
    document.getElementById('signatureInput').value = '';
    document.getElementById('sigPreviewContainer').classList.add('hidden');
    document.getElementById('sigUploadBox').classList.remove('hidden');
    updateSidebarStatus();
}

// Client Signature Handling
async function handleClientSignatureUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('File quá lớn. Vui lòng chọn file dưới 2MB.', 'error');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        window.clientSignatureBase64 = base64;

        const previewImg = document.getElementById('clientSigPreviewImg');
        const previewContainer = document.getElementById('clientSigPreviewContainer');
        const uploadBox = document.getElementById('clientSigUploadBox');

        previewImg.src = base64;
        previewContainer.classList.remove('hidden');
        uploadBox.classList.add('hidden');

        showToast('Đã tải lên chữ ký khách hàng.');
    };
    reader.readAsDataURL(file);
    updateSidebarStatus();
}

function removeClientSignature() {
    window.clientSignatureBase64 = null;
    document.getElementById('clientSignatureInput').value = '';
    document.getElementById('clientSigPreviewContainer').classList.add('hidden');
    document.getElementById('clientSigUploadBox').classList.remove('hidden');
    updateSidebarStatus();
}

// ==========================================
// Sidebar Status Completion Logic
// ==========================================
function updateSidebarStatus() {
    const tabs = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => {
        const tabId = tab.id.replace('tab-', '');
        const navItem = document.querySelector(`[data-tab="tab-${tabId}"]`);
        if (!navItem) return;
        const dot = navItem.querySelector('.node-dot');
        if (!dot) return;

        let filledCount = 0;

        // 1. Check all standard inputs/selects/textareas
        const inputs = tab.querySelectorAll('input:not([type="file"]), select, textarea');
        inputs.forEach(input => {
            const val = input.value?.trim() || '';
            // Only count as "filled" if it's not the default "Normal" or empty
            if (val !== '' && val !== 'Normal' && val !== 'N/A') {
                filledCount++;
            }
        });

        // 2. Section-specific checks
        if (tabId === '10') { // Thermal Analysis
            const images = tab.querySelectorAll('.thermal-item-box');
            if (images.length > 0) filledCount += 1;
        }

        if (tabId === '11') { // Earth Resistance
            const earthInputs = tab.querySelectorAll('input[type="number"]');
            earthInputs.forEach(i => { if (i.value !== '') filledCount++; });
        }
        if (tabId === '13') { // Signatures
            if (window.technicianSignatureBase64 || window.clientSignatureBase64) filledCount += 1;
        }

        // Apply completed class if section has some data
        if (filledCount > 0) {
            dot.classList.add('completed');
        } else {
            dot.classList.remove('completed');
        }
    });
}
// ==========================================
// Sample Data Selection UI
// ==========================================
function showSampleModal(type) {
    const modalId = `sample-modal-${type}`;
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 transform transition-all flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-slate-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight" id="modal-title-${type}">Chọn mẫu</h3>
                        <button onclick="closeSampleModal('${type}')" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 transition-colors">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input type="text" 
                            placeholder="Tìm kiếm theo hãng hoặc model..." 
                            class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            oninput="filterSampleList('${type}', this.value)">
                    </div>
                </div>
                <div id="sample-list-container-${type}" class="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                    <!-- List items will be injected here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Initial render
    filterSampleList(type, '');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function filterSampleList(type, query) {
    let list = [];
    if (type === 'pv') list = SAMPLE_PV_DATA;
    else if (type === 'inverter') list = SAMPLE_INVERTER_DATA;
    else if (type === 'ac') list = SAMPLE_AC_DATA;
    else if (type === 'structure_pv') list = SAMPLE_STRUCTURE_PV_DATA;
    else if (type === 'structure_ac') list = SAMPLE_STRUCTURE_AC_DATA;
    else if (type === 'inspection') list = SAMPLE_INSPECTION_DATA;

    let title = 'Chọn mẫu';
    if (type === 'pv') title = 'Chọn mẫu Tấm pin (PV Panel)';
    if (type === 'inverter') title = 'Chọn mẫu Biến tần (Inverter)';
    if (type === 'ac') title = 'Chọn mẫu Tủ điện AC';
    if (type === 'structure_pv') title = 'Chọn mẫu Khung giá đỡ PV';
    if (type === 'structure_ac') title = 'Chọn mẫu Khung giá đỡ AC';
    if (type === 'inspection') title = 'Chọn lần kiểm tra';

    const container = document.getElementById(`sample-list-container-${type}`);
    const titleElement = document.getElementById(`modal-title-${type}`);
    if (titleElement) titleElement.textContent = title;
    if (!container) return;

    const filtered = list.map((item, index) => ({ ...item, originalIndex: index }))
        .filter(item => {
            const searchStr = `${item.manufacturer || ''} ${item.model || ''}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
        });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center">
                <span class="material-symbols-outlined text-slate-300 text-[48px] mb-2">search_off</span>
                <p class="text-slate-500 text-sm">Không tìm thấy kết quả nào cho "${query}"</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <button onclick="applySample('${type}', ${item.originalIndex})" class="w-full p-4 flex items-center justify-between text-left rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group">
            <div class="flex-1">
                <div class="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">${item.model}</div>
                <div class="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    ${item.manufacturer ? `<span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">${item.manufacturer}</span>` : ''}
                    ${item.capacity ? `<span>• ${item.capacity}${type === 'pv' ? 'W' : 'kW'}</span>` : ''}
                    ${item.voc ? `<span class="text-primary/70">• Voc: ${item.voc}V</span>` : ''}
                </div>
            </div>
            <span class="material-symbols-outlined text-transparent group-hover:text-primary transition-all text-[18px]">add_circle</span>
        </button>
    `).join('');
}

function closeSampleModal(type) {
    const modal = document.getElementById(`sample-modal-${type}`);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function applySample(type, index) {
    let data;
    if (type === 'pv') data = SAMPLE_PV_DATA[index];
    else if (type === 'inverter') data = SAMPLE_INVERTER_DATA[index];
    else if (type === 'ac') data = SAMPLE_AC_DATA[index];
    else if (type === 'structure_pv') data = SAMPLE_STRUCTURE_PV_DATA[index];
    else if (type === 'structure_ac') data = SAMPLE_STRUCTURE_AC_DATA[index];
    else if (type === 'inspection') data = SAMPLE_INSPECTION_DATA[index];

    if (type === 'pv') {
        const manInput = document.querySelector('[data-path="pvSystem.specs.manufacturer"]');
        const modInput = document.querySelector('[data-path="pvSystem.specs.panelModel"]');
        const capInput = document.querySelector('[data-path="pvSystem.specs.capacity"]');
        const qtyInput = document.querySelector('[data-path="pvSystem.specs.panelQty"]');

        if (manInput) manInput.value = data.manufacturer;
        if (modInput) modInput.value = data.model;
        if (capInput) capInput.value = data.capacity;
        if (qtyInput) qtyInput.value = data.qty;

        // Store Voc for calculations
        window.currentModuleVoc = data.voc || 0;
        updateAllCalculatedVoc();
    } else if (type === 'inverter') {
        const manInput = document.querySelector('[data-path="inverter.specs.manufacturer"]');
        const modInput = document.querySelector('[data-path="inverter.specs.model"]');
        const powInput = document.querySelector('[data-path="inverter.specs.power"]');
        const qtyInput = document.querySelector('[data-path="inverter.specs.qty"]');

        if (manInput) manInput.value = data.manufacturer;
        if (modInput) modInput.value = data.model;
        if (powInput) powInput.value = data.capacity;
        if (qtyInput) qtyInput.value = 1; // Default qty = 1 for inverter samples
    } else if (type === 'ac') {
        const manInput = document.querySelector('[data-path="acCabinet.specs.manufacturer"]');
        const modInput = document.querySelector('[data-path="acCabinet.specs.model"]');
        const qtyInput = document.querySelector('[data-path="acCabinet.specs.cbQty"]');
        const ipInput = document.querySelector('[data-path="acCabinet.specs.ipRating"]');

        if (manInput) manInput.value = data.manufacturer;
        if (modInput) modInput.value = data.model;
        if (qtyInput) qtyInput.value = data.cbQty;
        if (ipInput) ipInput.value = data.ipRating;
    } else if (type === 'structure_pv') {
        const typeInput = document.querySelector('[data-path="mountingStructure.specs.type"]');
        const matInput = document.querySelector('[data-path="mountingStructure.specs.material"]');
        if (typeInput) typeInput.value = data.model;
        if (matInput) matInput.value = data.material;
    } else if (type === 'structure_ac') {
        const typeInput = document.querySelector('[data-path="others.mountingFrame.specs.type"]');
        const matInput = document.querySelector('[data-path="others.mountingFrame.specs.material"]');
        if (typeInput) typeInput.value = data.model;
        if (matInput) matInput.value = data.material;
    } else if (type === 'inspection') {
        const inspInput = document.querySelector('[data-path="projectInfo.inspectionNo"]');
        if (inspInput) inspInput.value = data.model;
    }

    // Update labels and sidebar
    updateSidebarStatus();
    closeSampleModal(type);
    showToast(`Đã áp dụng thông số mẫu cho ${data.model}`);
}

/**
 * Automatically calculate Voc for all strings in Section 3 based on currentModuleVoc
 */
function updateAllCalculatedVoc() {
    if (!window.currentModuleVoc) return;

    // The Insulation Resistance table has rows for String 1-20 (or more)
    // We look for inputs with data-path like pvSystem.insulationResistance.X.panelQty
    const rows = document.querySelectorAll('input[data-path*="pvSystem.insulationResistance"]');

    // Group by index
    const indices = new Set();
    rows.forEach(r => {
        const match = r.getAttribute('data-path').match(/pvSystem\.insulationResistance\.(\d+)\./);
        if (match) indices.add(match[1]);
    });

    indices.forEach(idx => {
        const qtyInput = document.querySelector(`[data-path="pvSystem.insulationResistance.${idx}.panelQty"]`);
        const vocInput = document.querySelector(`[data-path="pvSystem.insulationResistance.${idx}.voc"]`);

        if (qtyInput && vocInput) {
            const qty = parseFloat(qtyInput.value);
            if (!isNaN(qty) && qty > 0) {
                vocInput.value = (qty * window.currentModuleVoc).toFixed(1);
                // Trigger change for data binding if needed
                vocInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    });
}

// Add dynamic listener for Panel Qty changes in Section 3 table
document.addEventListener('input', (e) => {
    if (e.target.getAttribute('data-path') && e.target.getAttribute('data-path').includes('pvSystem.insulationResistance') && e.target.getAttribute('data-path').includes('panelQty')) {
        const path = e.target.getAttribute('data-path');
        const idxMatch = path.match(/pvSystem\.insulationResistance\.(\d+)\.panelQty/);
        if (idxMatch && window.currentModuleVoc) {
            const idx = idxMatch[1];
            const vocInput = document.querySelector(`[data-path="pvSystem.insulationResistance.${idx}.voc"]`);
            if (vocInput) {
                const qty = parseFloat(e.target.value);
                if (!isNaN(qty)) {
                    vocInput.value = (qty * window.currentModuleVoc).toFixed(1);
                }
            }
        }
    }
});
