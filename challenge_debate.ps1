
# Challenge Mode: Human-in-the-Loop Critique
# Usage: .\challenge_debate.ps1 -Critique "My argument..."
param([string]$Critique = "")

# Force UTF-8 for Console I/O to prevent Mojibake
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

$SourceFile = "debate_source.json"
if (-not (Test-Path $SourceFile)) { Write-Error "Source file not found."; exit }

$Data = Get-Content $SourceFile -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   🛡️  HUMAN-IN-THE-LOOP CHALLENGE MODE"
Write-Host "   Topic: $($Data.topic)"
Write-Host "==================================================" -ForegroundColor Cyan

# Show current conclusion (last round)
$LastRound = $Data.rounds[-1]
Write-Host "`n[Current Conclusion] $($LastRound.theme_ko)" -ForegroundColor Yellow
foreach ($Turn in $LastRound.dialogues) {
    Write-Host " - $($Turn.spk): $($Turn.txt_ko)" -ForegroundColor Gray
}

Write-Host "`n--------------------------------------------------"

if ([string]::IsNullOrWhiteSpace($Critique)) {
    $Critique = Read-Host "Click here and type your Counter-Argument/Question (or press Enter to skip)"
}

if ([string]::IsNullOrWhiteSpace($Critique)) {
    Write-Host "No input detected. Exiting."
    exit
}

$UserInput = $Critique

# 1. Processing Input
Write-Host "`n🤔 Analyzing critique..." -ForegroundColor Green
Start-Sleep -Seconds 1


# 2. Simulate Agent Response (Mock Logic for Demo)
$Responder = "Trad_Theologian"
$ResponseText = ""
$ResponseKey = "Mod_Theologian" # Default

if ($UserInput -match "scienc|evol|big bang|과학|진화") {
    $Responder = "Scientist"
    $ResponseKey = "Scientist"
    $ResponseText = "Good point. As a scientist, I admit that models change. However, the data points to an ancient cosmos. We must fit our theology to the truth of God's world."
}
elseif ($UserInput -match "literal|text|문자|기록") {
    $Responder = "Linguist"
    $ResponseKey = "Linguist"
    $ResponseText = "The text allows for phenomenological language. It describes what is SEEN, not the physics behind it."
}
else {
    $Responder = "Mod_Theologian"
    $ResponseKey = "Mod_Theologian"
    $ResponseText = "Your critique touches the core. We must remember that the Bible was written FOR us, but not TO us. Context is King."
}

# Load Korean Text from JSON to avoid script encoding issues
$ResponseData = Get-Content "agent_responses.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$ResponseTextKo = $ResponseData.$ResponseKey.text
$ResponseThought = $ResponseData.$ResponseKey.thought

# 3. Append to Data
Write-Host "`n🗣️  [$Responder] Responding..." -ForegroundColor Cyan
Write-Host "   $ResponseTextKo"

$NewRound = @{
    id        = $Data.rounds.Count + 1
    theme_ko  = "사용자 챌린지 (Human-in-the-Loop)"
    theme_en  = "User Challenge & Response"
    dialogues = @(
        @{ spk = "User"; type = "rebuttal"; th_ko = ""; txt_en = "User Critique"; txt_ko = $UserInput },
        @{ spk = $Responder; type = "defense"; th_ko = $ResponseThought; txt_en = $ResponseText; txt_ko = $ResponseTextKo }
    )
}

$Data.rounds += $NewRound

# Save
$JsonContent = $Data | ConvertTo-Json -Depth 10 -Compress
Set-Content -Path $SourceFile -Value $JsonContent -Encoding UTF8

Write-Host "`n✅ Critique integrated into research data." -ForegroundColor Green
Write-Host "🔄 Updating Web Page..."

& ".\generate_webpage.ps1"
