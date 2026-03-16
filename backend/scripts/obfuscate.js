/**
 * Post-build obfuscation script for the backend.
 *
 * Reads every .js file in dist/, obfuscates it, and writes the result to
 * dist-obf/. The obfuscated output replaces the original dist/ at the end
 * so the Dockerfile and start scripts keep working unchanged.
 *
 * Usage:  node scripts/obfuscate.js
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC_DIR = path.resolve(__dirname, '..', 'dist');
const OUT_DIR = path.resolve(__dirname, '..', 'dist-obf');

/** Obfuscator options — balanced between protection and runtime perf. */
const OBF_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,  // 50 % of blocks (perf-safe)
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.3,      // 30 % dead code
  debugProtection: false,               // don't freeze DevTools
  disableConsoleOutput: false,           // keep logger working
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,                  // keep module.exports intact
  selfDefending: false,                  // not needed for server code
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.5,
  stringArrayEncoding: ['rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

function walkDir(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

function copyNonJs(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyNonJs(srcPath, destPath);
    } else if (!entry.name.endsWith('.js')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

(function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('dist/ not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Clean previous output
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Copy non-JS files (JSON translations, .d.ts, etc.)
  copyNonJs(SRC_DIR, OUT_DIR);

  const jsFiles = walkDir(SRC_DIR);
  console.log(`Obfuscating ${jsFiles.length} JS files...`);

  let ok = 0;
  let skipped = 0;

  for (const file of jsFiles) {
    const rel = path.relative(SRC_DIR, file);
    const destFile = path.join(OUT_DIR, rel);
    fs.mkdirSync(path.dirname(destFile), { recursive: true });

    const code = fs.readFileSync(file, 'utf8');

    // Skip very small files (likely empty or config)
    if (code.length < 50) {
      fs.copyFileSync(file, destFile);
      skipped++;
      continue;
    }

    try {
      const result = JavaScriptObfuscator.obfuscate(code, OBF_OPTIONS);
      fs.writeFileSync(destFile, result.getObfuscatedCode());
      ok++;
    } catch (err) {
      console.warn(`  WARN: could not obfuscate ${rel}, copying original: ${err.message}`);
      fs.copyFileSync(file, destFile);
      skipped++;
    }
  }

  // Replace dist/ with obfuscated version
  fs.rmSync(SRC_DIR, { recursive: true });
  fs.renameSync(OUT_DIR, SRC_DIR);

  console.log(`Done: ${ok} obfuscated, ${skipped} copied as-is.`);
})();
