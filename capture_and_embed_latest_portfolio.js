const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function captureScreenshots() {
    console.log("Launching headless browser to capture LATEST site structural screenshots...");
    
    // Find system Edge or Chrome on Windows
    let executablePath = '';
    const possiblePaths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe'
    ];

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            executablePath = p;
            break;
        }
    }

    console.log(`Using browser executable: ${executablePath}`);

    const launchOpts = {
        headless: "new",
        defaultViewport: { width: 1280, height: 800 }
    };
    if (executablePath) {
        launchOpts.executablePath = executablePath;
    }

    const browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();

    const assetsDir = path.join(__dirname, 'pdf_assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }

    const pagesToCapture = [
        { name: 'homepage_latest', file: 'index.html', label: 'Latest Homepage Structure & Layout' },
        { name: 'about_latest', file: 'about.html', label: 'Latest About Me Section (Clean View)' },
        { name: 'skills_latest', file: 'skills.html', label: 'Latest Skills Section (Tech Logos)' },
        { name: 'projects_latest', file: 'projects.html', label: 'Latest Projects Section (PDF Links)' },
        { name: 'contact_latest', file: 'contact.html', label: 'Latest Contact Section (100vh View)' }
    ];

    const capturedFiles = [];

    for (const item of pagesToCapture) {
        const filePath = 'file:///' + path.join(__dirname, item.file).replace(/\\/g, '/');
        console.log(`Navigating to ${filePath}...`);
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000)); // allow animations to render
        const savePath = path.join(assetsDir, `${item.name}.png`);
        await page.screenshot({ path: savePath, fullPage: false });
        capturedFiles.push({ path: savePath, label: item.label });
        console.log(`Captured: ${savePath}`);
    }

    await browser.close();
    return capturedFiles;
}

