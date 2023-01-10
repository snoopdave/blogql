module.exports = {
  'stories': [
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-jest',
  ],
  'framework': '@storybook/react',
  'core': {
    'builder': 'webpack5',
  },
  'webpackFinal': (config) => {
    config.resolve.fallback = {
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      'timers': require.resolve('timers-browserify'),
      'path': require.resolve('path-browserify'),
      'stream': require.resolve('stream-browserify'),
      'fs': false,
    };
    return config;
  }
}