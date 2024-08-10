/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        // Exclude native modules from being bundled by Webpack
        config.externals = [
          ...config.externals,
          '@xenova/transformers',
          'onnxruntime-node',
        ];
      }
  
      return config;
    },
  };
  
  export default nextConfig;
  