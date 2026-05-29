// 全局状态
let currentExperimentId = null;
let currentTestType = null;
let currentUser = null;

// ===== 账号配置 =====
const ACCOUNTS = [
    { user: 'qinxian1', pass: '123456' },
    { user: 'qinxian2', pass: '123456' },
    { user: 'qinxian3', pass: '123456' },
];

function getCurrentUser() {
    return currentUser || localStorage.getItem('field_user');
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function doLogin(username, password) {
    const acc = ACCOUNTS.find(a => a.user === username && a.pass === password);
    if (!acc) return false;
    currentUser = acc.user;
    localStorage.setItem('field_user', acc.user);
    return true;
}

function doLogout() {
    currentUser = null;
    localStorage.removeItem('field_user');
    showLoginUI();
}

function checkLogin() {
    const saved = localStorage.getItem('field_user');
    if (saved && ACCOUNTS.some(a => a.user === saved)) {
        currentUser = saved;
        showMainUI();
        return true;
    }
    showLoginUI();
    return false;
}

function showLoginUI() {
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('mainApp').classList.add('d-none');
    document.getElementById('loginError').classList.add('d-none');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}

function showMainUI() {
    document.getElementById('loginPage').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    document.getElementById('currentUserLabel').textContent = getCurrentUser();
}

function handleLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    if (doLogin(user, pass)) {
        showMainUI();
        initApp();
    } else {
        document.getElementById('loginError').classList.remove('d-none');
    }
}

