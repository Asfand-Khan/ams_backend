module.exports = {
  apps: [
    {
      name: "ams-backend",
      script: "./dist/server.js",
      cwd: "./",              // Project root (where .env is)
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
