const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createProjectPDF(filename, title, subtitle, overview, techStack, keyFeatures, architecture, visualAssets) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const { width, height } = page.getSize();
    
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Header banner - Cyan / Navy theme
    page.drawRectangle({
        x: 0,
        y: height - 120,
        width: width,
        height: 120,
        color: rgb(0.04, 0.1, 0.22)
    });
    
    // Header Title
    page.drawText(title, {
        x: 40,
        y: height - 60,
        size: 20,
        font: fontBold,
        color: rgb(0, 0.9, 1)
    });
    
    // Subtitle / Tagline
    page.drawText(subtitle, {
        x: 40,
        y: height - 85,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.9, 1)
    });

    let currentY = height - 150;
    
    // Helper function to add sections
    function addSectionHeader(headerText) {
        page.drawText(headerText, {
            x: 40,
            y: currentY,
            size: 13,
            font: fontBold,
            color: rgb(0, 0.7, 0.95)
        });
        currentY -= 18;
    }
    
    function addParagraph(text) {
        const words = text.split(' ');
        let line = '';
        const maxWidth = width - 80;
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let textWidth = fontRegular.widthOfTextAtSize(testLine, 10);
            if (textWidth > maxWidth && n > 0) {
                page.drawText(line, {
                    x: 40,
                    y: currentY,
                    size: 10,
                    font: fontRegular,
                    color: rgb(0.2, 0.25, 0.35)
                });
                line = words[n] + ' ';
                currentY -= 15;
            } else {
                line = testLine;
            }
        }
        if (line.length > 0) {
            page.drawText(line, {
                x: 40,
                y: currentY,
                size: 10,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.35)
            });
            currentY -= 18;
        }
    }
    
    // 1. Overview
    addSectionHeader("1. Project Overview");
    addParagraph(overview);
    currentY -= 8;
    
    // 2. Tech Stack
    addSectionHeader("2. Technologies & Tools Used");
    techStack.forEach(tech => {
        page.drawText("• " + tech, {
            x: 50,
            y: currentY,
            size: 10,
            font: fontRegular,
            color: rgb(0.15, 0.2, 0.3)
        });
        currentY -= 15;
    });
    currentY -= 10;
    
    // 3. Key Features
    addSectionHeader("3. Key Features & Deliverables");
    keyFeatures.forEach(feat => {
        page.drawText("- " + feat, {
            x: 50,
            y: currentY,
            size: 10,
            font: fontRegular,
            color: rgb(0.05, 0.55, 0.45)
        });
        currentY -= 15;
    });
    currentY -= 10;
    
    // 4. Architecture & Workflow
    addSectionHeader("4. Architecture & Technical Breakdown");
    addParagraph(architecture);
    currentY -= 8;

    // 5. Visual Assets & Screenshot References
    if (visualAssets && visualAssets.length > 0) {
        addSectionHeader("5. Project Screenshots & Visual Assets");
        visualAssets.forEach(asset => {
            page.drawText("[Img] " + asset.label + ": " + asset.url, {
                x: 50,
                y: currentY,
                size: 9,
                font: fontRegular,
                color: rgb(0.02, 0.45, 0.8)
            });
            currentY -= 15;
        });
    }

    // Footer
    page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 35,
        color: rgb(0.04, 0.1, 0.22)
    });
    
    page.drawText("Harshdeep Tiwari Portfolio | Project Documentation", {
        x: 40,
        y: 12,
        size: 9,
        font: fontRegular,
        color: rgb(0.7, 0.85, 1)
    });

    const pdfBytes = await pdfDoc.save();
    const pdfDir = path.join(__dirname, 'pdf');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
    }
    fs.writeFileSync(path.join(pdfDir, filename), pdfBytes);
    console.log(`Generated PDF: ${filename}`);
}

async function main() {
    await createProjectPDF(
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

    await createProjectPDF(
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
