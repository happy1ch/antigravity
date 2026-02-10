
# Publish Synthesis EPUB
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$TxtFileName = "synthesis_report.txt"
$ReportTitle = "Biblical Theme: Sovereignty of God"
$EpubFileName = "Thematic_Synthesis_Sovereignty.epub"

Write-Host "=== 📘 Converting Synthesis to EPUB ===" -ForegroundColor Cyan

$TemplateScript = "create_epub.ps1"
if (-not (Test-Path $TemplateScript)) { Write-Error "Template not found"; exit }

$ScriptContent = Get-Content $TemplateScript -Raw -Encoding UTF8

# Robust Replacement
$SplitMarker = '$StyleCss = @"'
$Parts = $ScriptContent -split [regex]::Escape($SplitMarker)

if ($Parts.Count -lt 2) { Write-Error "StyleCSS marker not found"; exit }

$NewConfig = @"
# Generated Config for Synthesis
`$OutputFile = "$EpubFileName"
`$Title = "$ReportTitle"
`$Author = "Bible Research Synthesizer"
`$Language = "en"
`$Uuid = [Guid]::NewGuid().ToString()
`$Date = (Get-Date).ToString("yyyy-MM-dd")

# Source content
`$SourceFiles = @(
    @{ filename = "$TxtFileName"; title = "$ReportTitle"; id = "theme1" }
)

$SplitMarker
"@

$FinalScript = $NewConfig + $Parts[1]
$TempScript = "temp_synthesis_epub.ps1"
Set-Content -Path $TempScript -Value $FinalScript -Encoding UTF8

# Execute
try {
    Write-Host "Invoking EPUB Generator..."
    & ".\$TempScript"
}
finally {
    if (Test-Path $TempScript) { Remove-Item $TempScript }
}
