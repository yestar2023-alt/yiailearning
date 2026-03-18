#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testWithPermissions() {
  console.log('🔍 使用已开通权限重新测试...\n');

  // 获取访问令牌
  const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET,
  });
  const token = tokenResp.data.app_access_token;
  console.log('✅ 访问令牌获取成功\n');

  // 1. 测试获取空间列表
  console.log('1️⃣ 获取空间列表 (drive/v1/spaces)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/drive/v1/spaces',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！空间数量:', response.data.data?.items?.length || 0);
    if (response.data.data?.items?.length > 0) {
      console.log('   空间列表:');
      response.data.data.items.forEach((space, i) => {
        console.log(`   - ${i + 1}. ${space.name} (ID: ${space.space_id})`);
      });
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 2. 测试文档内容获取
  console.log('\n2️⃣ 测试文档内容获取 (doc/v2/documents)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/doc/v2/documents',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！文档数量:', response.data.data?.items?.length || 0);
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 3. 测试文件夹访问
  console.log('\n3️⃣ 测试文件夹访问');
  const folderId = process.env.FEISHU_FOLDER_ID;
  console.log('   文件夹ID:', folderId);

  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/folders/${folderId}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！文档数量:', response.data.items?.length || 0);
    if (response.data.items?.length > 0) {
      console.log('   文档列表:');
      response.data.items.forEach((item, i) => {
        console.log(`   - ${i + 1}. ${item.name} (类型: ${item.type})`);
      });
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.status);
    console.log('   错误信息:', error.response?.data?.msg || error.message);

    // 如果是404，可能需要检查文件夹ID格式
    if (error.response?.status === 404) {
      console.log('\n💡 可能的解决方案:');
      console.log('   1. 检查文件夹ID是否正确');
      console.log('   2. 确认文件夹ID是文件夹类型，不是文档类型');
      console.log('   3. 尝试使用docx格式的文件夹ID');
    }
  }

  // 4. 尝试获取知识库中的所有文档
  console.log('\n4️⃣ 尝试获取知识库中的所有文档');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/drive/v1/metas?limit=100',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！资源数量:', response.data.data?.items?.length || 0);
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }
}

testWithPermissions();
