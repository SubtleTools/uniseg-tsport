import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@tsports/uniseg',
  description: 'Unicode text segmentation for TypeScript - Complete port of rivo/uniseg with 100% API compatibility',
  base: '/uniseg/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Examples', link: '/guide/examples' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Functions', link: '/api/functions/' },
          { text: 'Types', link: '/api/interfaces/' },
          { text: 'Constants', link: '/api/variables/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tsports/uniseg' }
    ],

    editLink: {
      pattern: 'https://github.com/tsports/uniseg/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 tsports'
    }
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3c8772' }]
  ],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})