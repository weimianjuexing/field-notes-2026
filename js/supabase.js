/**
 * Supabase 云端同步模块
 * 
 * 使用说明：
 * 1. 前往 https://supabase.com 注册免费账号
 * 2. 创建新项目，记下 Project URL 和 anon key
 * 3. 打开 SQL Editor 执行下面 SQL 创建数据表
 * 4. 在 APP 「同步」页面填入 URL 和 Key
 * 
 * -- SQL 建表语句（在 Supabase SQL Editor 中执行）:
 * CREATE TABLE trial_data (
 *   id TEXT PRIMARY KEY,
 *   date TEXT NOT NULL,
 *   exp_name TEXT DEFAULT '',
 *   treatments JSONB DEFAULT '[]',
 *   replicates INTEGER DEFAULT 3,
 *   test_type TEXT NOT NULL,
 *   test_label TEXT DEFAULT '',
 *   test_unit TEXT DEFAULT '',
 *   values JSONB DEFAULT '[]',
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   device_id TEXT NOT NULL
 * );
 * 
 * ALTER TABLE trial_data ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "公开读取" ON trial_data FOR SELECT USING (true);
 * CREATE POLICY "公开写入" ON trial_data FOR INSERT WITH CHECK (true);
 * CREATE POLICY "公开更新" ON trial_data FOR UPDATE USING (true);
 * CREATE POLICY "公开删除" ON trial_data FOR DELETE USING (true);
 */

const SUPABASE_CONFIG = {
  url: 'https://kimbzckjlvofcnrqrwak.supabase.co',
  key: 'sb_publishable_oCYRFfjst-HsGJdi8io1DQ_0IUk-5gw'
};
const TABLE_NAME = 'trial_data';

let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) return null;
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  return supabaseClient;
}

function getDeviceId() {
  let did = localStorage.getItem('field_device_id');
  if (!did) {
    did = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('field_device_id', did);
  }
  return did;
}

function isSupabaseConfigured() {
  return true;
}

/**
 * 批量上传
 */
async function uploadRecords(records, onProgress) {
  const client = initSupabase();
  if (!client) throw new Error('Supabase 未配置');

  const deviceId = getDeviceId();
  let success = 0, failed = 0;
  const total = records.length;

  for (let i = 0; i < total; i++) {
    const r = records[i];
    try {
      const payload = {
        id: r.id,
        date: r.date,
        exp_name: r.expName || '',
        treatments: r.treatments || [],
        replicates: r.replicates || 3,
        test_type: r.testType,
        test_label: r.testLabel || '',
        test_unit: r.testUnit || '',
        values: r.values || [],
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString(),
        device_id: deviceId,
        username: r.user || ''
      };

      const { error } = await client
        .from(TABLE_NAME)
        .upsert(payload, { onConflict: 'id' });

      if (error) { failed++; } else { success++; }
    } catch (e) { failed++; }

    if (onProgress) onProgress(Math.round(((i + 1) / total) * 100));
  }

  return { success, failed };
}

/**
 * 下载云端数据
 */
async function downloadRecords() {
  const client = initSupabase();
  if (!client) throw new Error('Supabase 未配置');

  const user = getCurrentUser();

  const { data, error } = await client
    .from(TABLE_NAME)
    .select('*')
    .eq('username', user)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    date: r.date,
    expName: r.exp_name || '',
    treatments: r.treatments || [],
    replicates: r.replicates || 3,
    testType: r.test_type,
    testLabel: r.test_label || '',
    testUnit: r.test_unit || '',
    values: r.values || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    user: r.username || ''
  }));
}

/**
 * 获取云端记录数
 */
async function getCloudCount() {
  const client = initSupabase();
  if (!client) return 0;
  const user = getCurrentUser();
  const { count, error } = await client
    .from(TABLE_NAME)
    .select('*', { count: 'exact', head: true })
    .eq('username', user);
  if (error) return 0;
  return count || 0;
}

/**
 * 提交反馈
 */
async function submitFeedbackToCloud(text, contact) {
  const client = initSupabase();
  if (!client) throw new Error('Supabase 未配置');

  const { error } = await client
    .from('feedback')
    .insert({
      username: getCurrentUser(),
      content: text,
      contact: contact || '',
      created_at: new Date().toISOString()
    });

  if (error) throw error;
  return true;
}
