import type {NextConfig} from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore optional Genkit dependencies that aren't needed
    // These are peer dependencies that Genkit tries to import but aren't required
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@opentelemetry\/exporter-jaeger$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@genkit-ai\/firebase$/,
      })
    );
    
    // Also add to externals to prevent webpack from trying to resolve them
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@opentelemetry/exporter-jaeger', '@genkit-ai/firebase');
      } else if (typeof config.externals === 'object') {
        config.externals['@opentelemetry/exporter-jaeger'] = 'commonjs @opentelemetry/exporter-jaeger';
        config.externals['@genkit-ai/firebase'] = 'commonjs @genkit-ai/firebase';
      }
    }
    
    // Suppress warnings for these modules
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@opentelemetry\/exporter-jaeger/ },
      { module: /@genkit-ai\/firebase/ },
    ];
    
    return config;
  },
};


export default nextConfig;
