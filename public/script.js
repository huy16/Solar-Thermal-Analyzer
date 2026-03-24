let OM_DATA = {};
window.currentModuleVoc = 0;

const SAMPLE_PV_DATA = [
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-660MS', capacity: 660, voc: 45.4, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'HiKu7 CS7N-650MS', capacity: 650, voc: 45.0, qty: 100 },
    { manufacturer: 'Canadian Solar', model: 'CS6.2-66TB-625', capacity: 625, voc: 48.6, qty: 100 },
    { manufacturer: 'Astronergy', model: 'ASTRO-5 CHSM72M-HC 550W', capacity: 550, voc: 50.1, qty: 100 },
    { manufacturer: 'TCL/HSPV', model: 'N-Type Topcon G12 700W', capacity: 700, voc: 48.0, qty: 100 },
    { manufacturer: 'Hershey/TCL', model: 'HSM-BD72-GC650', capacity: 650, voc: 54.0, qty: 100 },
    { manufacturer: 'HSPV', model: 'HSM-GHF-NM630', capacity: 630, voc: 48.9, qty: 100 }
];

const SAMPLE_INVERTER_DATA = [
    { manufacturer: 'Huawei', model: 'SUN2000-30KTL-M3', capacity: 30 },
    { manufacturer: 'Huawei', model: 'SUN2000-40KTL-M3', capacity: 40 },
    { manufacturer: 'Huawei', model: 'SUN2000-50KTL-M3', capacity: 50 },
    { manufacturer: 'Huawei', model: 'SUN2000-100KTL-M2', capacity: 100 },
    { manufacturer: 'Huawei', model: 'SUN2000-115KTL-M2', capacity: 115 },
    { manufacturer: 'Huawei', model: 'SUN2000-12-25KTL-M5', capacity: 25 },
    { manufacturer: 'Huawei', model: 'SUN2000-150K-MG0', capacity: 150 }
];

const SAMPLE_AC_DATA = [
    { manufacturer: 'CAS/ Việt Nam', model: 'CAS-SB-2ST', cbQty: 5, ipRating: 'IP65' }
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
    const target = parts.reduce((acc, part) => {
        if (!acc[part]) acc[part] = {};
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
            <div class="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm italic">
                Chưa có ảnh nào được chọn.
            </div>
        `;
        return;
    }

    // Assign grid columns based on file count
    if (files.length === 1) container.classList.add('grid-cols-1');
    else if (files.length === 2) container.classList.add('grid-cols-2');
    else if (files.length === 3) container.classList.add('grid-cols-3');
    else container.classList.add('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4'); // Responsive

    files.forEach((file, index) => {
        const itemBox = document.createElement('div');
        itemBox.className = 'thermal-item-box relative border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-slate-50 flex items-center justify-center min-h-[120px]';

        // Check if it's an image we can preview
        const isImage = file.type.startsWith('image/');
        const isBMT = file.name.toUpperCase().endsWith('.BMT');

        if (isImage) {
            const img = document.createElement('img');
            img.className = 'w-full h-full object-cover aspect-video';
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            itemBox.appendChild(img);
        } else {
            // Icon for non-image files like .BMT
            const iconWrap = document.createElement('div');
            iconWrap.className = 'flex flex-col items-center justify-center p-4 text-slate-500';
            iconWrap.innerHTML = `
                <span class="material-symbols-outlined text-4xl mb-2">${isBMT ? 'thermostat' : 'insert_drive_file'}</span>
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
    reader.onload = function(e) {
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
    reader.onload = function(e) {
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
    let list = [];
    if (type === 'pv') list = SAMPLE_PV_DATA;
    else if (type === 'inverter') list = SAMPLE_INVERTER_DATA;
    else if (type === 'ac') list = SAMPLE_AC_DATA;
    
    const modalId = `sample-modal-${type}`;
    
    // Create modal if not exists
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 transform transition-all">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h3 class="text-lg font-black text-slate-800 uppercase tracking-tight">Chọn mẫu ${type === 'pv' ? 'Tấm pin (PV)' : (type === 'inverter' ? 'Inverter' : 'Tủ điện AC')}</h3>
                        <button onclick="closeSampleModal('${type}')" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 transition-colors">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        ${list.map((item, index) => `
                            <button onclick="applySample('${type}', ${index})" class="w-full p-4 flex items-center justify-between text-left rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group">
                                <div>
                                    <p class="font-bold text-slate-800 text-[14px]">${item.model}</p>
                                    <p class="text-[11px] text-slate-500 font-medium">${item.manufacturer} ${item.capacity ? `• ${item.capacity}${type === 'pv' ? ' Wp' : ' kW'}` : ''}</p>
                                </div>
                                <span class="material-symbols-outlined text-transparent group-hover:text-primary transition-all">arrow_forward_ios</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
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
