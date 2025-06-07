module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic', // This fixes the JSX transform warning
        },
      },
    ],
  ],
}