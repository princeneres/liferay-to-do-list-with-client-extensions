import {defineConfig} from 'vite';

export default defineConfig({
	build: {
		outDir: 'build/vite',
		rollupOptions: {

			// Provided at runtime by the portal import map (React, Clay) and by
			// the todo-commons jsImportMapsEntry client extension.

			external: ['react', 'react-dom', /^@clayui\//, 'todo-commons'],
			input: {
				'todo-app': 'src/todo-app.jsx',
				'todo-summary': 'src/todo-summary.jsx',
			},
			output: {
				entryFileNames: '[name].[hash].js',
				format: 'es',
			},
		},
	},
	esbuild: {
		jsx: 'transform',
		jsxFactory: 'React.createElement',
		jsxFragment: 'React.Fragment',
	},
});
