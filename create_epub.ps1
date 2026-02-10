
# Theo-Stream EPUB Publishing Engine (Premium v2.0)
# This script generates highly aesthetic EPUB 3 files from Markdown/Text input.

# --- Configuration ---
$OutputFile = "TheoStream_Book.epub" # Default if not overridden
$Title = "Theological Knowledge"
$Author = "Theo-Stream AI"
$Language = "ko"
$Uuid = [Guid]::NewGuid().ToString()
$Date = (Get-Date).ToString("yyyy-MM-dd")

# --- Default Style CSS ---
$StyleCss = @"
@namespace "http://www.w3.org/1999/xhtml";

body {
    font-family: "Malgun Gothic", "Inter", -apple-system, sans-serif;
    line-height: 1.8;
    color: #2D3436;
    margin: 5% 8%;
    background-color: #FFFFFF;
}

h1 {
    font-size: 2.2em;
    color: #2D3436;
    border-bottom: 3px solid #0984E3;
    padding-bottom: 0.5em;
    margin-top: 2em;
    margin-bottom: 1em;
    text-align: center;
}

h2 {
    font-size: 1.6em;
    color: #0984E3;
    margin-top: 2em;
    border-left: 6px solid #0984E3;
    padding-left: 15px;
    margin-bottom: 0.8em;
}

h3 {
    font-size: 1.3em;
    background: #F1F2F6;
    padding: 12px;
    border-radius: 8px;
    color: #2F3542;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

p {
    margin-bottom: 1.2em;
    text-align: justify;
}

b, strong {
    color: #D63031;
}

blockquote, .commentary {
    background: #F9FBFF;
    border-left: 4px solid #0984E3;
    padding: 20px;
    margin: 25px 0;
    font-style: italic;
    color: #4A4A4A;
    border-radius: 0 8px 8px 0;
}

.metadata-box {
    font-size: 0.95em;
    background: #F8F9FA;
    padding: 15px;
    border: 1px solid #E9ECEF;
    border-radius: 10px;
    margin-bottom: 30px;
}

ul { margin-bottom: 1.5em; }
li { margin-bottom: 0.6em; }

table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
}

th, td {
    border: 1px solid #DFE4EA;
    padding: 14px;
    text-align: left;
}

th {
    background: #0984E3;
    color: white;
}
"@

# --- Helper Functions ---
function Escape-Html {
    param($Text)
    if (-not $Text) { return "" }
    return $Text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&apos;")
}

function Convert-TextToHtml {
    param($Content, $Title)
    
    $HtmlBody = "<h1>$(Escape-Html $Title)</h1>`n"
    $Lines = $Content -split "`r`n|`r|`n"
    $InList = $false

    foreach ($Line in $Lines) {
        $Line = $Line.Trim()
        if ([string]::IsNullOrWhiteSpace($Line)) { 
            if ($InList) { $HtmlBody += "</ul>`n"; $InList = $false }
            continue 
        }
        
        # Header Detection
        if ($Line.StartsWith("### ")) {
            $HtmlBody += "<h3>$(Escape-Html ($Line.Substring(4)))</h3>`n"
        }
        elseif ($Line.StartsWith("## ")) {
            $HtmlBody += "<h2>$(Escape-Html ($Line.Substring(3)))</h2>`n"
        }
        elseif ($Line.StartsWith("# ")) {
            $Val = $Line.Substring(2)
            if ($Val -ne $Title) { $HtmlBody += "<h1>$(Escape-Html $Val)</h1>`n" }
        }
        # List Handling
        elseif ($Line.StartsWith("- ") -or $Line.StartsWith("* ")) {
            if (-not $InList) { $HtmlBody += "<ul>`n"; $InList = $true }
            $HtmlBody += "<li>$(Escape-Html ($Line.Substring(2)))</li>`n"
        }
        # Metadata Block
        elseif ($Line.StartsWith("[") -and $Line.EndsWith("]")) {
            $HtmlBody += "<div class='metadata-box'><p>$(Escape-Html $Line)</p></div>`n"
        }
        # Paragraph with Bold Detection
        else {
            if ($InList) { $HtmlBody += "</ul>`n"; $InList = $false }
            $Escaped = Escape-Html $Line
            # Basic Markdown Bold support: **bold**
            $Formatted = [regex]::Replace($Escaped, "\*\*(.*?)\*\*", "<b>`$1</b>")
            $HtmlBody += "<p>$Formatted</p>`n"
        }
    }
    if ($InList) { $HtmlBody += "</ul>`n" }
    
    return @"
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
<head>
    <title>$(Escape-Html $Title)</title>
    <style>
    $StyleCss
    </style>
</head>
<body>
$HtmlBody
</body>
</html>
"@
}

