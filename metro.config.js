/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    // This detects entry points of React app and transforms them
    // For the other files this will switch to use default `metro-react-native-babel-transformer` for transforming
    babelTransformerPath: require.resolve(
      'react-native-react-bridge/lib/plugin',
    ),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  rnrb: {
    // Set `true` if you use Preact in web side.
    // This will alias imports from `react` and `react-dom` to `preact/compat` automatically.
    preact: false,
  },
};
