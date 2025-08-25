# Build Instructions

## Important: Do Not Manually Edit index.html

The `public/index.html` file should **NEVER** be manually edited to reference compiled JavaScript files. This breaks the build process.

## Proper Build Process

1. **Keep the template file correct**: The `public/index.html` should always reference the source files:
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```

2. **Build the application**:
   ```bash
   cd public
   npm run build
   ```

3. **Copy the compiled files**:
   ```bash
   cp dist/index.html index.html
   cp -r dist/assets/* assets/
   ```

4. **Deploy**:
   ```bash
   cd ..
   wrangler pages deploy public --project-name=partner-request-portal
   ```

## What Happens During Build

- Vite reads the `public/index.html` template
- It processes the source files (`/src/main.tsx`, etc.)
- It generates compiled JavaScript and CSS files
- It updates the `dist/index.html` with the correct references to compiled assets
- The compiled `dist/index.html` is then copied to `public/index.html` for deployment

## If You See "Main page is broken"

1. Check if `public/index.html` has been manually edited
2. If it references specific JavaScript files (like `/assets/index-xxx.js`), restore the template
3. Rebuild using the process above

## Current Working URL

The application is deployed at: https://dfe506c6.partner-request-portal.pages.dev/
