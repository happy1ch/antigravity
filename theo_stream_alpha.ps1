
# Theo-Stream Alpha v1.0: Theological Knowledge Orchestrator (Robust Edition)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- Configuration ---
$TopicKey = "The Problem of Evil"
$DbFile = "theology_db.json"
$ResFile = "theo_stream_resources.json"
$SynthesisFile = "synthesis_report_alpha.txt"

# Load Resources
$Res = Get-Content $ResFile -Raw -Encoding UTF8 | ConvertFrom-Json
$TopicInfo = $Res.topics."$TopicKey"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   🚀 THEO-STREAM ALPHA v1.0 STARTING"
Write-Host "   Topic: $($TopicInfo.title)"
Write-Host "==================================================" -ForegroundColor Cyan

# Initialize DB
if (-not (Test-Path $DbFile)) { "[]" | Set-Content $DbFile -Encoding UTF8 }

$ScholarChannels = @(
    @{ name = "N.T. Wright Online"; type = "Wright" },
    @{ name = "Biola CCT"; type = "Piper" } # Using Piper/Traditional as contrast
)

# 1. Pipeline Execution
foreach ($Channel in $ScholarChannels) {
    Write-Host "`n--- 🔍 Processing: $($Channel.name) ---" -ForegroundColor Yellow
    
    $Summary = $Res.scholar_summaries."$($Channel.type)"
    
    $Analysis = @{
        channel   = $Channel.name
        topic     = $TopicKey
        timestamp = (Get-Date).ToString("yyyy-MM-dd")
        thesis    = $Summary.thesis
        school    = $Summary.school
    }

    # Accumulate in DB
    [array]$CurrentDb = @(Get-Content $DbFile -Raw -Encoding UTF8 | ConvertFrom-Json)
    $CurrentDb += $Analysis
    $CurrentDb | ConvertTo-Json -Depth 5 | Set-Content $DbFile -Encoding UTF8
    Write-Host "    ✅ Data Synced to DB." -ForegroundColor Green
}

# 2. Synthesis Report Generation
Write-Host "`n--- 🧠 Synthesizing Final Report ---" -ForegroundColor Magenta

$T = $Res.report_template
$Report = $T.header -f $TopicInfo.title, (Get-Date -Format 'yyyy-MM-dd')
$Report += $T.intro
$Report += $T.map_header

foreach ($Entry in $Res.scholar_summaries.psobject.Properties) {
    $Report += $T.map_entry -f $Entry.Value.name, $Entry.Value.school, $Entry.Value.thesis, $Entry.Value.school
}

$Report += $T.footer
Set-Content -Path $SynthesisFile -Value $Report -Encoding UTF8

# 3. EPUB Conversion (Reusing publish_synthesis logic)
Write-Host "`n--- 📘 Publishing to EPUB ---" -ForegroundColor Green
if (Test-Path "publish_synthesis.ps1") {
    $PubText = Get-Content "publish_synthesis.ps1" -Raw -Encoding UTF8
    $PubText = $PubText -replace 'synthesis_report.txt', 'synthesis_report_alpha.txt'
    $PubText = $PubText -replace 'Thematic_Synthesis_Sovereignty.epub', 'TheoStream_Alpha_Evil.epub'
    $PubText = $PubText -replace 'Biblical Theme: Sovereignty of God', "Theological Synthesis: $($TopicKey)"
    
    $PubText | Set-Content "temp_publish_alpha.ps1" -Encoding UTF8
    powershell -NoProfile -ExecutionPolicy Bypass -File "temp_publish_alpha.ps1"
    Remove-Item "temp_publish_alpha.ps1"
}

Write-Host "`n🏁 Theo-Stream Alpha v1.0 Pipeline Complete!" -ForegroundColor Cyan
Write-Host "File created: TheoStream_Alpha_Evil.epub" -ForegroundColor Green
