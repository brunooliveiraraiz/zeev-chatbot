module.exports = {
  apps: [
    {
      name: 'chatbot-reports',
      script: './scripts/schedule-reports.ts',
      interpreter: 'npx',
      interpreter_args: 'tsx',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/reports-error.log',
      out_file: './logs/reports-out.log',
      log_file: './logs/reports-combined.log',
      time: true,
    },
  ],
};
