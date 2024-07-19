// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Async Redux',
  tagline: 'An Unofficial Reimagining of Redux',
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
          path: 'react',
          routeBasePath: 'react',
          sidebarPath: './sidebarsReact.js',

          // Please change this to your repo. Remove this to remove the "edit this page" links.
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo. Remove this to remove the "edit this page" links.
          editUrl: undefined,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'flutter',
        path: 'flutter',
        routeBasePath: 'flutter',
        sidebarPath: './sidebarsFlutter.js',
      },
    ],
  ],

  themeConfig:
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/logo.svg',
      metadata: [
        {name: 'description', content: 'The modern version of Redux. State management that\'s simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.'},
        {name: 'og:title', content: 'Async Redux'},
        {name: 'og:description', content: 'by Marcelo Glasberg'},
        {name: 'og:url', content: 'https://asyncredux.com'},
        {name: 'og:image', content: 'https://asyncredux.com/img/platipus_FlutterReact.jpg'},
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'twitter:title', content: 'Async Redux'},
        {name: 'twitter:description', content: 'The modern version of Redux. State management that\'s simple to learn and easy to use; Powerful enough to handle complex applications with millions of users; Testable.'},
        {name: 'twitter:image', content: 'https://asyncredux.com/img/platipus_FlutterReact.jpg'},
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
            label: 'For React',
            href: '/react/intro',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'For Flutter',
            href: '/flutter/intro',
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
                label: 'For React',
                to: '/flutter/intro',

              },
              {
                label: 'For Flutter',
                to: '/react/intro',
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
