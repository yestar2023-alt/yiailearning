/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B8955E", // 柔和琥珀金 - 温暖不刺眼
          hover: "#9A7A4A", // 深琥珀金
          light: "#D4B896", // 浅琥珀金
          dark: "#7A6340", // 暗琥珀金
        },
        accent: {
          DEFAULT: "#A68B5B", // 棕金色 - 优雅点缀
          hover: "#8A7350", // 深棕金
          soft: "#F5EFE6", // 浅米色背景
          dark: "#C4A97A", // 亮棕金
        },
        background: {
          light: "#FAFAFA", // 纯净浅灰白
          dark: "#0F172A", // Slate 900
        },
        card: {
          light: "#FFFFFF", // 纯白卡片
          dark: "#1E293B", // Slate 800
        },
        text: {
          main: {
            light: "#0F172A", // Slate 900
            dark: "#F1F5F9", // Slate 100
          },
          sub: {
            light: "#64748B", // Slate 500
            dark: "#94A3B8", // Slate 400
          },
        },
        secondary: {
          DEFAULT: "#64748B", // Slate 500
          light: "#94A3B8", // Slate 400
          dark: "#475569", // Slate 600
        },
        subtle: {
          DEFAULT: "#E2E8F0", // Slate 200 - 边框
          dark: "#334155", // Slate 700
        },
        muted: {
          DEFAULT: "#F1F5F9", // Slate 100 - 淡背景
          dark: "#1E293B", // Slate 800
        },
      },
      fontFamily: {
        display: [
          "'Source Han Sans SC'",
          "'PingFang SC'",
          "'Microsoft YaHei'",
          "'Noto Sans CJK SC'",
          "sans-serif",
        ],
        body: [
          "'Source Han Sans SC'",
          "'PingFang SC'",
          "'Microsoft YaHei'",
          "'Noto Sans CJK SC'",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 20px 50px -30px rgba(15, 23, 42, 0.12), 0 8px 20px -10px rgba(15, 23, 42, 0.08)',
        'glow': '0 0 30px rgba(184, 149, 94, 0.2), 0 0 60px rgba(184, 149, 94, 0.1)',
        'card': '0 18px 45px -32px rgba(15, 23, 42, 0.1), 0 4px 12px -6px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 28px 60px -34px rgba(15, 23, 42, 0.15), 0 12px 24px -8px rgba(184, 149, 94, 0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(184, 149, 94, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(184, 149, 94, 0.35)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
