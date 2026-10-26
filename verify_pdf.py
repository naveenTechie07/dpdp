import fitz

doc = fitz.open("Srujana_DataSentinel_Project_Report.pdf")
print(f"Pages: {len(doc)}")
print(f"Valid PDF: {doc.is_pdf}")
print(f"Metadata title: {doc.metadata.get('title', 'N/A')}")

# Render cover page to image
page = doc[0]
pix = page.get_pixmap(dpi=80)
pix.save("cover_preview.png")
print(f"Cover page size: {page.rect.width} x {page.rect.height} points")

# Render a content page
page2 = doc[2] if len(doc) > 2 else doc[1]
pix2 = page2.get_pixmap(dpi=80)
pix2.save("content_preview.png")

doc.close()
print("Previews saved: cover_preview.png, content_preview.png")
