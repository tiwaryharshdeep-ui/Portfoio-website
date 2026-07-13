$dir = "C:\Users\cp\Desktop\spec kit dev\portfolio\src"
$files = Get-ChildItem -Path $dir -Filter "*.html"

$seoTags = @"
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
</head>
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if (-not $content.Contains("<!-- SEO Meta Tags -->")) {
        $content = $content -replace "</head>", $seoTags
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    } else {
        Write-Host "Already updated $($file.Name)"
    }
}
Write-Host "Done!"
