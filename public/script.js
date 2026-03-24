let OM_DATA = {};

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
            showToast('Dữ liệu biểu mẫu đã được tải.');
        } else {
            console.error('Failed to load default OM data');
        }
    } catch (err) {
        console.error('Error fetching OM data:', err);
    }
});

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Data Binding utility
function bindDataToForm(data) {
    const inputs = document.querySelectorAll('input[data-path], textarea[data-path], select[data-path]');
    inputs.forEach(input => {
        const path = input.getAttribute('data-path');
        const value = getNestedValue(data, path);
        if (value !== undefined && value !== null) {
            input.value = value;
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

// Auto-evaluate UI function for Earth Resistance
function evaluateEarthResistance(index, value) {
    const evalSpan = document.getElementById(`er-eval-${index}`);
    if (!evalSpan) return;
    const val = parseFloat(value);
    
    let evaluation = "";
    if (!isNaN(val)) {
        if (val <= 4) {
            evaluation = "Đạt";
            evalSpan.textContent = "Đạt";
            evalSpan.className = "ml-2 text-xs font-bold text-green-600";
        } else {
            evaluation = "Không Đạt";
            evalSpan.textContent = "Không Đạt";
            evalSpan.className = "ml-2 text-xs font-bold text-red-600";
        }
    } else {
        evalSpan.textContent = "";
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
                summaryDesc.value = "Không";
            }
        }
    }
}



// Upload Logic
if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadFiles);
}

async function uploadFiles() {
    // Collect updated form data
    const finalOmData = gatherFormData();

    const statusDiv = document.getElementById('status');
    const uploadBtn = document.getElementById('uploadBtn');

    // Generate the report with or without BMT files

    
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '🕒 Đang xử lý... Vui lòng đợi trong giây lát...';
    statusDiv.className = 'status processing';
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '⏳ Processing...';

    const formData = new FormData();
    const reportTitle = document.getElementById('reportTitle') ? document.getElementById('reportTitle').value : "BIÊN BẢN KIỂM TRA – BẢO TRÌ – BẢO DƯỠNG";
    
    formData.append('reportTitle', reportTitle);
    formData.append('omData', JSON.stringify(finalOmData)); // Append full data object

    // Append dynamically collected thermal images for Section 10 (pv, ac, inverter)
    // We append them as 'files' so backend BMT parser processes them, but we prepend category to originalname
    if (window.dynamicThermalFiles) {
        for (const [category, fileArray] of Object.entries(window.dynamicThermalFiles)) {
            fileArray.forEach(file => {
                let prefix = category;
                if (category === 'ac') prefix = 'cabinet';
                formData.append('files', file, `${prefix}_${file.name}`);
            });
        }
    }

    // Append Technician Signature if present
    const sigInput = document.getElementById('signatureInput');
    if (sigInput && sigInput.files && sigInput.files[0]) {
        formData.append('signature', sigInput.files[0]);
    }

    // Gather all checklist image proofs
    const imageInputs = document.querySelectorAll('input[type="file"][data-image-key]');
    imageInputs.forEach(input => {
        if (input.files && input.files.length > 0) {
            const key = input.getAttribute('data-image-key');
            // Append with the mapped key so the backend can easily identify Which check it's for
            formData.append(key, input.files[0]);
        }
    });

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
            statusDiv.innerHTML = '✅ Tạo báo cáo thành công! Tải xuống đang bắt đầu.';
            statusDiv.className = 'status success';
        } else {
            const errorText = await response.text();
            statusDiv.innerHTML = '❌ Lỗi server: ' + errorText;
            statusDiv.className = 'status error';
        }
    } catch (error) {
        console.error(error);
        statusDiv.innerHTML = '❌ Lỗi kết nối: Không thể gửi yêu cầu lên server.';
        statusDiv.className = 'status error';
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = 'Xuất File PDF (Generate Report)'; // Reset text
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
        itemBox.className = 'relative border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-slate-50 flex items-center justify-center min-h-[120px]';

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
}

// ==========================================
// Signature Upload Logic (Section 13)
// ==========================================
function handleSignatureUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImg = document.getElementById('sigPreviewImg');
        const previewContainer = document.getElementById('sigPreviewContainer');
        const uploadBox = document.getElementById('sigUploadBox');
        
        previewImg.src = e.target.result;
        previewContainer.classList.remove('hidden');
        uploadBox.classList.add('hidden');
        showToast('Đã tải lên chữ ký kỹ thuật viên.');
    };
    reader.readAsDataURL(file);
}

function removeSignature() {
    const input = document.getElementById('signatureInput');
    const previewContainer = document.getElementById('sigPreviewContainer');
    const uploadBox = document.getElementById('sigUploadBox');
    const previewImg = document.getElementById('sigPreviewImg');
    
    input.value = '';
    if (previewImg) previewImg.src = '';
    previewContainer.classList.add('hidden');
    uploadBox.classList.remove('hidden');
}

