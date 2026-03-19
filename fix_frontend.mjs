import fs from 'fs';
import path from 'path';

const basePath = path.join(process.cwd(), 'src', 'components');
const utilsPath = path.join(process.cwd(), 'src', 'utils', 'axiosInstance.js');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.match(/import\s+axios\s+from\s+['"]axios['"];?/)) {
        // Find relative path to utils
        let relativePath = path.relative(path.dirname(fullPath), path.dirname(utilsPath));
        if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
        const axiosImport = `import axios from "${relativePath}/axiosInstance.js";`;
        
        content = content.replace(/import\s+axios\s+from\s+['"]axios['"];?/, axiosImport);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(basePath);

// App.jsx needs to import from utils too if it uses axios, but it doesn't.
let layoutPath = path.join(process.cwd(), 'src', 'layout', 'CorporateLayout.jsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(/to="\/usuarios"/g, (match, offset, str) => {
  // We know there are two. 1st is for Usuarios, 2nd is Módulos por rol.
  // Wait, the first one is under CATÁLOGOS.
  // We can just replace based on surrounding context.
  return match; // will do manual
});
fs.writeFileSync(layoutPath, layoutContent, 'utf8');

