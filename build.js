import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  outfile: 'bundle.js',
  format: 'esm',
  minify: false,
  sourcemap: false,
  treeShaking: true,
}).catch(() => process.exit(1));