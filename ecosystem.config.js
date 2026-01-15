module.exports = {
  apps: [{
    name: 'backendkuntarn',
    script: 'server.js',
    cwd: '/srv/backendkuntarn',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 1997,
      HOST: '0.0.0.0'
    },
    error_file: '/srv/backendkuntarn/logs/err.log',
    out_file: '/srv/backendkuntarn/logs/out.log',
    log_file: '/srv/backendkuntarn/logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};