// ===== 测试内容配置（按你的模板分类）=====
const TEST_TYPES = [
    // 土壤物理
    { id: 'bulkDensity', label: '容重', unit: 'g/cm³', icon: 'bi-layers', color: '#795548', group: '土壤物理' },
    { id: 'soilPh', label: 'pH', unit: '', icon: 'bi-flask', color: '#0d6efd', group: '土壤物理' },
    { id: 'porosity', label: '总孔隙度', unit: '%', icon: 'bi-circle', color: '#607d8b', group: '土壤物理' },
    { id: 'soilMoisture', label: '土壤水分', unit: '%', icon: 'bi-droplet', color: '#198754', group: '土壤物理' },
    // 土壤有机碳
    { id: 'soc', label: 'SOC', unit: 'g/kg', icon: 'bi-tree', color: '#4caf50', group: '土壤有机碳' },
    { id: 'poxc', label: 'POXC', unit: 'mg/kg', icon: 'bi-cpu', color: '#8bc34a', group: '土壤有机碳' },
    { id: 'availN', label: '有效氮', unit: 'mg/kg', icon: 'bi-cpu', color: '#dc3545', group: '土壤有机碳' },
    { id: 'availP', label: '有效磷', unit: 'mg/kg', icon: 'bi-cpu', color: '#fd7e14', group: '土壤有机碳' },
    { id: 'availK', label: '有效钾', unit: 'mg/kg', icon: 'bi-cpu', color: '#ffc107', group: '土壤有机碳' },
    // 土壤微生物
    { id: 'mbc', label: 'MBC', unit: 'mg/kg', icon: 'bi-bug', color: '#9c27b0', group: '土壤微生物' },
    { id: 'mbn', label: 'MBN', unit: 'mg/kg', icon: 'bi-bug', color: '#7b1fa2', group: '土壤微生物' },
    // 团聚体
    { id: 'agg2mm', label: '>2mm', unit: '%', icon: 'bi-grid', color: '#795548', group: '团聚体' },
    { id: 'agg025', label: '2-0.25mm', unit: '%', icon: 'bi-grid', color: '#8d6e63', group: '团聚体' },
    { id: 'agg0053', label: '0.25-0.053mm', unit: '%', icon: 'bi-grid', color: '#a1887f', group: '团聚体' },
    { id: 'agg0053less', label: '<0.053mm', unit: '%', icon: 'bi-grid', color: '#bcaaa4', group: '团聚体' },
    { id: 'mwd', label: 'MWD', unit: 'mm', icon: 'bi-rulers', color: '#5d4037', group: '团聚体' },
    { id: 'gmd', label: 'GMD', unit: 'mm', icon: 'bi-rulers', color: '#6d4c41', group: '团聚体' },
    // 地上部
    { id: 'upperDry', label: '上部干重', unit: 'g', icon: 'bi-flower1', color: '#27ae60', group: '地上部' },
    { id: 'lowerDry', label: '下部干重', unit: 'g', icon: 'bi-flower1', color: '#2ecc71', group: '地上部' },
    // 考种
    { id: 'spikeLen', label: '穗长', unit: 'cm', icon: 'bi-rulers', color: '#e67e22', group: '考种' },
    { id: 'spikeWidth', label: '穗粗', unit: 'cm', icon: 'bi-rulers', color: '#f39c12', group: '考种' },
    { id: 'baldTip', label: '秃尖长', unit: 'cm', icon: 'bi-rulers', color: '#d35400', group: '考种' },
    { id: 'rowsPerSpike', label: '穗行数', unit: '', icon: 'bi-hash', color: '#c0392b', group: '考种' },
    { id: 'grainsPerSpike', label: '穗粒数', unit: '', icon: 'bi-hash', color: '#e74c3c', group: '考种' },
    { id: 'grainWeight', label: '单穗粒重', unit: 'g', icon: 'bi-hash', color: '#3498db', group: '考种' },
    { id: 'yield', label: '实际产量', unit: 'kg/hm²', icon: 'bi-bar-chart', color: '#2c3e50', group: '考种' },
    // 秸秆腐解
    { id: 'residualUpper', label: '上部残留量', unit: 'g', icon: 'bi-recycle', color: '#16a085', group: '秸秆腐解' },
    { id: 'residualLower', label: '下部残留量', unit: 'g', icon: 'bi-recycle', color: '#1abc9c', group: '秸秆腐解' },
    { id: 'residualRate', label: '残留率', unit: '%', icon: 'bi-recycle', color: '#2ecc71', group: '秸秆腐解' },
    { id: 'cnRatio', label: 'C/N比', unit: '', icon: 'bi-percent', color: '#f39c12', group: '秸秆腐解' },
    // 株高
    { id: 'plantHeight', label: '株高', unit: 'cm', icon: 'bi-arrows-expand-vertical', color: '#27ae60', group: '株高' },
    // SPAD
    { id: 'spadTop', label: 'SPAD-上', unit: '', icon: 'bi-sun', color: '#27ae60', group: 'SPAD' },
    { id: 'spadMid', label: 'SPAD-中', unit: '', icon: 'bi-sun', color: '#2ecc71', group: 'SPAD' },
    { id: 'spadBot', label: 'SPAD-下', unit: '', icon: 'bi-sun', color: '#1abc9c', group: 'SPAD' },
    { id: 'spadAvg', label: '平均SPAD', unit: '', icon: 'bi-sun', color: '#16a085', group: 'SPAD' },
    // 光合指标
    { id: 'pn', label: 'Pn', unit: 'μmol CO₂/m²/s', icon: 'bi-wind', color: '#2ecc71', group: '光合指标' },
    { id: 'tr', label: 'Tr', unit: 'mmol H₂O/m²/s', icon: 'bi-wind', color: '#3498db', group: '光合指标' },
    { id: 'gs', label: 'Gs', unit: 'mol/m²/s', icon: 'bi-wind', color: '#9b59b6', group: '光合指标' },
    { id: 'ci', label: 'Ci', unit: 'μmol/mol', icon: 'bi-wind', color: '#e74c3c', group: '光合指标' },
    // 入渗
    { id: 'infilt1', label: '入渗1', unit: 'mm', icon: 'bi-droplet-half', color: '#3498db', group: '入渗' },
    { id: 'infilt2', label: '入渗2', unit: 'mm', icon: 'bi-droplet-half', color: '#2980b9', group: '入渗' },
    { id: 'infiltAvg', label: '平均入渗', unit: 'mm', icon: 'bi-droplet-half', color: '#1f6dad', group: '入渗' },
];

// ===== 页面加载 =====
document.addEventListener('DOMContentLoaded', () => {
    if (checkLogin()) {
        initApp();
    }
});

async function initApp() {
    await initDB();
    initSupabaseConfig();
    renderDatePage();
}

