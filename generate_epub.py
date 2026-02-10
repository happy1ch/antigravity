import os
import re
import uuid
import zipfile
from datetime import datetime
import html
import shutil 

def generate_epub(txt_path, output_path):
    # 1. Read and Parse Text
    with open(txt_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    title = "웨스트민스터 소요리문답"
    author = "대한예수교장로회 행복한교회" # Default
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    # Simple metadata extraction from first few lines
    for i in range(min(10, len(lines))):
        line = lines[i].strip()
        if line.startswith("발행:"):
            author = line.split(":", 1)[1].strip()
        if line.startswith("발행일:"):
             # Try parse date or just use string
             pass 

    # Parsing Structure
    # Structure: List of Chapters. Chapter = {title, id, content_html, sub_sections}
    # We will treat "1. ...", "2. ..." as top level. 
    # "1.1. ..." as sub level.
    # Questions as content within sections.
    
    structure = []
    current_chapter = None
    current_section = None
    
    # Regex patterns
    # Chapter: 1. Title
    re_chapter = re.compile(r'^(\d+)\.\s+(.+)')
    # Section: 1.1. Title
    re_section = re.compile(r'^(\d+\.\d+)\.\s+(.+)')
    # Question: ▷ 문1 ...
    re_question = re.compile(r'^▷\s*(문\d+.*)')
    
    book_content = [] # Flat list of chapters/sections to generate files for
    
    # Helper to add content to current active container
    def add_line(text):
        nonlocal current_section, current_chapter
        if current_section:
            current_section['body'].append(text)
        elif current_chapter:
            current_chapter['body'].append(text)
        else:
             # Prologue or front matter
             pass

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check Section first (more specific)
        m_sec = re_section.match(line)
        if m_sec:
            sec_id = f"sec_{m_sec.group(1).replace('.', '_')}"
            current_section = {
                'title': line,
                'id': sec_id,
                'level': 2,
                'body': []
            }
            if current_chapter:
                current_chapter['children'].append(current_section)
            book_content.append(current_section)
            continue
            
        # Check Chapter
        m_chap = re_chapter.match(line)
        if m_chap:
            # If it looks like a chapter but might be "1. 서론..."
            # Note: The text has "1. 서론..." and "1.1. 서론..."
            chap_id = f"chap_{m_chap.group(1)}"
            current_chapter = {
                'title': line,
                'id': chap_id,
                'level': 1,
                'body': [],
                'children': []
            }
            current_section = None # Reset section
            book_content.append(current_chapter)
            structure.append(current_chapter)
            continue
        
        # Format Questions & Answers
        if line.startswith("▷"):
            add_line(f'<p class="question">{html.escape(line)}</p>')
        elif line.startswith("답)"):
            add_line(f'<p class="answer">{html.escape(line)}</p>')
        elif line.startswith("[해설]"):
            add_line(f'<p class="commentary"><strong>[해설]</strong> {html.escape(line[4:].strip())}</p>')
        elif re.match(r'^\(\d+\)', line):
            # Scripture ref
            add_line(f'<p class="scripture">{html.escape(line)}</p>')
        else:
            # Standard paragraph
            add_line(f'<p>{html.escape(line)}</p>')

    # 2. Build EPUB Structure
    base_dir = "epub_temp"
    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
    
    os.makedirs(os.path.join(base_dir, "META-INF"))
    os.makedirs(os.path.join(base_dir, "OEBPS", "Styles"))
    os.makedirs(os.path.join(base_dir, "OEBPS", "Text"))
    
    # mimetype
    with open(os.path.join(base_dir, "mimetype"), "w", encoding='ascii') as f:
        f.write("application/epub+zip")
        
    # container.xml
    with open(os.path.join(base_dir, "META-INF", "container.xml"), "w", encoding='utf-8') as f:
        f.write('''<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>''')

    # style.css
    with open(os.path.join(base_dir, "OEBPS", "Styles", "style.css"), "w", encoding='utf-8') as f:
        f.write('''
body { font-family: serif; line-height: 1.6; }
h1 { font-size: 1.5em; color: #333; border-bottom: 2px solid #333; padding-bottom: 0.5em; margin-top: 1em; }
h2 { font-size: 1.2em; color: #555; margin-top: 1em; }
.question { font-weight: bold; color: #000; margin-top: 1.5em; font-size: 1.1em; }
.answer { margin-left: 1em; color: #222; }
.commentary { margin-left: 1em; background-color: #f9f9f9; padding: 0.5em; border-left: 3px solid #ccc; color: #444; font-size: 0.95em; }
.scripture { margin-left: 2em; font-size: 0.9em; color: #666; font-style: italic; }
p { margin-bottom: 0.5em; }
''')

    # Create XHTMLs
    manifest_items = []
    spine_refs = []
    nav_points = []
    
    # Add Cover/Title Page (Optional, skipping for simplicity, starting with body)
    
    # Process content
    # If no content parsed (e.g. text doesn't match regex exactly), put everything in one file
    if not book_content:
        # Fallback for plain text
        book_content = [{'title': "본문", 'id': 'main', 'level': 1, 'body': [f"<p>{html.escape(l.strip())}</p>" for l in lines if l.strip()]}]
        structure = book_content
        
    for idx, item in enumerate(book_content):
        filename = f"section_{idx:03d}.xhtml"
        item['filename'] = filename
        
        # Build HTML content
        body_html = "\n".join(item['body'])
        title_html = f"<{ 'h1' if item['level']==1 else 'h2' }>{html.escape(item['title'])}</{ 'h1' if item['level']==1 else 'h2' }>"
        
        full_html = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>{html.escape(item['title'])}</title>
  <link href="../Styles/style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
  {title_html}
  {body_html}
</body>
</html>'''
        
        with open(os.path.join(base_dir, "OEBPS", "Text", filename), "w", encoding='utf-8') as f:
             f.write(full_html)
             
        manifest_items.append(f'<item id="{item["id"]}" href="Text/{filename}" media-type="application/xhtml+xml"/>')
        spine_refs.append(f'<itemref idref="{item["id"]}"/>')
        
    # Stylesheet in manifest
    manifest_items.append('<item id="css" href="Styles/style.css" media-type="text/css"/>')
    # Nav in manifest
    manifest_items.append('<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>')
    manifest_items.append('<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>')

    # Generate content.opf
    uid = str(uuid.uuid4())
    content_opf = f'''<?xml version="1.0" encoding="utf-8"?>
<package version="3.0" unique-identifier="BookId" xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:{uid}</dc:identifier>
    <dc:title>{title}</dc:title>
    <dc:creator>{author}</dc:creator>
    <dc:language>ko</dc:language>
    <meta property="dcterms:modified">{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")}</meta>
  </metadata>
  <manifest>
    {"    ".join(manifest_items)}
  </manifest>
  <spine toc="ncx">
    {"    ".join(spine_refs)}
  </spine>
</package>'''

    with open(os.path.join(base_dir, "OEBPS", "content.opf"), "w", encoding='utf-8') as f:
        f.write(content_opf)

    # Generate nav.xhtml (EPUB 3 TOC)
    # Flatten structure for nav? Or use nested?
    # Simple flat for now or single level nest based on children
    
    def build_nav_li(item):
        link = f'<li><a href="Text/{item["filename"]}">{html.escape(item["title"])}</a>'
        if 'children' in item and item['children']:
             link += "\n<ol>\n" + "\n".join([build_nav_li(c) for c in item['children']]) + "\n</ol>\n"
        link += "</li>"
        return link

    # We iterate over 'structure' which contains top level chapters with 'children'
    nav_links = []
    for chapter in structure:
         nav_links.append(build_nav_li(chapter))

    nav_xhtml = f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>목차</title>
  <link href="Styles/style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>목차</h1>
    <ol>
      {"\n".join(nav_links)}
    </ol>
  </nav>
</body>
</html>'''
    with open(os.path.join(base_dir, "OEBPS", "nav.xhtml"), "w", encoding='utf-8') as f:
        f.write(nav_xhtml)

    # Generate toc.ncx (EPUB 2 compatibility)
    ncx_points = []
    play_order = 1
    
    def build_ncx_point(item):
        nonlocal play_order
        point = f'''<navPoint id="{item["id"]}" playOrder="{play_order}">
      <navLabel><text>{html.escape(item["title"])}</text></navLabel>
      <content src="Text/{item["filename"]}"/>'''
        play_order += 1
        if 'children' in item and item['children']:
            for child in item['children']:
                point += "\n" + build_ncx_point(child)
        point += "\n</navPoint>"
        return point

    for chapter in structure:
        ncx_points.append(build_ncx_point(chapter))

    toc_ncx = f'''<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:{uid}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{title}</text></docTitle>
  <navMap>
    {"\n".join(ncx_points)}
  </navMap>
</ncx>'''
    with open(os.path.join(base_dir, "OEBPS", "toc.ncx"), "w", encoding='utf-8') as f:
        f.write(toc_ncx)

    # Zip it up
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z:
        # Write mimetype uncompressed
        z.write(os.path.join(base_dir, "mimetype"), "mimetype", compress_type=zipfile.ZIP_STORED)
        
        # Walk and write others
        for root, _, files in os.walk(base_dir):
            for file in files:
                if file == "mimetype": continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, base_dir)
                z.write(abs_path, rel_path)
                
    # Cleanup
    shutil.rmtree(base_dir)
    print(f"EPUB created at: {output_path}")

if __name__ == "__main__":
    generate_epub("d:/Antigravity/westminster.txt", "d:/Antigravity/book.epub")
