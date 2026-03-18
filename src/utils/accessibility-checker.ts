/**
 * 可访问性检查工具
 * 检查常见可访问性问题并提供修复建议
 */

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  element: string;
  message: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface AccessibilityReport {
  totalIssues: number;
  errors: number;
  warnings: number;
  score: number;
  issues: AccessibilityIssue[];
}

/**
 * 检查图片alt属性
 */
export function checkImages(images: NodeListOf<Element>): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  images.forEach((img, index) => {
    const alt = img.getAttribute('alt');
    const src = img.getAttribute('src');
    const isDecorative = img.getAttribute('aria-hidden') === 'true';

    // 缺少alt属性
    if (!alt && !isDecorative) {
      issues.push({
        type: 'error',
        element: `img[${src || index}]`,
        message: '图片缺少alt属性',
        suggestion: '为所有有意义的图片添加描述性的alt属性，为装饰性图片使用alt=""或aria-hidden="true"',
        wcagLevel: 'A',
      });
    }

    // alt属性为空但图片有src
    if (alt === '' && src && !isDecorative) {
      issues.push({
        type: 'warning',
        element: `img[${src}]`,
        message: '图片alt属性为空',
        suggestion: '确认该图片是否为装饰性图片，如果是应使用alt=""或aria-hidden="true"',
        wcagLevel: 'AA',
      });
    }

    // alt属性过长
    if (alt && alt.length > 125) {
      issues.push({
        type: 'warning',
        element: `img[${src}]`,
        message: 'alt属性过长',
        suggestion: 'alt属性应简洁明了，避免超过125个字符',
        wcagLevel: 'AA',
      });
    }
  });

  return issues;
}

/**
 * 检查颜色对比度
 */
export function checkColorContrast(
  element: Element,
  foreground: string,
  background: string
): AccessibilityIssue | null {
  // 简化的颜色对比度检查
  // 实际应用中应使用更专业的工具如axe-core
  const ratio = calculateContrastRatio(foreground, background);

  // WCAG AA标准：4.5:1 (普通文本), 3:1 (大文本)
  if (ratio < 3) {
    return {
      type: 'error',
      element: element.tagName,
      message: `颜色对比度不足: ${ratio.toFixed(2)}:1`,
      suggestion: '确保文本与背景的对比度至少达到4.5:1 (AA级别)或7:1 (AAA级别)',
      wcagLevel: 'AA',
    };
  }

  if (ratio < 4.5) {
    return {
      type: 'warning',
      element: element.tagName,
      message: `颜色对比度较低: ${ratio.toFixed(2)}:1`,
      suggestion: '建议提高颜色对比度以符合WCAG AA标准',
      wcagLevel: 'AA',
    };
  }

  return null;
}

/**
 * 计算颜色对比度
 */
function calculateContrastRatio(foreground: string, background: string): number {
  // 简化实现 - 实际应使用专业颜色库
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  // 简化的亮度计算
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const normalized = c / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 检查键盘导航支持
 */
export function checkKeyboardNavigation(
  interactiveElements: NodeListOf<Element>
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  interactiveElements.forEach((element, index) => {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');

    // 检查是否可聚焦
    const isFocusable =
      element.hasAttribute('tabindex') ||
      ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);

    if (!isFocusable && tagName !== 'a' && tagName !== 'button') {
      // 非焦点元素的onClick处理
      if (element.hasAttribute('onclick')) {
        issues.push({
          type: 'warning',
          element: `${tagName}[onclick]`,
          message: '可交互元素缺少焦点支持',
          suggestion: '添加tabindex="0"或使用语义化HTML元素 (button, a)',
          wcagLevel: 'A',
        });
      }
    }

    // 检查ARIA角色
    if (!element.getAttribute('role') && !['a', 'button', 'input'].includes(tagName)) {
      if (element.hasAttribute('onclick') || element.hasAttribute('onkeydown')) {
        issues.push({
          type: 'info',
          element: tagName,
          message: '建议添加ARIA role',
          suggestion: '为自定义交互元素添加适当的ARIA role属性',
          wcagLevel: 'AA',
        });
      }
    }
  });

  return issues;
}

/**
 * 检查表单可访问性
 */
export function checkFormAccessibility(form: HTMLFormElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // 检查所有input
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach((input) => {
    const formControl = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const id = input.id;
    const label = form.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');

    // 缺少标签
    if (!label && !ariaLabel && !ariaLabelledBy) {
      const type = input.getAttribute('type') || 'input';
      issues.push({
        type: 'error',
        element: `${input.tagName.toLowerCase()}[type="${type}"]`,
        message: '表单控件缺少标签',
        suggestion: '为所有表单控件添加label标签、aria-label或aria-labelledby',
        wcagLevel: 'A',
      });
    }

    // 缺少描述
    if (input.hasAttribute('aria-required') || formControl.required) {
      const description = form.querySelector(`#${id}-description`);
      if (!description && !input.getAttribute('aria-describedby')) {
        issues.push({
          type: 'warning',
          element: `${input.tagName.toLowerCase()}[required]`,
          message: '必填字段缺少说明',
          suggestion: '为必填字段添加说明文字（使用aria-describedby）',
          wcagLevel: 'AA',
        });
      }
    }

    // 错误状态
    if (input.hasAttribute('aria-invalid')) {
      const errorId = input.getAttribute('aria-describedby');
      if (errorId) {
        const errorElement = form.querySelector(`#${errorId}`);
        if (!errorElement) {
          issues.push({
            type: 'error',
            element: `${input.tagName.toLowerCase()}[aria-invalid]`,
            message: '错误信息缺失',
            suggestion: '确保错误信息元素存在且可被屏幕阅读器访问',
            wcagLevel: 'AA',
          });
        }
      }
    }
  });

  return issues;
}

