import os
from PIL import Image, ImageDraw

def process():
    src = 'docs/assets/logo.png'
    dst_docs = 'docs/assets/logo_clean.png'
    dst_app_icon = 'frontend/app/icon.png'
    dst_public_logo = 'frontend/public/logo_final.png'
    dst_public_favicon = 'frontend/public/favicon.ico'
    
    print(f"Processing {src}...")
    try:
        img = Image.open(src).convert("RGBA")
        
        # Resize to standardize
        size = (1024, 1024)
        img = img.resize(size, Image.Resampling.LANCZOS)
        
        # Convert white/light pixels to transparent
        # Using a lower threshold (150) to catch off-white pixels
        datas = img.getdata()
        newData = []
        for item in datas:
            # If pixel is light colored (> 150), make it transparent
            if item[0] > 150 and item[1] > 150 and item[2] > 150:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # Apply rounded mask to clean edges
        margin = 5
        radius = 180
        
        mask = Image.new('L', size, 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle(
            [(margin, margin), (size[0]-margin, size[1]-margin)], 
            radius=radius, 
            fill=255
        )
        
        # Apply mask
        output = Image.new('RGBA', size, (0,0,0,0))
        output.paste(img, (0,0), mask=mask)
        
        # Crop to content
        bbox = output.getbbox()
        if bbox:
            print(f"Cropping to bbox: {bbox}")
            output = output.crop(bbox)
        
        # Save
        output.save(dst_docs, "PNG")
        print(f"Saved cleaned logo to {dst_docs}")
        
        if os.path.exists(os.path.dirname(dst_app_icon)):
             output.save(dst_app_icon, "PNG")

        if os.path.exists(os.path.dirname(dst_public_logo)):
             output.save(dst_public_logo, "PNG")
             output.save(dst_public_favicon, format='ICO', sizes=[(32,32)])
             print(f"Saved public assets to {dst_public_logo}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    process()
