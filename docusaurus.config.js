// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Async Redux',
  tagline: 'Easy and Powerful State Management',
  favicon: 'img/favicon.ico',

  url: 'https://asyncredux.com',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config (only if using GitHub)
  organizationName: 'marcglasberg',
  projectName: 'asyncredux.com', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://https://github.com/marcglasberg/asyncredux.com/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://https://github.com/marcglasberg/asyncredux.com/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Async Redux',
        logo: {
          alt: 'My Site Logo',
          src: 'img/platypus128.png',

        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial (React)',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial (Flutter)',
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/marcglasberg/async-redux-react',
            label: 'GitHub React',
            position: 'right',
          },
          {
            href: 'https://github.com/marcglasberg/async_redux',
            label: 'GitHub Flutter',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial (React)',
                to: '/docs/intro',
              },
              {
                label: 'Tutorial (Flutter)',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'My links',
            items: [
              {
                label: 'Website',
                href: 'https://glasberg.dev',
              },
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/users/3411681/marcelo-glasberg',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/GlasbergMarcelo',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub React',
                href: 'https://github.com/marcglasberg/async-redux-react',
              },
              {
                label: 'GitHub Flutter',
                href: 'https://pub.dev/packages/async_redux',
              },
              {
                label: 'npm',
                href: 'https://www.npmjs.com/package/async-redux-react'
              },
              {
                label: 'pub.dev',
                href: 'https://pub.dev/packages/async_redux'
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
        copyright: `Copyright © 2024 Marcelo Glasberg`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
