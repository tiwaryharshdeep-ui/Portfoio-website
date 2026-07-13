const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\cp\\Desktop\\spec kit dev\\portfolio\\src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const seoTags = `
    <!-- SEO Meta Tags -->
    <meta name="description" content="Harshdeep Tiwari - Aspiring Digital Marketing and GenAI Learner. I help businesses grow through SEO, Social Media Marketing, AI-powered content, and data-driven strategies.">
    <meta name="keywords" content="Harshdeep Tiwari, Digital Marketing, GenAI, SEO, Social Media Marketing, Portfolio, AI Prompts">
    <meta name="author" content="Harshdeep Tiwari">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://harshdeeptiwari.com/">
    <meta property="og:title" content="Harshdeep Tiwari - Digital Marketing & GenAI Portfolio">
    <meta property="og:description" content="I help businesses grow through SEO, Social Media Marketing, AI-powered content, and data-driven strategies.">
    <meta property="og:image" content="https://harshdeeptiwari.com/assets/images/image.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://harshdeeptiwari.com/">
    <meta property="twitter:title" content="Harshdeep Tiwari - Digital Marketing & GenAI Portfolio">
    <meta property="twitter:description" content="I help businesses grow through SEO, Social Media Marketing, AI-powered content, and data-driven strategies.">
    <meta property="twitter:image" content="https://harshdeeptiwari.com/assets/images/image.png">
`;

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only add if not already present
    if (!content.includes('<!-- SEO Meta Tags -->')) {
        // Insert right before </head>
        content = content.replace('</head>', seoTags + '\n</head>');
        fs.writeFileSync(filePath, content);
        console.log(\`Updated SEO tags for \${f}\`);
    } else {
        console.log(\`SEO tags already exist in \${f}\`);
    }
});
console.log('All files updated successfully!');
