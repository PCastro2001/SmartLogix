import * as fs from 'fs';
import * as path from 'path';

const pkg = require('../package.json');

describe('NPM Package Compliance', () => {
  test('package.json tiene campo files', () => {
    expect(pkg.files).toBeDefined();
    expect(pkg.files).toContain('src/');
  });

  test('engines especifica node >= 18', () => {
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toMatch(/>=\s*18/);
  });

  test('README.md existe', () => {
    const readmePath = path.join(__dirname, '../README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    const readme = fs.readFileSync(readmePath, 'utf-8');
    expect(readme).toContain('INVENTARIO_URL');
    expect(readme).toContain('PEDIDOS_URL');
  });

  test('version es string (semver válido)', () => {
    expect(typeof pkg.version).toBe('string');
    expect(pkg.version).not.toBe('');
    const semver = /^\d+\.\d+\.\d+$/;
    expect(semver.test(pkg.version)).toBe(true);
  });

  test('campo main apunta a archivo existente', () => {
    const mainPath = path.join(__dirname, '..', pkg.main);
    expect(fs.existsSync(mainPath)).toBe(true);
  });
});