// ===== 页面切换 =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.fixed-bottom .btn').forEach(b => {
        b.classList.remove('text-success');
        b.classList.add('text-muted');
    });

    if (pageId === 'pageDate') {
        renderDatePage();
    } else if (pageId === 'pageUpload') {
        updateUploadUI();
    }
}

// ===== 日期选择页 =====
async function renderDatePage() {
    const exps = await getAllExperiments();
    const empty = document.getElementById('emptyDate');
    const recent = document.getElementById('recentExps');
    const all = document.getElementById('allExps');

    // 设置日期选择器默认值（今天）
    const picker = document.getElementById('selectedDate');
    if (!picker.value) picker.value = todayStr();

    if (exps.length === 0) {
        empty.classList.remove('d-none');
        recent.classList.add('d-none');
        all.classList.add('d-none');
        return;
    }

    empty.classList.add('d-none');

    // 最近3个试验
    const sorted = exps.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = sorted.slice(0, 3).map(exp => dateCard(exp)).join('');
    recent.classList.remove('d-none');

    // 全部列表
    const allList = document.getElementById('allList');
    allList.innerHTML = sorted.map(exp => dateCard(exp)).join('');
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function dateCard(exp) {
    const day = new Date(exp.date + 'T00:00:00');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const wd = weekdays[day.getDay()];
    const display = exp.date.split('-').slice(1).join('/');
    return `
        <div class="card date-card">
            <div class="card-body py-2 px-3">
                <div class="d-flex align-items-center" onclick="selectExperiment(${exp.id})">
                    <div class="date-badge text-center me-3">
                        <div class="date-day">${display}</div>
                        <div class="date-weekday">周${wd}</div>
                    </div>
                    <div class="flex-fill">
                        <div class="fw-bold">${exp.name || '田间试验'}</div>
                        <small class="text-muted">${exp.treatments.join('/')} · ${exp.replicates}次重复</small>
                    </div>
                    <i class="bi bi-chevron-right text-muted"></i>
                </div>
                <div class="d-flex gap-1 mt-1">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="event.stopPropagation(); editExperiment(${exp.id})" title="编辑">
                        <i class="bi bi-pencil small"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="event.stopPropagation(); confirmDeleteExp(${exp.id})" title="删除">
                        <i class="bi bi-trash small"></i>
                    </button>
                </div>
            </div>
        </div>`;
}

// ===== 编辑试验 =====
async function editExperiment(id) {
    const exp = await getExperiment(id);
    if (!exp) return;
    currentExperimentId = id;
    document.getElementById('setupDateLabel').textContent = exp.date + ' (编辑)';
    document.getElementById('newName').value = exp.name || '';
    document.getElementById('newTreatments').value = exp.treatments.join('\n');
    document.getElementById('newReplicates').value = exp.replicates;
    document.getElementById('btnCreateExp').textContent = '保存修改';
    document.getElementById('btnCreateExp').onclick = saveEditExperiment;
    new bootstrap.Modal(document.getElementById('newDateModal')).show();
}

async function saveEditExperiment() {
    const exp = await getExperiment(currentExperimentId);
    if (!exp) return;
    exp.name = document.getElementById('newName').value.trim();
    exp.treatments = document.getElementById('newTreatments').value.trim().split('\n').map(s => s.trim()).filter(s => s);
    exp.replicates = parseInt(document.getElementById('newReplicates').value) || 3;
    if (exp.treatments.length === 0) { showToast('请填写处理', 'warning'); return; }
    await updateExperiment(exp);
    bootstrap.Modal.getInstance(document.getElementById('newDateModal')).hide();
    document.getElementById('btnCreateExp').textContent = '创建并进入';
    document.getElementById('btnCreateExp').onclick = createNewDate;
    showToast('已保存', 'success');
    renderDatePage();
}

// ===== 删除试验 =====
function confirmDeleteExp(id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = '确定删除这个试验？所有数据将丢失。';
    document.getElementById('confirmBtn').onclick = async () => {
        await deleteExperiment(id);
        modal.hide();
        showToast('已删除', 'success');
        renderDatePage();
    };
    modal.show();
}

// ===== 日期选择 → 自动判断（支持同一天多个试验）=====
async function onDateSelected() {
    const date = document.getElementById('selectedDate').value;
    if (!date) return;

    const exps = await getAllExperiments();
    const existing = exps.filter(e => e.date === date);

    if (existing.length === 1) {
        selectExperiment(existing[0].id);
    } else if (existing.length > 1) {
        showExpsForDate(date, existing);
    } else {
        showSetupModal(date);
    }
}

// ===== 显示某日期的所有试验 =====
function showExpsForDate(date, exps) {
    const list = exps.map(exp =>
        `<div class="card date-card mb-2" onclick="selectExperiment(${exp.id})">
            <div class="card-body py-2 px-3">
                <div class="d-flex align-items-center">
                    <div class="flex-fill">
                        <div class="fw-bold">${exp.name || '田间试验'}</div>
                        <small class="text-muted">${exp.treatments.join('/')} · ${exp.replicates}次重复</small>
                    </div>
                    <i class="bi bi-chevron-right text-muted"></i>
                </div>
            </div>
        </div>`
    ).join('');

    document.getElementById('dateExpList').innerHTML = list;
    document.getElementById('btnAddExpForDate').onclick = () => showSetupModal(date);
    new bootstrap.Modal(document.getElementById('dateExpModal')).show();
}

// ===== 快速设置弹窗 =====
function showSetupModal(date) {
    document.getElementById('setupDateLabel').textContent = date;
    document.getElementById('newName').value = '';
    document.getElementById('newTreatments').value = 'CK\nT1\nT2\nT3\nT2C';
    document.getElementById('newReplicates').value = '3';
    new bootstrap.Modal(document.getElementById('newDateModal')).show();
}

// ===== 快速开始（底部 + 按钮）=====
async function quickStart() {
    const date = document.getElementById('selectedDate').value || todayStr();
    const exps = await getAllExperiments();
    const existing = exps.filter(e => e.date === date);

    showPage('pageDate');

    if (existing.length === 1) {
        selectExperiment(existing[0].id);
    } else if (existing.length > 1) {
        showExpsForDate(date, existing);
    } else {
        showSetupModal(date);
    }
}

// ===== 创建试验并进入 =====
async function createNewDate() {
    const date = document.getElementById('setupDateLabel').textContent;
    const name = document.getElementById('newName').value.trim();
    const treatmentsText = document.getElementById('newTreatments').value.trim();
    const replicates = parseInt(document.getElementById('newReplicates').value);

    if (!date) { showToast('日期错误', 'warning'); return; }
    const treatments = treatmentsText.split('\n').map(s => s.trim()).filter(s => s);
    if (treatments.length === 0) { showToast('请填写至少一个处理', 'warning'); return; }
    if (isNaN(replicates) || replicates < 1) { showToast('重复次数至少为1', 'warning'); return; }

    const newId = await createExperiment({ date, name, treatments, replicates, user: getCurrentUser() });
    bootstrap.Modal.getInstance(document.getElementById('newDateModal')).hide();
    showToast('试验已创建', 'success');
    renderDatePage();
    selectExperiment(newId);
}

// ===== 查看全部/收起 =====
function showAllExps() {
    document.getElementById('allExps').classList.remove('d-none');
    document.getElementById('recentExps').classList.add('d-none');
}
function hideAllExps() {
    document.getElementById('allExps').classList.add('d-none');
    document.getElementById('recentExps').classList.remove('d-none');
}

// ===== 选择试验 → 进入测试内容页 =====
async function selectExperiment(id) {
    currentExperimentId = id;
    const exp = await getExperiment(id);
    if (!exp) { showToast('试验不存在', 'danger'); return; }

    document.getElementById('currentDateLabel').textContent = exp.date + ' ' + (exp.name || '田间试验');
    document.getElementById('currentExperimentInfo').textContent =
        `${exp.treatments.join('/')} · ${exp.replicates}次重复`;

    const grid = document.getElementById('testTypeGrid');

    // 按分组组织
    const groups = {};
    TEST_TYPES.forEach(tt => {
        const g = tt.group || '其他';
        if (!groups[g]) groups[g] = [];
        groups[g].push(tt);
    });

    let html = '';
    for (const [groupName, items] of Object.entries(groups)) {
        html += `<div class="col-12 mt-2 mb-1"><small class="text-muted fw-bold">${groupName}</small></div>`;
        items.forEach(tt => {
            html += `
                <div class="col-4">
                    <div class="card test-type-card" onclick="selectTestType('${tt.id}')">
                        <div class="card-body text-center py-2">
                            <i class="bi ${tt.icon} fs-4" style="color:${tt.color}"></i>
                            <div class="small mt-1">${tt.label}</div>
                            <small class="text-muted">${tt.unit}</small>
                        </div>
                    </div>
                </div>`;
        });
    }
    grid.innerHTML = html;

    showPage('pageTestType');
}

// ===== 分享整个试验数据 =====
async function shareAllData() {
    const exp = await getExperiment(currentExperimentId);
    if (!exp) return;
    const entries = await getAllDataEntries(currentExperimentId);
    if (entries.length === 0) { showToast('没有数据可分享', 'warning'); return; }

    let text = `${exp.date} ${exp.name || '试验'}\n${'═'.repeat(35)}\n`;

    for (const entry of entries) {
        const tt = TEST_TYPES.find(t => t.id === entry.testType);
        if (!tt) continue;
        text += `\n【${tt.label}】${tt.unit ? '(' + tt.unit + ')' : ''}\n`;
        let header = '处理'.padEnd(8);
        for (let r = 1; r <= exp.replicates; r++) header += `重复${r}`.padStart(8);
        text += header + '\n';
        for (let ti = 0; ti < exp.treatments.length; ti++) {
            let row = exp.treatments[ti].padEnd(8);
            for (let r = 0; r < exp.replicates; r++) {
                const val = entry.values[ti] && entry.values[ti][r] != null ? String(entry.values[ti][r]) : '-';
                row += val.padStart(8);
            }
            text += row + '\n';
        }
    }

    if (navigator.share) {
        try { await navigator.share({ title: `${exp.date} ${exp.name}`, text }); showToast('已分享', 'success'); return; }
        catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); showToast('已复制到剪贴板', 'success'); }
    catch (e) { prompt('复制以下内容：', text); }
}

