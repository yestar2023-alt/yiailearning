/**
 * 安全审计工具
 * 检查应用程序的安全配置和常见漏洞
 */

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  cwe?: string;
  owasp?: string;
}

export interface SecurityAuditReport {
  score: number;
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  issues: SecurityIssue[];
}

/**
 * 检查HTTP安全头部
 */
export function checkSecurityHeaders(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // 检查CSP
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!csp) {
    issues.push({
      severity: 'high',
      category: 'Headers',
      title: '缺少Content-Security-Policy头部',
      description: '未配置CSP头部，网站容易受到XSS攻击',
      recommendation: '在所有页面添加CSP头部，严格控制资源加载',
      cwe: 'CWE-79',
      owasp: 'A03:2021 - Injection',
    });
  }

  // 检查HTTPS
  if (location.protocol !== 'https:') {
    issues.push({
      severity: 'critical',
      category: 'Transport',
      title: '未使用HTTPS',
      description: '网站未启用HTTPS，数据传输未加密',
      recommendation: '立即启用HTTPS，确保所有连接使用TLS加密',
      cwe: 'CWE-319',
      owasp: 'A02:2021 - Cryptographic Failures',
    });
  }

  // 检查X-Content-Type-Options
  if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
    issues.push({
      severity: 'medium',
      category: 'Headers',
      title: '缺少X-Content-Type-Options头部',
      description: '未设置X-Content-Type-Options，浏览器可能进行MIME类型嗅探',
      recommendation: '添加X-Content-Type-Options: nosniff头部',
      cwe: 'CWE-116',
    });
  }

  return issues;
}

/**
 * 检查输入验证
 */
export function checkInputValidation(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const forms = document.querySelectorAll('form');

  forms.forEach((form, index) => {
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
      const type = input.getAttribute('type');
      const inputMode = input.getAttribute('inputmode');
      const autocomplete = input.getAttribute('autocomplete');

      // 检查密码字段
      if (type === 'password') {
        if (autocomplete !== 'new-password' && autocomplete !== 'current-password') {
          issues.push({
            severity: 'medium',
            category: 'Forms',
            title: '密码字段缺少autocomplete属性',
            description: '密码字段应设置适当的autocomplete属性',
            recommendation: '添加autocomplete="new-password"或autocomplete="current-password"',
            cwe: 'CWE-522',
          });
        }
      }

      // 检查邮箱字段
      if (type === 'email' && inputMode !== 'email') {
        issues.push({
          severity: 'low',
          category: 'Forms',
          title: '邮箱字段缺少inputmode属性',
          description: '邮箱字段应设置inputmode="email"以改善移动端体验',
          recommendation: '添加inputmode="email"属性',
        });
      }
    });
  });

  return issues;
}

/**
 * 检查第三方资源
 */
export function checkThirdPartyResources(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach((script) => {
    const src = script.getAttribute('src')!;
    const url = new URL(src, location.href);

    // 检查非HTTPS外部脚本
    if (url.protocol === 'http:' || url.hostname !== location.hostname) {
      if (url.protocol === 'http:') {
        issues.push({
          severity: 'critical',
          category: 'Third-Party',
          title: '使用HTTP外部脚本',
          description: `外部脚本 ${src} 使用不安全的HTTP协议`,
          recommendation: '所有外部资源应使用HTTPS协议',
          cwe: 'CWE-319',
          owasp: 'A02:2021 - Cryptographic Failures',
        });
      } else {
        issues.push({
          severity: 'medium',
          category: 'Third-Party',
          title: '外部脚本来源',
          description: `使用了外部脚本: ${src}`,
          recommendation: '验证外部脚本的安全性，考虑使用完整性验证',
          cwe: 'CWE-829',
        });
      }
    }

    // 检查完整性属性
    if (!script.hasAttribute('integrity')) {
      issues.push({
        severity: 'low',
        category: 'Third-Party',
        title: '缺少子资源完整性验证',
        description: `外部脚本 ${src} 未使用SRI验证`,
        recommendation: '为外部脚本添加integrity属性进行完整性验证',
        cwe: 'CWE-345',
      });
    }
  });

  const links = document.querySelectorAll('link[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href')!;
    const url = new URL(href, location.href);

    if (url.protocol === 'http:') {
      issues.push({
        severity: 'high',
        category: 'Third-Party',
        title: '使用HTTP外部资源',
        description: `外部资源 ${href} 使用不安全的HTTP协议`,
        recommendation: '所有外部资源应使用HTTPS协议',
        cwe: 'CWE-319',
      });
    }
  });

  return issues;
}

/**
 * 检查敏感信息泄露
 */
