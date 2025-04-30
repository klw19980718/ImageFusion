/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        playfair: ['var(--font-playfair)'],
        inter: ['var(--font-inter)'],
        fredoka: ['var(--font-fredoka)'],
        baloo: ['var(--font-baloo)'],
        nunito: ['var(--font-nunito)']
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFDF5", // 主背景色，柔和奶油白
        foreground: "#212121", // 标题文本，深灰色
        primary: {
          DEFAULT: "#FF6B6B", // 主按钮色，樱桃红
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFD93D", // 次按钮色，明黄色
          foreground: "#212121",
        },
        destructive: {
          DEFAULT: "#E63946", // 错误色
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#EAEAEA", // 边框色
          foreground: "#4E4E4E", // 正文文本
        },
        accent: {
          DEFAULT: "#FFFFFF", // 卡片背景
          foreground: "#212121",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        info: "#3A86FF", // 信息色
        success: "#32CD32", // 成功色
        warning: "#FFA500", // 警告色
        error: "#E63946", // 错误色
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'custom': 'rgba(0, 0, 0, 0.08) 0px 4px 12px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} 