async function buildLatestPortfolioPDF(capturedFiles) {
    console.log("Generating Personal_Portfolio_Website.pdf with LATEST structural screenshots...");
    const pdfDoc = await PDFDocument.create();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Page 1: Overview & Documentation
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    
    // Header banner
    page.drawRectangle({
        x: 0,
        y: height - 110,
        width: width,
        height: 110,
        color: rgb(0.04, 0.1, 0.22)
    });
    
    page.drawText("Personal Portfolio Website", {
        x: 40,
        y: height - 55,
        size: 18,
        font: fontBold,
        color: rgb(0, 0.9, 1)
    });
    
    page.drawText("Updated Architecture & Real-Time Structural Screenshots Showcase", {
        x: 40,
        y: height - 80,
        size: 10,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1)
    });

    let currentY = height - 135;
    
    function addSectionHeader(headerText) {
        page.drawText(headerText, {
            x: 40,
            y: currentY,
            size: 12,
            font: fontBold,
            color: rgb(0, 0.7, 0.95)
        });
        currentY -= 16;
    }
    
    function addParagraph(text) {
        const words = text.split(' ');
        let line = '';
        const maxWidth = width - 80;
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let textWidth = fontRegular.widthOfTextAtSize(testLine, 9.5);
            if (textWidth > maxWidth && n > 0) {
                page.drawText(line, {
                    x: 40,
                    y: currentY,
                    size: 9.5,
                    font: fontRegular,
                    color: rgb(0.2, 0.25, 0.35)
                });
                line = words[n] + ' ';
                currentY -= 14;
            } else {
                line = testLine;
            }
        }
        if (line.length > 0) {
            page.drawText(line, {
                x: 40,
                y: currentY,
                size: 9.5,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.35)
            });
            currentY -= 16;
        }
    }
    
    addSectionHeader("1. Project Overview");
    addParagraph("Designed and developed a fully responsive personal portfolio website to showcase skills, projects, certifications, and achievements. The website provides a clean user experience, modern UI, and easy navigation while reflecting expertise in Web Development, Digital Marketing, and Generative AI. Built with SpecKit for project planning and customized with clean HTML5, CSS3, and JavaScript.");
    currentY -= 6;
    
    addSectionHeader("2. Technologies & Tools Used");
    const techStack = [
        "SpecKit (Project Planning & Architecture)",
        "HTML5 (Semantic Layout & Accessibility)",
        "CSS3 (Vanilla CSS, Glassmorphism, Responsive Tokens)",
        "JavaScript (Dynamic Rendering, PDF Integration, Navigation)"
    ];
    techStack.forEach(tech => {
        page.drawText("• " + tech, {
            x: 50,
            y: currentY,
            size: 9.5,
            font: fontRegular,
            color: rgb(0.15, 0.2, 0.3)
        });
        currentY -= 14;
    });
    currentY -= 8;
    
    addSectionHeader("3. Key Structural Enhancements");
    const keyFeatures = [
        "- Top-Aligned Profile Image Layout with Centered Typography",
        "- Logo-based Skill Showcase across all categories",
        "- Direct PDF Document & Asset Integration",
        "- 100vh Viewport-Fitted Contact Interface (Zero Scroll)",
        "- Clean Upright Dark & Light Theme Switcher"
    ];
    keyFeatures.forEach(feat => {
        page.drawText(feat, {
            x: 50,
            y: currentY,
            size: 9.5,
            font: fontRegular,
            color: rgb(0.05, 0.55, 0.45)
        });
        currentY -= 14;
    });
    currentY -= 8;
    
    addSectionHeader("4. Technical Architecture");
    addParagraph("The website employs decoupled component styling, clean HTML templates, and modular JS handlers. All page snapshots below reflect the live, updated structural layout of the application.");

    // Pages 2+: Embed LATEST captured PNG screenshots
    for (let i = 0; i < capturedFiles.length; i++) {
        const item = capturedFiles[i];
        const imgBytes = fs.readFileSync(item.path);
        const embeddedImg = await pdfDoc.embedPng(imgBytes);

        const imgPage = pdfDoc.addPage([595.28, 841.89]);
        const imgPageWidth = imgPage.getSize().width;
        const imgPageHeight = imgPage.getSize().height;

        imgPage.drawRectangle({
            x: 0,
            y: imgPageHeight - 55,
            width: imgPageWidth,
            height: 55,
            color: rgb(0.04, 0.1, 0.22)
        });
        
        imgPage.drawText(`Latest Website Structure - ${item.label}`, {
            x: 40,
            y: imgPageHeight - 35,
            size: 13,
            font: fontBold,
            color: rgb(0, 0.9, 1)
        });

        const dims = embeddedImg.scaleToFit(515, 700);

        // Draw image frame
        imgPage.drawRectangle({
            x: 40 - 3,
            y: imgPageHeight - 75 - dims.height - 3,
            width: dims.width + 6,
            height: dims.height + 6,
            color: rgb(0.95, 0.97, 1),
            borderColor: rgb(0, 0.7, 0.95),
            borderWidth: 1
        });

        imgPage.drawImage(embeddedImg, {
            x: 40,
            y: imgPageHeight - 75 - dims.height,
            width: dims.width,
            height: dims.height
        });

        // Footer
        imgPage.drawRectangle({
            x: 0,
            y: 0,
            width: imgPageWidth,
            height: 30,
            color: rgb(0.04, 0.1, 0.22)
        });
        
        imgPage.drawText("Harshdeep Tiwari Portfolio | Latest Structural Screenshot", {
            x: 40,
            y: 10,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.7, 0.85, 1)
        });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfDir = path.join(__dirname, 'pdf');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }
    const outputPath = path.join(pdfDir, "Personal_Portfolio_Website.pdf");
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Successfully generated updated PDF with LATEST screenshots: ${outputPath}`);
}

async function main() {
    const files = await captureScreenshots();
    await buildLatestPortfolioPDF(files);
}

main().catch(console.error);
