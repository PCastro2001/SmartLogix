const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');

describe('NPM Package Compliance', () => {

  // ✅ TEST 1 — package.json tiene campo files definido
  test('package.json tiene campo files', () => {
    expect(pkg.files).toBeDefined();
    expect(pkg.files).toContain('src/');
  });

  // ✅ TEST 2 — package.json tiene engines con node >= 18
  test('engines especifica node >= 18', () => {
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toMatch(/>=\s*18/);
  });

  // ✅ TEST 3 — README.md existe y documenta variables de entorno
  test('README.md existe', () => {
    const readmePath = path.join(__dirname, '../README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    const readme = fs.readFileSync(readmePath, 'utf-8');
    expect(readme).toContain('INVENTARIO_URL');
    expect(readme).toContain('PEDIDOS_URL');
  });

  // ❌ TEST 4 — Fallo esperado: version no semver lanzaría error en npm publish
  test('version es string (semver válido)', () => {
    expect(typeof pkg.version).toBe('string');
    expect(pkg.version).not.toBe('');
    const semver = /^\d+\.\d+\.\d+$/;
    expect(semver.test(pkg.version)).toBe(true);
  });

  // ❌ TEST 5 — Fallo esperado: campo main apunta a archivo existente
  test('campo main apunta a archivo existente', () => {
    const mainPath = path.join(__dirname, '..', pkg.main);
    expect(fs.existsSync(mainPath)).toBe(true);
  });
});
