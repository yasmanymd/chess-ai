/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      comment: 'Circular dependencies obscure ownership and initialization order.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'web-must-not-import-server',
      comment:
        'The browser application must communicate through public contracts, never server internals.',
      severity: 'error',
      from: { path: '^apps/web' },
      to: { path: '^apps/server' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(node_modules|dist|build|\\.react-router|\\.turbo)(/|$)' },
  },
};
