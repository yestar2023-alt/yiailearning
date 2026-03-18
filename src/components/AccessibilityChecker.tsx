'use client';

import { useState, useEffect } from 'react';
import { performAccessibilityAudit, AccessibilityReport } from '@/utils/accessibility-checker';

/**
 * 可访问性检查器组件
 * 自动检测并显示页面的可访问性问题
 */
export function AccessibilityChecker() {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runAudit = async () => {
    setIsLoading(true);

    try {
      // 模拟异步检查过程
      await new Promise((resolve) => setTimeout(resolve, 500));

      const auditResult = performAccessibilityAudit(document);
      setReport(auditResult);
    } catch (error) {
      console.error('可访问性检查失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 组件挂载时自动运行检查
    runAudit();
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="检查可访问性"
        title="检查可访问性"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 面板 */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="accessibility-title" className="text-xl font-bold">
            可访问性检查
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="关闭"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">正在检查...</p>
            </div>
          ) : report ? (
            <>
              {/* 分数 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{report.score}/100</span>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${report.score >= 90
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : report.score >= 70
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                  >
                    {report.score >= 90 ? '优秀' : report.score >= 70 ? '良好' : '需改进'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${report.score >= 90
                        ? 'bg-green-600'
                        : report.score >= 70
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                    style={{ width: `${report.score}%` }}
                  />
                </div>
              </div>

              {/* 统计 */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-red-600">{report.errors}</div>
                  <div className="text-xs text-red-700 dark:text-red-300">错误</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-yellow-600">{report.warnings}</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">警告</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">{report.totalIssues}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">总计</div>
                </div>
              </div>

              {/* 问题列表 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  发现的问题 ({report.totalIssues})
                </h3>

                {report.issues.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>未发现可访问性问题！</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {report.issues.map((issue, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border-l-4 ${issue.type === 'error'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : issue.type === 'warning'
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`flex-shrink-0 mt-0.5 ${issue.type === 'error'
                                ? 'text-red-600'
                                : issue.type === 'warning'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                              }`}
                            aria-hidden="true"
                          >
                            {issue.type === 'error' ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {issue.element}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {issue.message}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              <strong>建议:</strong> {issue.suggestion}
                            </div>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                WCAG {issue.wcagLevel}
                              </span>
                              <span
                                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs ${issue.type === 'error'
                                    ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'
                                    : issue.type === 'warning'
                                      ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200'
                                      : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
                                  }`}
                              >
                                {issue.type === 'error' ? '错误' : issue.type === 'warning' ? '警告' : '信息'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 重新检查按钮 */}
              <button
                onClick={runAudit}
                className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                重新检查
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              点击&quot;重新检查&quot;开始分析
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 可访问性检查按钮组件
 * 快速触发检查
 */
export function AccessibilityCheckButton() {
  const [showChecker, setShowChecker] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChecker(true)}
        className="fixed bottom-20 right-4 z-40 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="检查可访问性"
        title="检查页面可访问性"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {showChecker && <AccessibilityChecker />}
    </>
  );
}
