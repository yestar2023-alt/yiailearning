#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testFolderAccess() {
  console.log('🔍 测试文件夹访问...\n');

  // 获取访问令牌
  const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET,
  });
  const token = tokenResp.data.app_access_token;

  const folderId = process.env.FEISHU_FOLDER_ID;
  console.log('文件夹ID:', folderId);
  console.log('尝试多种方式访问...\n');

  // 方法1: 使用 drive/v1/folders API
  console.log('📁 方法1: drive/v1/folders/{folder_id}/children');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/folders/${folderId}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功! 文档数量:', response.data.items?.length);
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 方法2: 使用 metadata API
  console.log('\n📁 方法2: drive/v1/metas');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/metas?folder_type=space&folder_id=${folderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功! 响应:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 方法3: 使用 search API 搜索文档
  console.log('\n🔍 方法3: 搜索API (搜索整个知识库)');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/search/v2/hubs?limit=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功! 知识库数量:', response.data.data?.items?.length);
    if (response.data.data?.items?.length > 0) {
      console.log('   知识库列表:', response.data.data.items.map(item => item.name || item.title).join(', '));
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 方法4: 检查应用权限
  console.log('\n🔐 检查应用权限...');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/contact/v3/users/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功! 当前用户:', response.data.data?.user?.name || JSON.stringify(response.data.data));
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }
}

testFolderAccess();