// ===== 选择测试内容 → 进入数据录入 =====
async function selectTestType(testType) {
    currentTestType = testType;
    const exp = await getExperiment(currentExperimentId);
    const tt = TEST_TYPES.find(t => t.id === testType);

    document.getElementById('entryDateLabel').textContent = exp.date;
    document.getElementById('entryTestType').textContent = tt.label + (tt.unit ? ` (${tt.unit})` : '');
    document.getElementById('entryHeader').textContent = tt.label;

    // 深度选择器（土壤相关指标）
    const depthGroup = document.getElementById('depthGroup');
    const depthSelect = document.getElementById('depthSelect');
    const soilTypes = ['bulkDensity', 'soilPh', 'porosity', 'soilMoisture', 'soc', 'poxc', 'availN', 'availP', 'availK', 'mbc', 'mbn'];
    if (soilTypes.includes(testType)) {
        depthGroup.classList.remove('d-none');
        depthSelect.value = 'none';
    } else {
        depthGroup.classList.add('d-none');
    }

    // 备注
    const entry = await getDataEntry(currentExperimentId, testType);
    document.getElementById('entryNotes').value = entry ? (entry.notes || '') : '';

    renderEntryTable(exp, entry);
    showPage('pageEntry');
}

// 渲染表格
async function renderEntryTable(exp, entry) {
    const thead = document.getElementById('entryTableHead');
    const tbody = document.getElementById('entryTableBody');
    const depth = document.getElementById('depthSelect') ? document.getElementById('depthSelect').value : 'none';

    let headerHTML = '<th class="tmt-th">处理 \\ 重复</th>';
    for (let r = 1; r <= exp.replicates; r++) {
        headerHTML += `<th class="tmt-th">重复${r}</th>`;
    }
    thead.innerHTML = headerHTML;

    const values = entry ? entry.values : [];
    tbody.innerHTML = exp.treatments.map((t, ti) => {
        let rowHTML = `<td class="tmt-td fw-medium">${t}</td>`;
        for (let r = 0; r < exp.replicates; r++) {
            const val = (values[ti] && values[ti][r] !== undefined && values[ti][r] !== null) ? values[ti][r] : '';
            rowHTML += `<td class="tmt-td"><input type="number" step="0.01" class="form-control form-control-sm tmt-input"
                id="cell_${ti}_${r}" value="${val}" placeholder="—"
                onchange="onCellChange(${ti}, ${r})"></td>`;
        }
        return `<tr>${rowHTML}</tr>`;
    }).join('');
}

