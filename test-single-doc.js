#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testSingleDocument() {
  console.log('🔍 测试单个文档同步...\n');

  // 获取访问令牌
  const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
    app_id: process.env.FEISHU_APP_ID,
    app_secret: process.env.FEISHU_APP_SECRET,
  });
  const token = tokenResp.data.app_access_token;
  console.log('✅ 访问令牌获取成功\n');

  const docId = 'U2brdGDMNo8fqyxaBLwcq5ORnU0';
  console.log(`📄 测试文档ID: ${docId}\n`);

  // 测试1: 获取文档内容
  console.log('1️⃣ 获取文档内容 (doc/v2/doc/content)');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/doc/v2/doc/content?doc_id=${docId}&lang=zh-CN`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！');
    console.log('   文档标题:', response.data.data?.title || '未知');
    console.log('   文档类型:', response.data.data?.document?.type || '未知');
    console.log('   内容长度:', JSON.stringify(response.data.data).length, '字符');
  } catch (error) {
    console.log('❌ 失败:', error.response?.status);
    console.log('   错误信息:', error.response?.data?.msg || error.message);
    console.log('   完整错误:', JSON.stringify(error.response?.data, null, 2));
  }

  // 测试2: 获取文档元数据
  console.log('\n2️⃣ 获取文档元数据');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/doc/v2/documents/${docId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ 成功！');
    console.log('   文档信息:', JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  // 测试3: 尝试其他API
  console.log('\n3️⃣ 测试docx API');
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/content`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ docx API 成功！');
  } catch (error) {
    console.log('❌ docx API 失败:', error.response?.status, error.response?.data?.msg || error.message);
  }

  console.log('\n💡 结论:');
  console.log('   - 如果 doc/v2/doc/content 成功，说明可以使用该文档ID');
  console.log('   - 接下来可以运行: npm run docs:add U2brdGDMNo8fqyxaBLwcq5ORnU0');
}

testSingleDocument();
