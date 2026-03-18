#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testDifferentApis() {
  console.log('🔍 测试不同的API调用方式...\n');

  // 获取访问令牌
  const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET,
  });
  const token = tokenResp.data.app_access_token;
  console.log('✅ 访问令牌获取成功\n');

  // 测试1: 使用 docx API 获取文档
  console.log('1️⃣ 测试 docx API (docx/v1/documents)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/docx/v1/documents',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！文档数量:', response.data.data?.items?.length || 0);
    if (response.data.data?.items?.length > 0) {
      console.log('   文档列表:');
      response.data.data.items.slice(0, 5).forEach((doc, i) => {
        console.log(`   - ${i + 1}. ${doc.title} (ID: ${doc.doc_id})`);
      });
    }
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.code, error.response?.data?.msg || error.message);
  }

  // 测试2: 尝试获取指定文档的内容
  console.log('\n2️⃣ 测试获取指定文档内容');
  const testDocId = 'doccn_test'; // 使用一个测试ID
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/doc/v2/doc/content?doc_id=${testDocId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！');
  } catch (error) {
    console.log('❌ 文档不存在 (预期的):', error.response?.status);
  }

  // 测试3: 检查应用权限状态
  console.log('\n3️⃣ 检查应用权限状态');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/auth/v3/tenant/app_access_token',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！');
  } catch (error) {
    console.log('ℹ️ 可能需要tenant级别的权限:', error.response?.status);
  }

  // 测试4: 尝试使用搜索API
  console.log('\n4️⃣ 测试搜索API (search/v2/hubs)');
  try {
    const response = await axios.get(
      'https://open.feishu.cn/open-apis/search/v2/hubs',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！知识库数量:', response.data.data?.items?.length || 0);
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.code, error.response?.data?.msg || error.message);
  }

  console.log('\n💡 结论:');
  console.log('   - 如果 docx API 成功，说明可以使用文档列表');
  console.log('   - 如果搜索API失败，可能需要申请搜索权限');
  console.log('   - 建议：先使用 docx API 获取文档列表，然后手动添加文档ID进行同步');
}

testDifferentApis();
