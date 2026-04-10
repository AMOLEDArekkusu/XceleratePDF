from flask import Flask, request, send_file, jsonify
import pandas as pd
import io
import os
import zipfile
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)

def create_pdf_for_sheet_list(sheets_dict, title_prefix=""):
    pdf_io = io.BytesIO()
    doc = SimpleDocTemplate(pdf_io, pagesize=landscape(A4), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    elements = []
    styles = getSampleStyleSheet()
    
    cell_style = styles['Normal']
    cell_style.wordWrap = 'CJK'
    
    header_style = getSampleStyleSheet()['Normal']
    header_style.fontName = 'Helvetica-Bold'
    
    for sheet_name, df in sheets_dict.items():
        title = f"Sheet: {sheet_name}" if not title_prefix else f"{title_prefix} - {sheet_name}"
        elements.append(Paragraph(title, styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        if df.empty:
            elements.append(Paragraph("Empty Sheet", styles['Normal']))
            elements.append(PageBreak())
            continue
        
        data = []
        headers = [Paragraph(str(col), header_style) for col in df.columns]
        data.append(headers)
        
        for _, row in df.iterrows():
            row_data = []
            for item in row:
                val = "" if pd.isna(item) else str(item)
                row_data.append(Paragraph(val, cell_style))
            data.append(row_data)
        
        page_width, _ = landscape(A4)
        avail_width = page_width - 60
        num_cols = max(len(df.columns), 1)
        col_width = avail_width / num_cols
        
        t = Table(data, colWidths=[col_width] * num_cols, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f2f2f2")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),
            ('BOX', (0,0), (-1,-1), 0.25, colors.black),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        
        elements.append(t)
        elements.append(PageBreak())
        
    doc.build(elements)
    pdf_io.seek(0)
    return pdf_io


@app.route('/api/convert', methods=['POST'])
def convert_excel_to_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({"error": "Invalid file type. Please upload .xlsx or .xls"}), 400

    separate_sheets = request.form.get('separate_sheets') == 'true'

    try:
        all_sheets = pd.read_excel(file, sheet_name=None)
        base_name = os.path.splitext(file.filename)[0]
        
        if separate_sheets and len(all_sheets) > 1:
            zip_io = io.BytesIO()
            with zipfile.ZipFile(zip_io, 'w', zipfile.ZIP_DEFLATED) as zf:
                for sheet_name, df in all_sheets.items():
                    pdf_buf = create_pdf_for_sheet_list({sheet_name: df})
                    clean_name = "".join(c for c in sheet_name if c.isalnum() or c in " ._-")
                    zf.writestr(f"{base_name}_{clean_name}.pdf", pdf_buf.getvalue())
            
            zip_io.seek(0)
            return send_file(zip_io, download_name=f"{base_name}_sheets.zip", as_attachment=True, mimetype='application/zip')
            
        else:
            pdf_io = create_pdf_for_sheet_list(all_sheets)
            return send_file(pdf_io, download_name=f"{base_name}.pdf", as_attachment=True, mimetype='application/pdf')

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5328)
