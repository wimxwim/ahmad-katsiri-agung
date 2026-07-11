module.exports = {
  apps: [
    {
      name: "akal-center",
      script: "node_modules/.bin/next",
      args: "start --port 3000",
      cwd: "/opt/akal-center",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 10000,
      listen_timeout: 30000,
    },
  ],
};