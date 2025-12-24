import base64
import os

def create_dev_logo():
    # Paths
    base_dir = '/Users/tristan/Documents/words/coaching/StudioSync'
    input_path = os.path.join(base_dir, 'frontend/public/logo.png')
    output_path = os.path.join(base_dir, 'frontend/public/logo-dev.svg')

    try:
        with open(input_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
        scale = 1.3
        size = 1024 * scale
        offset = (1024 - size) / 2
            
        svg_content = f'''<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- This is your CSS "border-radius: 15%" equivalent -->
    <clipPath id="icon-mask">
      <rect x="0" y="0" width="1024" height="1024" rx="154" ry="154" />
    </clipPath>
  </defs>

  <!-- We apply the clip-path (mask) to a group containing everything -->
  <g clip-path="url(#icon-mask)">
    <!-- Embedded Original Logo (Base64) -->
    <image href="data:image/png;base64,{encoded_string}" x="{offset}" y="{offset}" width="{size}" height="{size}" preserveAspectRatio="xMidYMid slice" />
    
    <!-- Red Banner Background -->
    <rect x="0" y="844" width="1024" height="180" fill="#EF4444" />
    
    <!-- DEV Text -->
    <text x="512" y="964" font-family="Arial, sans-serif" font-weight="900" font-size="100" fill="white" text-anchor="middle">DEV</text>
  </g>
</svg>'''

        with open(output_path, "w") as svg_file:
            svg_file.write(svg_content)
            
        print(f"✅ Successfully created: {output_path} (with 15% rounded corners)")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    create_dev_logo()
