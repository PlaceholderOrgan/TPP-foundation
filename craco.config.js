// This configuration file customizes the Create React App development server.
// It uses the CRACO (Create React App Configuration Override) API.
module.exports = {
  // Customize the dev server configuration.
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return {
      ...devServerConfig, // Spread existing config settings
      allowedHosts: ['localhost'] // Allow only 'localhost' (or change to 'all' if needed)
    };
  }
};