// 深度变化
async function onDepthChange() {
    const exp = await getExperiment(currentExperimentId);
    const depth = document.getElementById('depthSelect').value;
    const entry = await getDataEntry(currentExperimentId, currentTestType);
    renderEntryTable(exp, entry);
}

// ===== 单元格变化 =====
let _saveTimer = null;
function onCellChange(ti, ri) {
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => saveEntryData(true), 800);
}

// ===== 保存数据 =====
async function saveEntryData(silent) {
    const exp = await getExperiment(currentExperimentId);
    const values = [];

    for (let ti = 0; ti < exp.treatments.length; ti++) {
        values[ti] = [];
        for (let r = 0; r < exp.replicates; r++) {
            const input = document.getElementById(`cell_${ti}_${r}`);
            const val = input ? input.value.trim() : '';
            values[ti][r] = val !== '' ? parseFloat(val) : null;
        }
    }

    const notes = document.getElementById('entryNotes').value.trim();

    await saveDataEntry({
        experimentId: currentExperimentId,
        testType: currentTestType,
        values,
        notes,
        user: getCurrentUser()
    });

    if (!silent) showToast('数据已保存', 'success');
}

// ===== 分享当前数据 =====
async function shareEntryData() {
    const exp = await getExperiment(currentExperimentId);
    const tt = TEST_TYPES.find(t => t.id === currentTestType);
    const entry = await getDataEntry(currentExperimentId, currentTestType);

    if (!entry || !entry.values || entry.values.length === 0) {
        showToast('没有数据可分享', 'warning');
        return;
    }

    // 生成文本表格
    let text = `${exp.date} ${exp.name || ''} - ${tt.label}\n`;
    text += `${'─'.repeat(30)}\n`;

    // 表头
    let header = '处理'.padEnd(8);
    for (let r = 1; r <= exp.replicates; r++) {
        header += `重复${r}`.padStart(8);
    }
    text += header + '\n';

    // 数据行
    for (let ti = 0; ti < exp.treatments.length; ti++) {
        let row = exp.treatments[ti].padEnd(8);
        for (let r = 0; r < exp.replicates; r++) {
            const val = entry.values[ti] && entry.values[ti][r] != null
                ? String(entry.values[ti][r]) : '-';
            row += val.padStart(8);
        }
        text += row + '\n';
    }

    if (tt.unit) text += `\n单位: ${tt.unit}`;

    // 尝试原生分享
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${exp.date} ${tt.label}`,
                text: text
            });
            showToast('已分享', 'success');
            return;
        } catch (e) {
            if (e.name === 'AbortError') return; // 用户取消
        }
    }

    // 降级：复制到剪贴板
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
    } catch (e) {
        // 再降级：弹窗显示
        prompt('复制以下内容分享：', text);
    }
}

// ===== 清空当前页 =====
function confirmClearEntry() {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmMessage').textContent = '确定清空当前测试内容的所有数据？';
    document.getElementById('confirmBtn').onclick = async () => {
        await clearDataEntry(currentExperimentId, currentTestType);
        modal.hide();
        selectTestType(currentTestType);
        showToast('已清空', 'success');
    };
    modal.show();
}

// ===== 导出当前试验 =====
async function exportCurrentDate() {
    if (!currentExperimentId) {
        const exps = await getAllExperiments();
        if (exps.length === 0) { showToast('没有可导出的数据', 'warning'); return; }
        // 导出所有
        await exportAll();
        return;
    }
    await exportAll();
}

async function exportAll() {
    const exps = await getAllExperiments();
    if (exps.length === 0) { showToast('没有数据', 'warning'); return; }

    const rows = [];
    for (const exp of exps) {
        const entries = await getAllDataEntries(exp.id);
        for (const entry of entries) {
            const tt = TEST_TYPES.find(t => t.id === entry.testType);
            const unit = tt ? tt.unit : '';
            for (let ti = 0; ti < exp.treatments.length; ti++) {
                for (let r = 0; r < exp.replicates; r++) {
                    const val = (entry.values[ti] && entry.values[ti][r] !== null)
                        ? entry.values[ti][r] : '';
                    rows.push({
                        '日期': exp.date,
                        '试验名称': exp.name || '',
                        '处理': exp.treatments[ti],
                        '重复': r + 1,
                        '测试内容': tt ? tt.label : entry.testType,
                        '数值': val,
                        '单位': unit
                    });
                }
            }
        }
    }

    if (rows.length === 0) { showToast('没有数据', 'warning'); return; }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '试验数据');
    ws['!cols'] = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length * 2, 10) }));
    XLSX.writeFile(wb, `田间试验数据_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(`已导出 ${rows.length} 条数据`, 'success');
}

