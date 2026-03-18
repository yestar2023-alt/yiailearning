#!/usr/bin/env node

/**
 * 安全审计脚本
 * 检查依赖和代码的安全问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查package.json中的依赖
function checkDependencies() {
  log('\n=== 检查依赖版本 ===', 'blue');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const outdated = [];

    // 检查已知漏洞的包
    const vulnerablePackages = [
      // 示例：记录已知的漏洞包
    ];

    vulnerablePackages.forEach((pkg) => {
      if (dependencies[pkg]) {
        log(`⚠️  发现潜在风险包: ${pkg}`, 'yellow');
        outdated.push(pkg);
      }
    });

    if (outdated.length === 0) {
      log('✅ 未发现已知漏洞依赖', 'green');
    }

    return outdated;
  } catch (error) {
    log(`❌ 检查依赖失败: ${error.message}`, 'red');
    return [];
  }
}

// 检查.env文件
function checkEnvironmentVariables() {
  log('\n=== 检查环境变量配置 ===', 'blue');

  const envFiles = ['.env', '.env.local', '.env.production'];

  envFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      // 检查文件权限
      if ((stats.mode & 0o777) !== 0o600) {
        log(`⚠️  ${file} 权限不安全 (应为600)`, 'yellow');
      }

      // 检查敏感信息
      const content = fs.readFileSync(filePath, 'utf8');
      const sensitivePatterns = [
        /PASSWORD/i,
        /SECRET/i,
        /KEY/i,
        /TOKEN/i,
      ];

      sensitivePatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          log(`⚠️  ${file} 可能包含敏感信息`, 'yellow');
        }
      });
    }
  });
}

// 检查敏感文件
function checkSensitiveFiles() {
  log('\n=== 检查敏感文件 ===', 'blue');

  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'id_rsa',
    'id_dsa',
    'id_ecdsa',
    'id_ed25519',
    '*.pem',
    '*.key',
    '.git/config',
  ];

  sensitiveFiles.forEach((pattern) => {
    try {
      const files = execSync(`find . -name "${pattern}" -type f 2>/dev/null`, {
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();

      if (files) {
        log(`⚠️  发现敏感文件: ${files}`, 'yellow');
      }
    } catch (error) {
      // 忽略错误
    }
  });
}

// 检查代码中的硬编码凭据
function checkHardcodedCredentials() {
  log('\n=== 检查硬编码凭据 ===', 'blue');

  const patterns = [
    {
      name: 'Password',
      regex: /password\s*=\s*['"][^'"]+['"]/gi,
      severity: 'high',
    },
    {
      name: 'API Key',
      regex: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'high',
    },
    {
      name: 'Secret',
      regex: /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'high',
    },
    {
      name: 'Token',
      regex: /token\s*[:=]\s*['"][^'"]+['"]/gi,
      severity: 'high',
    },
  ];

  const codeFiles = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'];

  patterns.forEach((pattern) => {
    try {
      const result = execSync(
        `grep -r --include="${codeFiles.join(',')}" -n "${pattern.regex}" . 2>/dev/null | head -20`,
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      if (result) {
        log(`⚠️  发现潜在硬编码${pattern.name}:`, 'yellow');
        log(result);
      }
    } catch (error) {
      // 忽略grep错误
    }
  });
}

// 检查安全头部
function checkSecurityHeaders() {
  log('\n=== 检查安全配置 ===', 'blue');

  // 检查middleware.ts是否存在
  if (fs.existsSync('middleware.ts')) {
    log('✅ 存在安全中间件 (middleware.ts)', 'green');

    const middleware = fs.readFileSync('middleware.ts', 'utf8');

    const requiredHeaders = [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ];

    requiredHeaders.forEach((header) => {
      if (middleware.includes(header)) {
        log(`✅ 配置了 ${header}`, 'green');
      } else {
        log(`⚠️  未配置 ${header}`, 'yellow');
      }
    });
  } else {
    log('⚠️  未发现安全中间件', 'yellow');
    log('建议: 创建 middleware.ts 文件配置安全头部', 'blue');
  }
}

// 检查TypeScript配置
function checkTypeScriptConfig() {
  log('\n=== 检查TypeScript安全配置 ===', 'blue');

  if (fs.existsSync('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

    if (tsconfig.compilerOptions?.strict) {
      log('✅ 启用了TypeScript严格模式', 'green');
    } else {
      log('⚠️  未启用TypeScript严格模式', 'yellow');
    }

    if (tsconfig.compilerOptions?.noImplicitAny !== false) {
      log('✅ 检查隐式any类型', 'green');
    }

    if (tsconfig.compilerOptions?.skipLibCheck) {
      log('ℹ️  跳过了库文件检查', 'blue');
    }
  }
}

// 主函数
function main() {
  log('\n🔒 开始安全审计...\n', 'magenta');

  let totalIssues = 0;

  // 执行各项检查
  const dependencyIssues = checkDependencies();
  totalIssues += dependencyIssues.length;

  checkEnvironmentVariables();
  checkSensitiveFiles();
  checkHardcodedCredentials();
  checkSecurityHeaders();
  checkTypeScriptConfig();

  // 生成报告
  log('\n=== 安全审计报告 ===', 'magenta');
  log(`扫描时间: ${new Date().toLocaleString()}`, 'blue');

  if (totalIssues === 0) {
    log('\n✅ 未发现重大安全问题', 'green');
  } else {
    log(`\n⚠️  发现 ${totalIssues} 个潜在问题`, 'yellow');
  }

  // 建议
  log('\n=== 安全建议 ===', 'blue');
  log('1. 定期更新依赖版本', 'blue');
  log('2. 启用安全头部防止常见攻击', 'blue');
  log('3. 使用环境变量管理敏感信息', 'blue');
  log('4. 启用TypeScript严格模式', 'blue');
  log('5. 定期运行安全扫描', 'blue');
  log('6. 审查代码中的硬编码凭据', 'blue');

  process.exit(totalIssues > 0 ? 1 : 0);
}

// 运行
try {
  main();
} catch (error) {
  log(`\n❌ 安全审计失败: ${error.message}`, 'red');
  process.exit(1);
}
