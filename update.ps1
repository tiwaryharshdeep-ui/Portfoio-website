$dir = "C:\Users\cp\Desktop\spec kit dev\portfolio\src"
$files = Get-ChildItem -Path $dir -Filter "*.html"

$replaceStr = '            <p class="sidebar-title">Aspiring Developer</p>
            <div class="sidebar-socials" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem;">
                <a href="#" style="transition: transform 0.3s;" onmouseover="this.style.transform=''scale(1.2)''" onmouseout="this.style.transform=''scale(1)''" title="GitHub">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style="width: 28px; height: 28px; background: white; border-radius: 50%;">
                </a>
                <a href="#" style="transition: transform 0.3s;" onmouseover="this.style.transform=''scale(1.2)''" onmouseout="this.style.transform=''scale(1)''" title="LinkedIn">
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" style="width: 28px; height: 28px; background: white; border-radius: 4px;">
                </a>
            </div>
        </div>'

$replaceStr = $replaceStr -replace "`r`n", "`n"

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $content = $content -replace "`r`n", "`n"
    
    $findStr = '            <p class="sidebar-title">Aspiring Developer</p>
        </div>'
    $findStr = $findStr -replace "`r`n", "`n"
    
    $content = $content.Replace($findStr, $replaceStr)
    
    if ($f.Name -eq "index.html") {
        $findHero = '<h1 class="hero-name">Harshdeep Tiwari</h1>
                    <p class="hero-tagline">Aspiring Developer / Creative thinking / Tech enthusiast</p>'
        $findHero = $findHero -replace "`r`n", "`n"
        
        $repHero = '<h1 class="hero-name">I''m Harshdeep Tiwari</h1>
                    <p class="hero-tagline">Aspiring Digital Marketing | GenAI Learner</p>'
        
        $content = $content.Replace($findHero, $repHero)
    }
    
    [System.IO.File]::WriteAllText($f.FullName, $content)
}
Write-Host "Updated HTML files successfully."