// ===== 云端同步 =====
function initSupabaseConfig() {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    if (url && key) {
        document.getElementById('supabaseUrl').value = url;
        document.getElementById('supabaseKey').value = key;
        SUPABASE_CONFIG.url = url;
        SUPABASE_CONFIG.key = key;
    }
}

function saveSupabaseConfig() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    if (!url || !key) { showToast('请填写完整配置', 'warning'); return; }
    if (!url.startsWith('https://')) { showToast('URL 须以 https:// 开头', 'warning'); return; }

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    SUPABASE_CONFIG.url = url;
    SUPABASE_CONFIG.key = key;
    showToast('配置已保存', 'success');
    updateUploadUI();
    addUploadLog('已连接: ' + url);
}

async function updateUploadUI() {
    const syncIcon = document.getElementById('syncStatus');
    const configured = isSupabaseConfigured();

    if (configured) {
        syncIcon.className = 'sync-status sync-connected';
        syncIcon.innerHTML = '<i class="bi bi-cloud-check-fill"></i>';
        document.getElementById('uploadMainIcon').className = 'bi bi-cloud-check-fill fs-1 text-success';
        document.getElementById('uploadTitle').textContent = '已连接云端';
        document.getElementById('uploadDesc').textContent = '点击"上传并下载"同步所有数据';
        document.getElementById('uploadStats').style.display = '';
        document.getElementById('uploadActions').style.display = '';

        const stats = await getLocalStats();
        document.getElementById('ulLocalDates').textContent = stats.dates;
        document.getElementById('ulRecords').textContent = stats.entries;

        try {
            const cloudCount = await getCloudCount();
            document.getElementById('ulCloudDates').textContent = cloudCount;
        } catch (e) {
            document.getElementById('ulCloudDates').textContent = '?';
        }

        document.getElementById('btnUpload').disabled = false;
    } else {
        syncIcon.className = 'sync-status sync-disconnected';
        syncIcon.innerHTML = '<i class="bi bi-cloud-slash-fill"></i>';
        document.getElementById('uploadMainIcon').className = 'bi bi-cloud-arrow-up fs-1 text-muted';
        document.getElementById('uploadTitle').textContent = '未连接云端';
        document.getElementById('uploadDesc').textContent = '配置 Supabase 后即可同步';
        document.getElementById('uploadStats').style.display = 'none';
        document.getElementById('uploadActions').style.display = 'none';
        document.getElementById('btnUpload').disabled = true;
    }
}

