#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkPermissions() {
  console.log('🔍 检查应用权限...\n');

  // 获取访问令牌
  const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET,
  });
  const token = tokenResp.data.app_access_token;

  // 测试所需权限
  console.log('📋 测试所需权限：\n');

  // 1. 文档内容权限
  console.log('1️⃣ 测试文档内容权限 (doc:doc)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/doc/v2/documents',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('   ✅ 有权限');
  } catch (error) {
    console.log('   ❌ 权限不足:', error.response?.data?.msg || error.message);
  }

  // 2. 云空间权限
  console.log('\n2️⃣ 测试云空间权限 (drive)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/drive/v1/spaces',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('   ✅ 有权限');
    console.log('   知识库数量:', response.data.data?.items?.length || 0);
  } catch (error) {
    console.log('   ❌ 权限不足:', error.response?.data?.msg || error.message);
  }

  // 3. 文档内容读取权限
  console.log('\n3️⃣ 测试文档内容读取权限');
  try {
    // 尝试获取一个示例文档的内容
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/doc/v2/documents',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('   ✅ 有权限');
    if (response.data.data?.items?.length > 0) {
      console.log('   可访问文档数量:', response.data.data.items.length);
    }
  } catch (error) {
    console.log('   ❌ 权限不足:', error.response?.data?.msg || error.message);
  }

  console.log('\n💡 需要的权限：');
  console.log('   - 读取云空间文件 (drive:drive:readonly)');
  console.log('   - 读取文档内容 (doc:doc)');
  console.log('   - 搜索文档 (search:search) - 可选\n');

  console.log('🔧 解决方案：');
  console.log('   1. 访问: https://open.feishu.cn/app/');
  console.log('   2. 找到你的应用 (ID: ' + process.env.FEISHU_APP_ID + ')');
  console.log('   3. 点击"权限管理"');
  console.log('   4. 申请以下权限:');
  console.log('      ✓ 读取云空间文件');
  console.log('      ✓ 读取文档内容');
  console.log('   5. 申请后需要发布新版本\n');
}

checkPermissions();
