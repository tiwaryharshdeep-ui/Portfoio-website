const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\cp\\Desktop\\spec kit dev\\portfolio\\src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const replaceStr = `            <p class="sidebar-title">Aspiring Developer</p>\n            <div class="sidebar-socials" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem;">\n                <a href="#" style="transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="GitHub">\n                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style="width: 28px; height: 28px; background: white; border-radius: 50%;">\n                </a>\n                <a href="#" style="transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="LinkedIn">\n                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" style="width: 28px; height: 28px; background: white; border-radius: 4px;">\n                </a>\n            </div>\n        </div>`;

files.forEach(f => {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    let normalizedContent = content.replace(/\r\n/g, '\n');
    let normalizedFind = `            <p class="sidebar-title">Aspiring Developer</p>\n        </div>`;
    let newContent = normalizedContent.replace(normalizedFind, replaceStr);
    
    if (f === 'index.html') {
        newContent = newContent.replace(
            `<h1 class="hero-name">Harshdeep Tiwari</h1>\n                    <p class="hero-tagline">Aspiring Developer / Creative thinking / Tech enthusiast</p>`,
            `<h1 class="hero-name">I'm Harshdeep Tiwari</h1>\n                    <p class="hero-tagline">Aspiring Digital Marketing | GenAI Learner</p>`
        );
    }
    
    fs.writeFileSync(path.join(dir, f), newContent);
});
console.log("Updates applied successfully.");