// ===== 一键上传+下载 =====
async function uploadAll() {
    const exps = await getAllExperiments();
    if (exps.length === 0) { showToast('没有数据可上传', 'warning'); return; }

    const btn = document.getElementById('btnUpload');
    const progress = document.getElementById('uploadProgress');
    const bar = document.getElementById('upProgressBar');
    const pText = document.getElementById('upProgressText');
    const pPercent = document.getElementById('upProgressPercent');

    btn.disabled = true;
    progress.classList.remove('d-none');
    addUploadLog('开始同步...');

    try {
        // Step 1: 上传所有数据
        const allRecords = [];
        for (const exp of exps) {
            const entries = await getAllDataEntries(exp.id);
            for (const entry of entries) {
                allRecords.push(serializeForCloud(exp, entry));
            }
        }

        pText.textContent = '正在上传到云端...';
        const result = await uploadRecords(allRecords, (pct) => {
            bar.style.width = pct + '%';
            pPercent.textContent = pct + '%';
        });

        if (result.failed > 0) {
            addUploadLog(`⚠ 上传完成：成功 ${result.success}，失败 ${result.failed}`);
        } else {
            addUploadLog(`✅ 上传完成：${result.success} 条`);
        }

        // Step 2: 从云端下载
        pText.textContent = '正在从云端下载...';
        bar.style.width = '50%';
        pPercent.textContent = '50%';
        addUploadLog('从云端下载数据...');

        await syncFromCloud();

        bar.style.width = '100%';
        pPercent.textContent = '100%';
        pText.textContent = '同步完成';
        addUploadLog('✅ 同步完成');
        showToast('同步完成', 'success');
        updateUploadUI();
    } catch (e) {
        pText.textContent = '同步失败';
        addUploadLog('❌ ' + e.message);
        showToast('同步失败: ' + e.message, 'danger');
    }

    setTimeout(() => {
        progress.classList.add('d-none');
        bar.style.width = '0%';
    }, 2000);
    btn.disabled = false;
}

