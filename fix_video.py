import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

old_block = """      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        >
          <source src="/videos/footer.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>"""

new_block = """      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/footer.mp4" type="video/mp4" />
      </video>"""

content = content.replace(old_block, new_block)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
