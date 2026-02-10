
# Genesis Debate Runner (Clean)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$SourceFile = "debate_source.json"
if (-not (Test-Path $SourceFile)) { Write-Error "Source file not found."; exit }

# Read JSON with explicit UTF8
$JsonRaw = Get-Content $SourceFile -Raw -Encoding UTF8
$Data = $JsonRaw | ConvertFrom-Json

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   🧠 BIBLE RESEARCH AGENT SIMULATION: $($Data.topic)"
Write-Host "==================================================" -ForegroundColor Cyan

# Output structure
$FinalOutput = @{
    metadata = @{ topic = $Data.topic; date = (Get-Date).ToString("yyyy-MM-dd") }
    rounds   = @()
}

foreach ($Round in $Data.rounds) {
    Write-Host "`n🔔 Round $($Round.id): $($Round.theme_ko)" -ForegroundColor White
    Write-Host "   (Theme: $($Round.theme_en))" -ForegroundColor DarkGray
    Start-Sleep -Milliseconds 800

    $RoundExport = @{
        round_id = $Round.id
        theme_ko = $Round.theme_ko
        theme_en = $Round.theme_en
        turns    = @()
    }

    foreach ($Turn in $Round.dialogues) {
        $AgentKey = $Turn.spk
        # Acccessing the PSCustomObject properties dynamically
        $AgentInfo = $Data.agents.$AgentKey 
        
        # 1. Internal Thought (Visualization)
        Write-Host "   🤔 [$($AgentInfo.name)] Thinking..." -ForegroundColor Gray
        Write-Host "      >> $($Turn.th_ko)" -ForegroundColor Gray
        Start-Sleep -Milliseconds 400
        
        # 2. External Speech
        # Map colors
        $Color = "White"
        if ($AgentInfo.color -eq "Cyan") { $Color = "Cyan" }
        elseif ($AgentInfo.color -eq "Yellow") { $Color = "Yellow" }
        elseif ($AgentInfo.color -eq "Magenta") { $Color = "Magenta" }
        elseif ($AgentInfo.color -eq "Green") { $Color = "Green" }

        Write-Host "   🗣️  [$($AgentInfo.name)] says:" -ForegroundColor $Color
        Write-Host "      `"$($Turn.txt_ko)`"" -ForegroundColor White
        Write-Host ""
        Start-Sleep -Milliseconds 400

        # 3. Save Data
        $RoundExport.turns += @{
            speaker_name   = $AgentInfo.name
            speaker_stance = $AgentInfo.stance
            speaker_style  = $AgentInfo.style
            thought_ko     = $Turn.th_ko
            text_ko        = $Turn.txt_ko
            text_en        = $Turn.txt_en
        }
    }
    $FinalOutput.rounds += $RoundExport
}

# Save Result
$ResultJson = $FinalOutput | ConvertTo-Json -Depth 5 -Compress
Set-Content "research_data.json" -Value $ResultJson -Encoding UTF8

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "✅ Simulation Complete. Data saved to 'research_data.json'"
