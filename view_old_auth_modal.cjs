const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = "c:\\Users\\Shoba\\Downloads\\carbon reduce";
  const commit1 = 'd25250b3426c96fc8c319d43399f6b5d5b7eb179'; // before refactor

  try {
    const { blob } = await git.readBlob({
      fs,
      dir,
      oid: commit1,
      filepath: 'src/App.tsx'
    });
    
    const content = Buffer.from(blob).toString('utf8');
    
    // Find where standard Auth modal UI is rendered in the old App.tsx
    let pos = content.indexOf('Auth Modal');
    if (pos !== -1) {
      console.log(content.substring(pos - 100, pos + 1500));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
