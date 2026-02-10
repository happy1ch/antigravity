
# Topic Synthesizer: Merging Research into One Volume
# Usage: .\synthesize_theme.ps1 -Tag "#Sovereignty" (or default "All")
param([string]$Tag = "All")

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   📚 BIBLE RESEARCH SYNTHESIZER"
Write-Host "   Target Theme: $Tag"
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Find all Research Data
$Files = Get-ChildItem -Path . -Filter "research_*.json" -Recurse
# Exclude the 'debate_source.json' which is raw data
$Files = $Files | Where-Object { $_.Name -ne "debate_source.json" }

if ($Files.Count -eq 0) { Write-Error "No research_.json files found."; exit }

$CompiledContent = ""
$BookTitle = "Theological Synthesis: $Tag"
if ($Tag -eq "All") { $BookTitle = "Collected Research Papers" }

# Header for the text file (used by create_epub logic)
$CompiledContent += "$BookTitle`n"
$CompiledContent += "Date: $(Get-Date -Format 'yyyy-MM-dd')`n`n"
$CompiledContent += "<제목 차례>`n"

# First Pass: Generate TOC
$ChapterCounter = 1
foreach ($File in $Files) {
    $Data = Get-Content $File.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    
    # Check if file is relevant (If Tag is specific, check metadata tags)
    $IsRelevant = $true
    if ($Tag -ne "All") {
        if ($null -eq $Data.metadata.theological_tags -or $Data.metadata.theological_tags -notcontains $Tag) {
            $IsRelevant = $false
        }
    }

    if ($IsRelevant) {
        $CompiledContent += "$ChapterCounter. $($Data.metadata.bible_ref): $($Data.metadata.topic)`n"
        $ChapterCounter++
    }
}
$CompiledContent += "`n"

# Second Pass: Add Content
$ChapterCounter = 1
foreach ($File in $Files) {
    $Data = Get-Content $File.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    
    # Relevance Check
    $IsRelevant = $true
    if ($Tag -ne "All") {
        # Simple check: Does the WHOLE specific research file contain the tag?
        # A more advanced version would filter specific ROUNDS. 
        # For now, we include the whole research unit if it matches the theme.
        if ($null -eq $Data.metadata.theological_tags -or $Data.metadata.theological_tags -notcontains $Tag) {
            $IsRelevant = $false
        }
    }

    if ($IsRelevant) {
        Write-Host "   [+] Including: $($Data.metadata.topic)" -ForegroundColor Green
        
        $CompiledContent += "$ChapterCounter. $($Data.metadata.bible_ref): $($Data.metadata.topic)`n`n"
        
        # Add Metadata Block
        $CompiledContent += "[Metadata]`n"
        $CompiledContent += "Tags: $($Data.metadata.theological_tags -join ', ' )`n`n"
        
        # Add Rounds
        foreach ($Round in $Data.rounds) {
            # Normalize field names (generated json sometimes uses round_id, source uses id)
            $RId = if ($Round.psobject.Properties['round_id']) { $Round.round_id } else { $Round.id }
            $Theme = $Round.theme_ko

            $CompiledContent += "### Round ${RId}: $Theme`n"
            
            # Normalize Turns (generated vs source structure)
            $Turns = if ($Round.psobject.Properties['turns']) { $Round.turns } else { $Round.dialogues }

            foreach ($Turn in $Turns) {
                # Handle field variations
                $Spk = if ($Turn.psobject.Properties['speaker_name']) { $Turn.speaker_name } else { $Turn.spk }
                $Txt = if ($Turn.psobject.Properties['text_ko']) { $Turn.text_ko } else { $Turn.txt_ko }
                $Type = if ($Turn.psobject.Properties['type']) { $Turn.type } else { "" }
                
                $Prefix = ""
                if ($Type -eq "rebuttal") { $Prefix = "[비판] " }
                if ($Type -eq "defense") { $Prefix = "[방어] " }
                if ($Type -eq "synthesis") { $Prefix = "[종합] " }

                $CompiledContent += "**$Spk**: $Prefix$Txt`n`n"
            }
            $CompiledContent += "`n"
        }
        $CompiledContent += "[해설]`nEnd of Chapter $ChapterCounter`n`n"
        $ChapterCounter++
    }
}

$OutputFile = "synthesis_report.txt"
Set-Content -Path $OutputFile -Value $CompiledContent -Encoding UTF8

Write-Host "`n✅ Synthesis Complete. Saved to $OutputFile" -ForegroundColor Yellow
Write-Host "   Next Step: Run 'create_epub.ps1' (patched version) to publish." -ForegroundColor Gray