async function syncFromCloud() {
    try {
        const cloudRecords = await downloadRecords();
        const userRecords = cloudRecords.filter(r => r.user === getCurrentUser());
        if (userRecords.length === 0) {
            addUploadLog('ℹ 云端无数据');
            return;
        }

        let added = 0, updated = 0;
        const localExps = await getAllExperiments();

        for (const cr of userRecords) {
            const localExp = localExps.find(e => e.date === cr.date &&
                (!cr.expName || e.name === cr.expName));
            if (localExp) {
                const existing = await getDataEntry(localExp.id, cr.testType);
                if (existing) {
                    const tCloud = new Date(cr.updatedAt || cr.createdAt);
                    const tLocal = new Date(existing.updatedAt || existing.createdAt);
                    if (tCloud > tLocal) {
                        await saveDataEntry({
                            experimentId: localExp.id,
                            testType: cr.testType,
                            values: cr.values,
                            user: getCurrentUser()
                        });
                        updated++;
                    }
                } else {
                    await saveDataEntry({
                        experimentId: localExp.id,
                        testType: cr.testType,
                        values: cr.values,
                        user: getCurrentUser()
                    });
                    added++;
                }
            } else {
                // 云端有但本地没有的试验 → 创建
                const newExpId = await createExperiment({
                    date: cr.date,
                    name: cr.expName || '',
                    treatments: cr.treatments || ['处理1', '处理2'],
                    replicates: cr.replicates || 3,
                    user: getCurrentUser()
                });
                await saveDataEntry({
                    experimentId: newExpId,
                    testType: cr.testType,
                    values: cr.values,
                    user: getCurrentUser()
                });
                added++;
            }
        }

        addUploadLog(`✅ 下载完成：新增 ${added}，更新 ${updated}`);
    } catch (e) {
        addUploadLog('❌ 下载失败: ' + e.message);
    }
}

function serializeForCloud(exp, entry) {
    const tt = TEST_TYPES.find(t => t.id === entry.testType);
    return {
        id: `exp_${exp.id}_${entry.testType}`,
        date: exp.date,
        expName: exp.name || '',
        treatments: exp.treatments,
        replicates: exp.replicates,
        testType: entry.testType,
        testLabel: tt ? tt.label : entry.testType,
        testUnit: tt ? tt.unit : '',
        values: entry.values,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        user: getCurrentUser()
    };
}

function addUploadLog(msg) {
    const log = document.getElementById('uploadLog');
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const entry = document.createElement('div');
    entry.className = 'sync-log-entry';
    entry.innerHTML = `<small class="text-muted">${time}</small> ${msg}`;
    if (log.querySelector('.text-muted.text-center')) log.innerHTML = '';
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function clearUploadLog() {
    document.getElementById('uploadLog').innerHTML =
        '<div class="text-muted text-center py-2"><small>暂无日志</small></div>';
}

// ===== 通用 =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    msg.textContent = message;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    new bootstrap.Toast(toast, { autohide: true, delay: 2000 }).show();
}

function showAbout() {
    new bootstrap.Modal(document.getElementById('aboutModal')).show();
}