/**
 * 检查heading结构
 */
export function checkHeadingStructure(headings: NodeListOf<Element>): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headingLevels: number[] = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    headingLevels.push(level);

    // 检查是否为空
    const text = heading.textContent?.trim();
    if (!text) {
      issues.push({
        type: 'error',
        element: `h${level}`,
        message: '标题内容为空',
        suggestion: '确保所有标题都有描述性内容',
        wcagLevel: 'A',
      });
    }

    // 检查跳级
    if (index > 0) {
      const prevLevel = headingLevels[index - 1];
      if (level > prevLevel + 1) {
        issues.push({
          type: 'warning',
          element: `h${level}`,
          message: `标题级别跳级 (h${prevLevel} → h${level})`,
          suggestion: '建议按顺序使用标题级别，避免跳级',
          wcagLevel: 'AA',
        });
      }
    }
  });

  return issues;
}

/**
 * 检查链接文本
 */
export function checkLinkText(links: NodeListOf<Element>): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  links.forEach((link) => {
    const text = link.textContent?.trim();
    const ariaLabel = link.getAttribute('aria-label');
    const title = link.getAttribute('title');

    // 空链接文本
    if (!text && !ariaLabel && !title) {
      issues.push({
        type: 'error',
        element: 'a[href]',
        message: '链接缺少可访问名称',
        suggestion: '为所有链接添加描述性文本或aria-label',
        wcagLevel: 'A',
      });
    }

    // 通用链接文本
    const genericTexts = ['点击这里', '这里', '更多', '查看'];
    if (genericTexts.includes(text || '')) {
      issues.push({
        type: 'warning',
        element: `a[text="${text}"]`,
        message: '链接文本过于通用',
        suggestion: '使用更具体的链接文本来描述目标内容',
        wcagLevel: 'AA',
      });
    }
  });

  return issues;
}

/**
 * 检查ARIA属性
 */
export function checkAriaAttributes(elements: NodeListOf<Element>): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  elements.forEach((element) => {
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaHidden = element.getAttribute('aria-hidden');

    // 缺少标签但有role
    if (role && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        type: 'warning',
        element: `[role="${role}"]`,
        message: `Role="${role}"元素缺少标签`,
        suggestion: '为具有role的元素添加aria-label或aria-labelledby',
        wcagLevel: 'AA',
      });
    }

    // aria-hidden和focusable冲突
    if (ariaHidden === 'true') {
      const tabindex = element.getAttribute('tabindex');
      if (tabindex === '0' || tabindex === '') {
        issues.push({
          type: 'error',
          element: `[aria-hidden="true"]`,
          message: 'aria-hidden="true"元素不可聚焦',
          suggestion: '确保aria-hidden="true"的元素不可通过键盘访问',
          wcagLevel: 'A',
        });
      }
    }
  });

  return issues;
}

/**
 * 生成可访问性报告
 */
export function generateAccessibilityReport(
  checks: Record<string, AccessibilityIssue[]>
): AccessibilityReport {
  const allIssues = Object.values(checks).flat();
  const errors = allIssues.filter((issue) => issue.type === 'error').length;
  const warnings = allIssues.filter((issue) => issue.type === 'warning').length;

  // 计算分数 (错误-50分，警告-20分)
  const maxScore = 100;
  const deductions = errors * 50 + warnings * 20;
  const score = Math.max(0, maxScore - deductions);

  return {
    totalIssues: allIssues.length,
    errors,
    warnings,
    score,
    issues: allIssues,
  };
}

/**
 * 批量检查页面可访问性
 */
export function performAccessibilityAudit(document: Document): AccessibilityReport {
  const checks: Record<string, AccessibilityIssue[]> = {};

  // 图片检查
  const images = document.querySelectorAll('img');
  checks.images = checkImages(images);

  // 链接检查
  const links = document.querySelectorAll('a');
  checks.links = checkLinkText(links);

  // 标题检查
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  checks.headings = checkHeadingStructure(headings);

  // 表单检查
  const forms = document.querySelectorAll('form');
  checks.forms = Array.from(forms).flatMap((form) => checkFormAccessibility(form as HTMLFormElement));

  // 交互元素检查
  const interactiveElements = document.querySelectorAll('[onclick], [onkeydown]');
  checks.keyboard = checkKeyboardNavigation(interactiveElements);

  // ARIA检查
  const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby]');
  checks.aria = checkAriaAttributes(ariaElements);

  return generateAccessibilityReport(checks);
}
