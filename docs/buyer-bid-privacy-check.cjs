const { spawnSync } = require('child_process')

const result = spawnSync('npm exec -- playwright test e2e/ali-privacy.spec.ts --grep "buyer bid page"', {
  stdio: 'inherit',
  shell: true,
})

if (result.error) console.error(result.error)
process.exit(result.status ?? 1)
