const DB_NAME = 'FieldTrialData';
const DB_VERSION = 1;
const STORE_EXPERIMENTS = 'experiments';
const STORE_ENTRIES = 'dataEntries';

let db = null;

function initDB() {
    return new Promise((resolve, reject) => {
        if (db) { resolve(db); return; }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(new Error('无法打开数据库'));

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_EXPERIMENTS)) {
                const store = database.createObjectStore(STORE_EXPERIMENTS, { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('user', 'user', { unique: false });
            }

            if (!database.objectStoreNames.contains(STORE_ENTRIES)) {
                const store = database.createObjectStore(STORE_ENTRIES, { keyPath: 'id', autoIncrement: true });
                store.createIndex('experimentId', 'experimentId', { unique: false });
                store.createIndex('testType', 'testType', { unique: false });
                store.createIndex('experiment_testType', ['experimentId', 'testType'], { unique: true });
                store.createIndex('user', 'user', { unique: false });
            }
        };
    });
}

// ===== 试验操作 =====

async function createExperiment(exp) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_EXPERIMENTS], 'readwrite');
        const store = tx.objectStore(STORE_EXPERIMENTS);
        exp.createdAt = new Date().toISOString();
        exp.updatedAt = exp.createdAt;
        const req = store.add(exp);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(new Error('创建试验失败'));
    });
}

async function updateExperiment(exp) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_EXPERIMENTS], 'readwrite');
        const store = tx.objectStore(STORE_EXPERIMENTS);
        exp.updatedAt = new Date().toISOString();
        const req = store.put(exp);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(new Error('更新试验失败'));
    });
}

async function deleteExperiment(id) {
    const database = await initDB();
    const tx = database.transaction([STORE_EXPERIMENTS, STORE_ENTRIES], 'readwrite');
    tx.objectStore(STORE_EXPERIMENTS).delete(id);
    const idx = tx.objectStore(STORE_ENTRIES).index('experimentId');
    idx.openCursor(IDBKeyRange.only(id)).onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            tx.objectStore(STORE_ENTRIES).delete(cursor.primaryKey);
            cursor.continue();
        }
    };
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('删除试验失败'));
    });
}

async function getAllExperiments() {
    const database = await initDB();
    const user = getCurrentUser();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_EXPERIMENTS], 'readonly');
        const idx = tx.objectStore(STORE_EXPERIMENTS).index('user');
        const req = idx.getAll(user);
        req.onsuccess = () => {
            const list = req.result.sort((a, b) => new Date(b.date) - new Date(a.date));
            resolve(list);
        };
        req.onerror = () => reject(new Error('获取试验列表失败'));
    });
}

async function getExperiment(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_EXPERIMENTS], 'readonly');
        const req = tx.objectStore(STORE_EXPERIMENTS).get(id);
        req.onsuccess = () => {
            const exp = req.result;
            if (exp && exp.user !== getCurrentUser()) {
                resolve(null);
            } else {
                resolve(exp);
            }
        };
        req.onerror = () => reject(new Error('获取试验失败'));
    });
}

// ===== 数据条目操作 =====

async function saveDataEntry(entry) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_ENTRIES], 'readwrite');
        const store = tx.objectStore(STORE_ENTRIES);
        const now = new Date().toISOString();

        // 先查找是否已存在同 experimentId + testType 的记录
        const idx = store.index('experiment_testType');
        const req = idx.get([entry.experimentId, entry.testType]);

        req.onsuccess = () => {
            const existing = req.result;
            if (existing) {
                entry.id = existing.id;
                entry.createdAt = existing.createdAt;
                entry.updatedAt = now;
            } else {
                entry.createdAt = now;
                entry.updatedAt = now;
            }
            const putReq = store.put(entry);
            putReq.onsuccess = () => resolve(putReq.result);
            putReq.onerror = () => reject(new Error('保存数据失败'));
        };
        req.onerror = () => reject(new Error('查询数据失败'));
    });
}

async function getDataEntry(experimentId, testType) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_ENTRIES], 'readonly');
        const store = tx.objectStore(STORE_ENTRIES);
        const idx = store.index('experiment_testType');
        const req = idx.get([experimentId, testType]);
        req.onsuccess = () => {
            const entry = req.result || null;
            if (entry && entry.user && entry.user !== getCurrentUser()) {
                resolve(null);
            } else {
                resolve(entry);
            }
        };
        req.onerror = () => reject(new Error('获取数据失败'));
    });
}

async function getAllDataEntries(experimentId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_ENTRIES], 'readonly');
        const store = tx.objectStore(STORE_ENTRIES);
        const idx = store.index('experimentId');
        const req = idx.getAll(experimentId);
        req.onsuccess = () => {
            const user = getCurrentUser();
            const filtered = (req.result || []).filter(e => !e.user || e.user === user);
            resolve(filtered);
        };
        req.onerror = () => reject(new Error('获取数据列表失败'));
    });
}

async function clearDataEntry(experimentId, testType) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction([STORE_ENTRIES], 'readwrite');
        const store = tx.objectStore(STORE_ENTRIES);
        const idx = store.index('experiment_testType');
        const req = idx.get([experimentId, testType]);
        req.onsuccess = () => {
            if (req.result) {
                store.delete(req.result.id).onsuccess = () => resolve();
            } else {
                resolve();
            }
        };
        req.onerror = () => reject(new Error('清空数据失败'));
    });
}

// ===== 统计 =====

async function getLocalStats() {
    const exps = await getAllExperiments();
    let totalEntries = 0;
    for (const exp of exps) {
        const entries = await getAllDataEntries(exp.id);
        totalEntries += entries.length;
    }
    return { dates: exps.length, entries: totalEntries };
}