export function checkSensitiveInformation(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // 检查console.log
  const originalLog = console.log;
  let logCount = 0;

  console.log = function (...args) {
    logCount++;
    originalLog.apply(console, args);
  };

  // 模拟页面加载，检查开发者工具输出
  setTimeout(() => {
    console.log = originalLog;

    if (logCount > 0) {
      issues.push({
        severity: 'medium',
        category: 'Information',
        title: '控制台输出敏感信息',
        description: `发现 ${logCount} 个console.log调用，可能泄露敏感信息`,
        recommendation: '在生产环境中移除或禁用console.log输出',
        cwe: 'CWE-532',
      });
    }
  }, 1000);

  // 检查注释中的敏感信息
  const comments = document.querySelectorAll('*');
  comments.forEach((element) => {
    const text = element.textContent || '';
    const patterns = [
      /password\s*=\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i,
      /token\s*[:=]\s*['"][^'"]+['"]/i,
    ];

    patterns.forEach((pattern) => {
      if (pattern.test(text)) {
        issues.push({
          severity: 'high',
          category: 'Information',
          title: '注释中可能包含敏感信息',
          description: '在页面注释中发现类似敏感信息的文本',
          recommendation: '移除代码中的敏感信息，避免泄露密钥或密码',
          cwe: 'CWE-200',
          owasp: 'A01:2021 - Broken Access Control',
        });
      }
    });
  });

  return issues;
}

/**
 * 检查表单安全
 */
export function checkFormSecurity(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const forms = document.querySelectorAll('form');

  forms.forEach((form, index) => {
    const method = form.getAttribute('method')?.toLowerCase();
    const action = form.getAttribute('action');

    // 检查POST方法的HTTPS
    if (method === 'post' && action) {
      const url = new URL(action, location.href);
      if (url.protocol === 'http:' && location.protocol === 'https:') {
        issues.push({
          severity: 'critical',
          category: 'Forms',
          title: '表单通过HTTP提交敏感数据',
          description: '表单在HTTPS页面通过HTTP提交，敏感数据可能被窃取',
          recommendation: '确保所有表单提交使用HTTPS协议',
          cwe: 'CWE-319',
          owasp: 'A02:2021 - Cryptographic Failures',
        });
      }
    }

    // 检查CSRF保护
    if (method === 'post' && !form.querySelector('input[name*="csrf"], input[name*="token"]')) {
      issues.push({
        severity: 'medium',
        category: 'Forms',
        title: '缺少CSRF保护',
        description: 'POST表单未发现CSRF令牌，可能容易受到CSRF攻击',
        recommendation: '为所有POST表单添加CSRF令牌',
        cwe: 'CWE-352',
        owasp: 'A05:2021 - Security Misconfiguration',
      });
    }
  });

  return issues;
}

/**
 * 检查Cookie安全
 */
export function checkCookieSecurity(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  if (typeof document === 'undefined') return issues;

  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const [name, value] = cookie.split('=');

    // 检查敏感Cookie是否安全
    if (name.trim().includes('auth') || name.trim().includes('token')) {
      if (!cookie.includes('Secure') || !cookie.includes('HttpOnly')) {
        issues.push({
          severity: 'high',
          category: 'Cookies',
          title: '认证Cookie缺少安全标志',
          description: `Cookie "${name}" 缺少Secure或HttpOnly标志`,
          recommendation: '为认证相关Cookie添加Secure和HttpOnly标志',
          cwe: 'CWE-614',
          owasp: 'A07:2021 - Identification and Authentication Failures',
        });
      }
    }
  });

  return issues;
}

/**
 * 生成综合安全报告
 */
export function generateSecurityAudit(): SecurityAuditReport {
  const allIssues: SecurityIssue[] = [
    ...checkSecurityHeaders(),
    ...checkInputValidation(),
    ...checkThirdPartyResources(),
    ...checkSensitiveInformation(),
    ...checkFormSecurity(),
    ...checkCookieSecurity(),
  ];

  // 计算分数
  const weights = {
    critical: 50,
    high: 25,
    medium: 10,
    low: 5,
    info: 1,
  };

  const totalDeductions = allIssues.reduce(
    (sum, issue) => sum + (weights[issue.severity] || 0),
    0
  );

  const score = Math.max(0, 100 - totalDeductions);

  // 统计
  const stats = {
    critical: allIssues.filter((i) => i.severity === 'critical').length,
    high: allIssues.filter((i) => i.severity === 'high').length,
    medium: allIssues.filter((i) => i.severity === 'medium').length,
    low: allIssues.filter((i) => i.severity === 'low').length,
  };

  return {
    score,
    totalIssues: allIssues.length,
    ...stats,
    issues: allIssues,
  };
}

/**
 * 检查OWASP Top 10
 */
export function checkOWASPTop10(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // A01: Broken Access Control
  const protectedRoutes = document.querySelectorAll('[data-protected="true"]');
  if (protectedRoutes.length > 0) {
    // 这里应该检查访问控制逻辑
    // 实际实现需要根据具体应用
  }

  // A02: Cryptographic Failures
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    if (form.querySelector('input[type="password"]')) {
      const url = form.getAttribute('action');
      if (url && new URL(url, location.href).protocol === 'http:') {
        issues.push({
          severity: 'critical',
          category: 'OWASP',
          title: 'A02: Cryptographic Failures',
          description: '密码通过不安全的连接传输',
          recommendation: '确保密码等敏感数据通过HTTPS传输',
          owasp: 'A02:2021',
        });
      }
    }
  });

  // A03: Injection
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (src && new URL(src, location.href).protocol === 'http:') {
      issues.push({
        severity: 'high',
        category: 'OWASP',
        title: 'A03: Injection',
        description: '外部脚本通过不安全的连接加载',
        recommendation: '所有脚本应通过HTTPS加载',
        owasp: 'A03:2021',
      });
    }
  });

  return issues;
}
