// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Async Redux | Flutter',
  tagline: 'State Management',
  favicon: 'img/favicon.ico',
  customFields: {
    subTagline: 'On pub.dev since August 2019',
  },

  url: 'https://asyncredux.com',
  baseUrl: '/',

  // GitHub pages deployment config
  organizationName: 'marcglasberg',
  projectName: 'asyncredux.com',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: '/img/docusaurus.png',
      },
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'flutter',
          routeBasePath: 'flutter',
          sidebarPath: './sidebarsFlutter.js',
          editUrl: undefined,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/flutter.svg',
      metadata: [
        {
          name: 'description',
          content: 'State management for Flutter that is simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.'
        },
        { name: 'og:title', content: 'Async Redux for Flutter' },
        { name: 'og:description', content: 'by Marcelo Glasberg' },
        { name: 'og:url', content: 'https://asyncredux.com' },
        { name: 'og:image', content: 'https://asyncredux.com/img/LandscapeLake.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Async Redux for Flutter' },
        {
          name: 'twitter:description',
          content: 'State management for Flutter that is simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.'
        },
        { name: 'twitter:image', content: 'https://asyncredux.com/img/LandscapeLake.jpg' },
      ],
      navbar: {
        title: 'Async Redux',
        logo: {
          alt: 'Async Redux Logo',
          src: 'img/platypus128.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Get Started',
            href: '/flutter/intro',
          },
          {
            href: 'https://github.com/marcglasberg/async_redux',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Async Redux',
            items: [
              {
                label: 'pub.dev',
                href: 'https://pub.dev/packages/async_redux'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/marcglasberg/async_redux',
              }
            ],
          },
          {
            title: 'My links',
            items: [
              {
                label: 'Personal website',
                href: 'https://glasberg.dev',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/marcglasberg/',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/users/3411681/marcelo-glasberg',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/GlasbergMarcelo',
              },
              {
                label: 'Flutter packages',
                href: 'https://pub.dev/publishers/glasberg.dev/packages',
              },
              {
                label: 'React packages',
                href: 'https://www.npmjs.com/settings/marcglasberg/packages',
              },
            ],
          },
          {
            title: 'More from me',
            items: [
              {
                label: 'Kiss State for React',
                href: 'https://kissforreact.org/',
              },
              {
                "label": "Bloc Superpowers",
                "href": "https://blocsuperpowers.org"
              },
              {
                label: 'Translate your Flutter app',
                href: 'https://medium.com/flutter-community/i18n-extension-flutter-b966f4c65df9'
              },
              {
                label: 'Fast Immutable Collections',
                href: 'https://medium.com/flutter-community/announcing-fic-fast-immutable-collections-5eb091d1e31f'
              },
              {
                label: 'Easy Themes',
                href: 'https://medium.com/flutter-community/flutter-the-advanced-layout-rule-even-beginners-must-know-edc9516d1a2'
              },
              {
                label: 'The Advanced Layout Rule',
                href: 'https://medium.com/flutter-community/the-new-way-to-create-themes-in-your-flutter-app-7fdfc4f3df5f'
              }
            ],
          },
        ],
        logo: {
          alt: 'Async Redux Logo',
          src: 'img/platypus128.png',
          width: 64,
          height: 64,
        },
        copyright: `Copyright © 2024 Marcelo Glasberg<br>Async Redux is a reimagining of Redux and is not affiliated with the original Redux authors`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['dart'],
      },
    }),
};

export default config;
