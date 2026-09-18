// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const GITHUB_REPO = 'https://github.com/jaehoondata/VAI_worker_docs';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'VAI Worker Docs',
  tagline: 'VAI 팀 내부 문서',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages 배포 주소: https://jaehoondata.github.io/VAI_worker_docs/
  url: 'https://jaehoondata.github.io',
  baseUrl: '/VAI_worker_docs/',

  organizationName: 'jaehoondata',
  projectName: 'VAI_worker_docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: {label: '한국어', htmlLang: 'ko-KR'},
      en: {label: 'English', htmlLang: 'en-US'},
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // 각 페이지 하단 "이 페이지 편집하기" 링크가 이 주소로 연결됩니다.
          editUrl: `${GITHUB_REPO}/tree/main/`,
          // 번역된 페이지는 해당 언어 파일로 연결
          editLocalizedFiles: true,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          blogTitle: '업데이트',
          blogDescription: '문서 및 시스템 변경 사항 공지',
          blogSidebarTitle: '최근 글',
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `${GITHUB_REPO}/tree/main/`,
          editLocalizedFiles: true,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'VAI Worker Docs',
        logo: {
          alt: 'VAI Worker Docs',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: '문서',
          },
          {to: '/blog', label: '업데이트', position: 'left'},
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: GITHUB_REPO,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '문서',
            items: [
              {label: '시작하기', to: '/docs/intro'},
              {label: 'Meta Quest 3', to: '/docs/meta-quest-3/overview'},
              {label: 'AI WORKER', to: '/docs/ai-worker/overview'},
              {label: '문서 기여 방법', to: '/docs/contributing'},
            ],
          },
          {
            title: '팀',
            items: [
              {label: 'GitHub 저장소', href: GITHUB_REPO},
              {label: '이슈 등록', href: `${GITHUB_REPO}/issues`},
            ],
          },
          {
            title: '더 보기',
            items: [
              {label: '업데이트', to: '/blog'},
              {label: 'Docusaurus 문서', href: 'https://docusaurus.io/'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VAI. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'python'],
      },
    }),
};

export default config;
