const fs = require('fs');
const path = require('path');
const https = require('https');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Helper to download an image as a Buffer
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadImage(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch ${url}, status code: ${res.statusCode}`));
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function createProjectPDFWithImages(filename, title, subtitle, overview, techStack, keyFeatures, architecture, imageUrls) {
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
    
    page.drawText(title, {
        x: 40,
        y: height - 55,
        size: 18,
        font: fontBold,
        color: rgb(0, 0.9, 1)
    });
    
    page.drawText(subtitle, {
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
    addParagraph(overview);
    currentY -= 6;
    
    addSectionHeader("2. Technologies & Tools Used");
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
    
    addSectionHeader("3. Key Features & Deliverables");
    keyFeatures.forEach(feat => {
        page.drawText("- " + feat, {
            x: 50,
            y: currentY,
            size: 9.5,
            font: fontRegular,
            color: rgb(0.05, 0.55, 0.45)
        });
        currentY -= 14;
    });
    currentY -= 8;
    
    addSectionHeader("4. Architecture & Design Details");
    addParagraph(architecture);
    currentY -= 10;

    // Download & Embed Real Images directly into the PDF!
    console.log(`Downloading ${imageUrls.length} images for ${title}...`);
    const embeddedImages = [];
    for (let i = 0; i < imageUrls.length; i++) {
        try {
            const imgBuffer = await downloadImage(imageUrls[i].url);
            let embeddedImg;
            if (imageUrls[i].url.toLowerCase().endsWith('.png') || imgBuffer[0] === 0x89) {
                embeddedImg = await pdfDoc.embedPng(imgBuffer);
            } else {
                embeddedImg = await pdfDoc.embedJpg(imgBuffer);
            }
            embeddedImages.push({ img: embeddedImg, label: imageUrls[i].label });
            console.log(`Embedded image ${i+1}/${imageUrls.length}: ${imageUrls[i].label}`);
        } catch (e) {
            console.error(`Failed to download image ${imageUrls[i].url}: ${e.message}`);
        }
    }

    // Page 2: Project Screenshots & Visual Showcase
    if (embeddedImages.length > 0) {
        let imgPage = pdfDoc.addPage([595.28, 841.89]);
        const imgPageWidth = imgPage.getSize().width;
        const imgPageHeight = imgPage.getSize().height;

        imgPage.drawRectangle({
            x: 0,
            y: imgPageHeight - 60,
            width: imgPageWidth,
            height: 60,
            color: rgb(0.04, 0.1, 0.22)
        });
        
        imgPage.drawText(`${title} - Visual Screenshots & Screenshots Showcase`, {
            x: 40,
            y: imgPageHeight - 38,
            size: 14,
            font: fontBold,
            color: rgb(0, 0.9, 1)
        });

        let imgY = imgPageHeight - 90;
        
        for (let i = 0; i < embeddedImages.length; i++) {
            const { img, label } = embeddedImages[i];
            
            // Calculate scaled image size to fit nicely
            const maxImgW = 515;
            const maxImgH = 220;
            const dims = img.scaleToFit(maxImgW, maxImgH);

            if (imgY - dims.height - 30 < 40) {
                // Add new page if space runs out
                imgPage = pdfDoc.addPage([595.28, 841.89]);
                imgY = imgPageHeight - 60;
            }

            imgPage.drawText(`Image ${i+1}: ${label}`, {
                x: 40,
                y: imgY,
                size: 11,
                font: fontBold,
                color: rgb(0.02, 0.45, 0.8)
            });
            imgY -= 15;

            // Draw border background around image
            imgPage.drawRectangle({
                x: 40 - 4,
                y: imgY - dims.height - 4,
                width: dims.width + 8,
                height: dims.height + 8,
                color: rgb(0.92, 0.95, 0.98),
                borderColor: rgb(0, 0.7, 0.95),
                borderWidth: 1
            });

            // Draw Embedded Image
            imgPage.drawImage(img, {
                x: 40,
                y: imgY - dims.height,
                width: dims.width,
                height: dims.height
            });

            imgY -= (dims.height + 30);
        }

        // Footer on image page
        imgPage.drawRectangle({
            x: 0,
            y: 0,
            width: imgPageWidth,
            height: 35,
            color: rgb(0.04, 0.1, 0.22)
        });
        
        imgPage.drawText("Harshdeep Tiwari Portfolio | Embedded Visual Screenshots", {
            x: 40,
            y: 12,
            size: 9,
            font: fontRegular,
            color: rgb(0.7, 0.85, 1)
        });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfDir = path.join(__dirname, 'pdf');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }
    fs.writeFileSync(path.join(pdfDir, filename), pdfBytes);
    console.log(`Successfully generated PDF with embedded images: ${filename}`);
}

async function main() {
    await createProjectPDFWithImages(
        "Personal_Portfolio_Website.pdf",
        "Personal Portfolio Website",
        "Full Project Documentation & Architecture Overview",
        "Designed and developed a fully responsive personal portfolio website to showcase skills, projects, certifications, and achievements. The website provides a clean user experience, modern UI, and easy navigation while reflecting expertise in Web Development, Digital Marketing, and Generative AI. It was made with the help of SpecKit for project planning and structure, then customized with HTML, CSS, and JavaScript.",
        [
            "SpecKit (Project Planning & Structure)",
            "HTML5 (Semantic Layout & Accessibility)",
            "CSS3 (Vanilla CSS, Glassmorphism, Dark/Light Themes)",
            "JavaScript (Dynamic Rendering, Modals & Navigation)"
        ],
        [
            "Interactive Single-Page & Multi-Page Navigation",
            "Theme Switcher with Dark & Light Modes",
            "Action Modal Integration for Direct Contact",
            "SEO-Optimized Metadata and Fast Performance",
            "Clean Mobile & Desktop Responsive Design"
        ],
        "The project architecture follows modular CSS design tokens and decoupled JS components. High-contrast typography and glowing neo-minimalist accents are used throughout the application to deliver a state-of-the-art developer showcase.",
        [
            { label: "Homepage Interface", url: "https://i.ibb.co/s9yv26TC/Homepage.png" },
            { label: "About Section", url: "https://i.ibb.co/pjjDfWm6/About.png" },
            { label: "Resume Page", url: "https://i.ibb.co/R4zffyQ5/Resume.png" },
            { label: "Testimonials Page", url: "https://i.ibb.co/0R8KghgP/Testimonial.png" },
            { label: "Contact Form Layout", url: "https://i.ibb.co/WNWGK37t/Contact.png" }
        ]
    );

    await createProjectPDFWithImages(
        "AI_Driven_Marketing_Automation.pdf",
        "AI-Driven Marketing & Content Automation",
        "End-to-End Generative AI Workflow & Strategy Documentation",
        "An end-to-end automation workflow that harnesses the power of Generative AI and Prompt Engineering to produce highly engaging, trending content daily. It seamlessly crafts platform-optimized captions for LinkedIn, Instagram, and X (Twitter), paired with visually stunning infographics and poster designs. By automatically organizing all assets into structured folders, this tool delivers publish-ready content, drastically saving manual effort for marketers.",
        [
            "Generative AI (ChatGPT, Claude & Custom Prompts)",
            "Prompt Engineering & Structured Output Parsing",
            "Workflow Automation Scripts",
            "Social Media Marketing Strategy & Analytics"
        ],
        [
            "Automated Multi-Platform Caption Generation",
            "Infographic & Poster Concept Synthesis",
            "Structured Folder Asset Organization",
            "Daily Content Calendar Synchronization",
            "90% Reduction in Content Creation Time"
        ],
        "The system pipeline processes raw marketing topics into structured prompt chains. Outputs are parsed into JSON templates, linked with image asset generation tools, and routed into publish-ready folders for seamless social media scheduling.",
        [
            { label: "Asset Folder Organization", url: "https://i.ibb.co/rGPb3VQR/folder-image-2.png" },
            { label: "Infographic Graphic Output", url: "https://i.ibb.co/PsJjj1Nn/infographic-image.png" },
            { label: "LinkedIn Automation Post", url: "https://i.ibb.co/B5Sg5TmG/linkedin.png" },
            { label: "Poster Marketing Assets", url: "https://i.ibb.co/qLsrN5qd/poster-images.png" }
        ]
    );
}

main().catch(console.error);
