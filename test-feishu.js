#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function testAll() {
  console.log('🔍 测试飞书 API 连接...\n');

  // 1. 测试访问令牌
  console.log('1️⃣ 获取访问令牌...');
  try {
    const tokenResp = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET,
    });
    console.log('✅ 访问令牌获取成功');
    console.log('   过期时间:', tokenResp.data.expire, '秒\n');
    var accessToken = tokenResp.data.app_access_token;
  } catch (error) {
    console.error('❌ 访问令牌获取失败:', error.response?.data || error.message);
    return;
  }

  // 2. 测试文档内容API
  console.log('2️⃣ 测试文档内容API...');
  try {
    // 先用示例文档ID测试
    const testDocId = 'doccn_test';
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/doc/v2/doc/content?doc_id=${testDocId}&lang=zh-CN`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('✅ 文档内容API可用\n');
  } catch (error) {
    console.log('ℹ️  测试文档不存在 (预期的)\n');
  }

  // 3. 测试文件夹API
  console.log('3️⃣ 测试文件夹API...');
  const folderId = process.env.FEISHU_FOLDER_ID;
  console.log('   文件夹ID:', folderId);

  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/drive/v1/folders/${folderId}/children`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('✅ 文件夹访问成功！');
    console.log('   文档数量:', response.data.items?.length || 0);
    console.log('   响应数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ 文件夹访问失败');
    console.error('   状态码:', error.response?.status);
    console.error('   错误信息:', JSON.stringify(error.response?.data, null, 2));
  }
}

testAll();
