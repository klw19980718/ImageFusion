.
├── app/                     # Next.js App Router 核心目录
│   ├── layout.tsx       # Root application layout
│   ├── page.tsx         # Root application page (often for redirection)
│   ├── globals.css      # Global CSS styles
│   ├── sitemap.ts       # Sitemap generation logic
│   └── [locale]/            # 动态路由段，处理国际化 (e.g., /en, /zh)
│       ├── layout.tsx       # 当前语言环境的根布局 (包含 Navbar, Footer, 全局 Providers)
│       ├── page.tsx         # 当前语言环境的主页 (/)
│       ├── ClientProviders.tsx # 客户端 Context Providers 包装器
│       ├── blog/            # 博客相关页面
│       │   ├── page.tsx     # 博客文章列表页
│       │   └── [slug]/      # 动态博客文章页面
│       │       └── page.tsx # 单个博客文章详情页
│       ├── profile/         # 用户个人资料页面 (或相关页面)
│       ├── privacy/         # 隐私政策页面
│       │   └── page.tsx     # 隐私政策内容展示页
│       ├── sign-in/         # 登录页面
│       │   └── page.tsx     # 登录表单及逻辑页
│       ├── sign-up/         # 注册页面
│       │   └── page.tsx     # 注册表单及逻辑页
│       └── terms/           # 服务条款页面
│            └── page.tsx     # 服务条款内容展示页
│       
├── components/              # 可复用的 UI 组件
│   ├── Navbar.tsx           # 网站顶部导航栏
│   ├── ComparisonSlider.tsx # 图片对比滑块组件
│   ├── Footer.tsx           # 网站底部页脚
│   ├── PricingSection.tsx   # 价格方案展示区域组件
│   ├── payment-status-modal.tsx # 支付状态反馈模态框
│   ├── auth/                # 认证相关组件
│   │   └── auth-button.tsx  # 根据登录状态显示不同操作（登录/注册/用户菜单）的按钮
│   └── ui/                  # ( Shadcn/ui) 基础 UI 元素 (Button, Dropdown, Sheet 等)
│       └── (...)
├── lib/                     # 工具函数、辅助模块、第三方服务集成等
│   └── (supabase, utils).ts # (可能包含) Supabase 客户端配置、通用工具函数等
├── messages/                # 国际化 (i18n) 语言资源文件
│   ├── en.json              # 英语翻译
│   └── zh.json              # 简体中文翻译
├── public/                  # 静态资源文件 (会被直接伺服)
│   ├── examples/            # ComparisonSlider 使用的示例图片
│   └── (...)                # 其他图片、图标 (favicon) 等
├── .env.local               # 本地环境变量 (API 密钥等，不应提交到 Git)
├── .gitignore               # Git 忽略配置
├── middleware.ts            # Next.js 中间件 (可能用于处理国际化路由重定向)
├── next.config.mjs          # Next.js 配置文件 (构建选项、插件、i18n 配置等)
├── package.json             # 项目依赖和脚本配置
├── README.md                # 项目说明文档
└── tsconfig.json            # TypeScript 配置文件



app/[locale]: 项目的核心路由结构。利用 Next.js App Router 的特性，通过 [locale] 动态段实现国际化。每个子目录（如 blog, profile）代表一个页面或一组页面。
layout.tsx: 定义了该语言环境下所有页面的通用结构，通常包含导航栏、页脚和全局状态提供者（Providers）。
page.tsx: 代表该路由段的具体页面内容。例如 app/[locale]/page.tsx 是首页，app/[locale]/blog/page.tsx 是博客列表页。
ClientProviders.tsx: 用于封装需要在客户端运行的 Context Provider，例如 next-intl 的 Provider。
sitemap.ts: 用于生成网站地图 (sitemap.xml)，帮助搜索引擎发现和索引网站内容。
globals.css: 定义全局 CSS 样式，通常在此文件中引入 Tailwind CSS 或其他基础样式，并定义全局自定义样式。
app/layout.tsx: 应用程序的根布局。定义 <html> 和 <body> 标签，加载全局 CSS、字体，并设置全局元数据和脚本。
app/page.tsx: 应用程序的根页面 (对应 `/` 路径)。通常用于重定向到默认语言环境或显示通用入口点。
components: 存放所有可复用的界面组件，提高代码复用性和可维护性。
ui/: 通常存放基于 UI 库（如 Shadcn/ui）生成的基础组件。
auth/: 专门存放与用户认证流程相关的组件。
lib: 存放非组件类的辅助代码，如工具函数、API 请求逻辑、数据库客户端初始化等。
messages: 存放不同语言的翻译文本，供 next-intl 或类似库使用。
public: 存放可以直接通过 URL 访问的静态文件，如图片、字体、favicon 等。
middleware.ts: 在请求到达页面之前执行的逻辑，常用于处理认证、重定向、或根据用户偏好设置 locale。
next.config.mjs: Next.js 项目的配置文件，用于配置构建选项、环境变量、图像优化、国际化路由等。
package.json: Node.js 项目的标准配置文件，定义项目元数据、依赖项和可执行脚本（如 dev, build, start）。
tsconfig.json: TypeScript 编译器配置文件，定义编译选项和规则。


<!-- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YXdhaXRlZC1zY29ycGlvbi03MS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_PllyFoUqkQKzNQytPlj8kD31cyeI1Z0UrVbH4qyfpj
NEXT_PUBLIC_SITE_URL=https://framepola.com -->