# --- Core EPUB Generation Logic ---
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Add-ZipEntry {
    param($Archive, $Path, $Content)
    $Entry = $Archive.CreateEntry($Path, [System.IO.Compression.CompressionLevel]::Optimal)
    $Stream = $Entry.Open()
    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $Writer = New-Object System.IO.StreamWriter($Stream, $Utf8NoBom)
    $Writer.Write($Content)
    $Writer.Flush()
    $Writer.Dispose()
}

# Main Execution Orchestration
Write-Host "Starting Premium EPUB creation..."
if (Test-Path $OutputFile) { Remove-Item $OutputFile }

$Archive = [System.IO.Compression.ZipFile]::Open($OutputFile, "Create")

try {
    # 1. Mimetype (Stored first, no compression)
    $MimeEntry = $Archive.CreateEntry("mimetype", [System.IO.Compression.CompressionLevel]::NoCompression)
    $MimeStream = $MimeEntry.Open()
    $MimeBytes = [System.Text.Encoding]::ASCII.GetBytes("application/epub+zip")
    $MimeStream.Write($MimeBytes, 0, $MimeBytes.Length)
    $MimeStream.Dispose()

    # 2. Container
    $Container = @"
<?xml version='1.0' encoding='utf-8'?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>
"@
    Add-ZipEntry $Archive "META-INF/container.xml" $Container

    # 3. Content Sections
    $ManifestItems = ""
    $SpineItems = ""
    $NavItems = ""

    foreach ($Source in $SourceFiles) {
        $Raw = Get-Content $Source.filename -Raw -Encoding UTF8
        $Html = Convert-TextToHtml -Content $Raw -Title $Source.title
        Add-ZipEntry $Archive "OEBPS/$($Source.id).xhtml" $Html
        
        $ManifestItems += "    <item id=""$($Source.id)"" href=""$($Source.id).xhtml"" media-type=""application/xhtml+xml""/>`n"
        $SpineItems += "    <itemref idref=""$($Source.id)""/>`n"
        $NavItems += "    <li><a href=""$($Source.id).xhtml"">$($Source.title)</a></li>`n"
        Write-Host "Processed $($Source.filename)"
    }

    # 4. Navigation Doc (EPUB 3)
    $NavDoc = @"
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="ko">
<head><title>Navigation</title></head>
<body>
    <nav epub:type="toc" id="toc">
        <ol>
            $NavItems
        </ol>
    </nav>
</body>
</html>
"@
    Add-ZipEntry $Archive "OEBPS/nav.xhtml" $NavDoc

    # 5. OPF
    $Opf = @"
<?xml version='1.0' encoding='utf-8'?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="pub-id">urn:uuid:$Uuid</dc:identifier>
        <dc:title>$Title</dc:title>
        <dc:creator>$Author</dc:creator>
        <dc:language>$Language</dc:language>
        <meta property="dcterms:modified">$((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))</meta>
    </metadata>
    <manifest>
        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        $ManifestItems
    </manifest>
    <spine>
        $SpineItems
    </spine>
</package>
"@
    Add-ZipEntry $Archive "OEBPS/content.opf" $Opf
}
finally {
    $Archive.Dispose()
    Write-Host "Successfully created $OutputFile" -ForegroundColor Yellow
}
