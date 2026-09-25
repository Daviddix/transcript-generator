import zipfile
import xml.etree.ElementTree as ET

xlsx_path = "result-gp.xlsx"

with zipfile.ZipFile(xlsx_path, 'r') as z:
    wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rels_tree = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    r_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
    rel_map = {rel.attrib.get('Id'): rel.attrib.get('Target') for rel in rels_tree.findall('.//rel:Relationship', r_ns)}
    
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in ss_tree.findall('.//main:si', ns):
            texts = [t.text for t in si.findall('.//main:t', ns) if t.text is not None]
            shared_strings.append(''.join(texts))

    def get_val(c):
        t = c.attrib.get('t')
        v = c.find('main:v', ns)
        if v is None or v.text is None: return ''
        val_str = v.text
        if t == 's':
            idx = int(val_str)
            return shared_strings[idx] if idx < len(shared_strings) else ''
        return val_str

    for sheet in wb_tree.findall('.//main:sheet', ns):
        name = sheet.attrib.get('name')
        r_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = rel_map.get(r_id)
        sheet_path = 'xl/' + target if not target.startswith('xl/') else target
        
        ws_tree = ET.fromstring(z.read(sheet_path))
        for r_elem in ws_tree.findall('.//main:row', ns):
            r_num = int(r_elem.attrib.get('r'))
            row_matches = []
            for c_elem in r_elem.findall('main:c', ns):
                v = get_val(c_elem)
                if '001/24' in v:
                    ref = c_elem.attrib.get('r')
                    row_matches.append(ref)
            if row_matches:
                # Print row data
                row_cells = {c.attrib.get('r'): get_val(c) for c in r_elem.findall('main:c', ns)}
                non_empty = {k: v for k, v in row_cells.items() if v and v != '0'}
                print(f"Sheet '{name}', Row {r_num}: Matched in {row_matches}")
                print(f"  Non-empty values: {non_empty}")
