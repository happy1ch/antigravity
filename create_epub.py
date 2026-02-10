
import os
import zipfile
import uuid
from datetime import datetime
import html

# Configuration
OUTPUT_FILE = 'book.epub'
TITLE = "Westminster Shorter Catechism & Genesis Report"
AUTHOR = "Ezra"
LANGUAGE = "ko"
UUID = str(uuid.uuid4())
DATE = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

SOURCE_FILES = [
    {"filename": "westminster_catechism.txt", "title": "웨스트민스터 소요리문답", "id": "chap1"},
    {"filename": "genesis_report.txt", "title": "창세기 33:18-20 리포트", "id": "chap2"}
]

STYLE_CSS = """
body { font-family: sans-serif; margin: 2rem; }
h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
h2 { color: #34495e; margin-top: 2rem; }
p { line-height: 1.6; }
.question { font-weight: bold; color: #d35400; margin-top: 1.5rem; }
.answer { margin-left: 1rem; color: #27ae60; }
.commentary { background: #f9f9f9; padding: 1rem; border-left: 4px solid #bdc3c7; margin: 1rem 0; font-style: italic; }
"""

def create_mimetype():
    return "application/epub+zip"

def create_container_xml():
    return """<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>
"""

def parse_text_to_html(text_content, title):
    html_body = f"<h1>{title}</h1>\n"
    lines = text_content.splitlines()
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        escaped_line = html.escape(line)
        
        # Simple heuristics for formatting
        if line.startswith("▷ 문") or line.startswith("문") and "문" in line[:5]:
            html_body += f'<p class="question">{escaped_line}</p>\n'
        elif line.startswith("답)"):
             html_body += f'<p class="answer">{escaped_line}</p>\n'
        elif line.startswith("[해설]") or line.startswith("["):
             html_body += f'<div class="commentary"><p>{escaped_line}</p></div>\n'
        elif line.startswith("I.") or line.startswith("II.") or line.startswith("III.") or line.startswith("1."):
             html_body += f'<h2>{escaped_line}</h2>\n'
        else:
             html_body += f'<p>{escaped_line}</p>\n'
             
    return f"""<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="{LANGUAGE}">
<head>
    <title>{title}</title>
    <link href="Styles/style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
{html_body}
</body>
</html>
"""

def create_content_opf(chapters):
    manifest_items = ""
    spine_refs = ""
    
    # Add CSS to manifest
    manifest_items += '<item id="style" href="Styles/style.css" media-type="text/css"/>\n'
    manifest_items += '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n'
    
    for chap in chapters:
        manifest_items += f'<item id="{chap["id"]}" href="{chap["id"]}.xhtml" media-type="application/xhtml+xml"/>\n'
        spine_refs += f'<itemref idref="{chap["id"]}"/>\n'

    return f"""<?xml version="1.0"  encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>{TITLE}</dc:title>
    <dc:creator>{AUTHOR}</dc:creator>
    <dc:language>{LANGUAGE}</dc:language>
    <dc:identifier id="uuid_id" opf:scheme="uuid">{UUID}</dc:identifier>
    <dc:date>{DATE}</dc:date>
  </metadata>
  <manifest>
    {manifest_items}
  </manifest>
  <spine toc="ncx">
    {spine_refs}
  </spine>
</package>
"""

def create_toc_ncx(chapters):
    nav_points = ""
    for idx, chap in enumerate(chapters):
        nav_points += f"""
    <navPoint id="navPoint-{idx+1}" playOrder="{idx+1}">
      <navLabel>
        <text>{chap["title"]}</text>
      </navLabel>
      <content src="{chap['id']}.xhtml"/>
    </navPoint>
"""
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="{UUID}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>{TITLE}</text>
  </docTitle>
  <navMap>
    {nav_points}
  </navMap>
</ncx>
"""

def main():
    chapters = []
    
    # Prepare Content
    for source in SOURCE_FILES:
        try:
            content = ""
            try:
                with open(source['filename'], 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                print(f"Warning: UTF-8 decode failed for {source['filename']}, trying CP949...")
                with open(source['filename'], 'r', encoding='cp949') as f:
                    content = f.read()
            
            html_content = parse_text_to_html(content, source['title'])
            chapters.append({
                "id": source['id'],
                "title": source['title'],
                "content": html_content
            })
            print(f"Processed {source['filename']}")
        except FileNotFoundError:
            print(f"Error: {source['filename']} not found. Skipping.")
        except Exception as e:
            print(f"Error processing {source['filename']}: {str(e)}")

    if not chapters:
        print("No content found. Exiting.")
        return

    # Create EPUB
    with zipfile.ZipFile(OUTPUT_FILE, 'w') as epub:
        # 1. Mimetype (Stored, not Compressed)
        epub.writestr("mimetype", create_mimetype(), compress_type=zipfile.ZIP_STORED)
        
        # 2. Container XML
        epub.writestr("META-INF/container.xml", create_container_xml(), compress_type=zipfile.ZIP_DEFLATED)
        
        # 3. CSS
        epub.writestr("OEBPS/Styles/style.css", STYLE_CSS, compress_type=zipfile.ZIP_DEFLATED)
        
        # 4. Content Files
        for chap in chapters:
            epub.writestr(f"OEBPS/{chap['id']}.xhtml", chap['content'], compress_type=zipfile.ZIP_DEFLATED)
            
        # 5. Content OPF
        epub.writestr("OEBPS/content.opf", create_content_opf(chapters), compress_type=zipfile.ZIP_DEFLATED)
        
        # 6. TOC NCX
        epub.writestr("OEBPS/toc.ncx", create_toc_ncx(chapters), compress_type=zipfile.ZIP_DEFLATED)

    print(f"Successfully created {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
