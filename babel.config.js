const aliasPlugin = [
  [
    require.resolve('babel-plugin-module-resolver'),
    {
      root: ['./src/'],
      alias: {
        api: './src/api',
        components: './src/components',
        globals: './src/globals',
        hooks: './src/hooks',
        interface: './src/interface',
        navigation: './src/navigation',
        screens: './src/screens',
      },
    },
  ],
];

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [...aliasPlugin],
};
