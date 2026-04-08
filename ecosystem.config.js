module.exports = {
  apps: [{
    name: 'churchhub',
    script: 'npm',
    args: 'start',
    cwd: '/Users/ijiwon/workspace/church-platform',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
