"""Use fonttools + uharfbuzz to shape actual Google Fonts into portable SVG paths."""
from pathlib import Path
from io import BytesIO
import json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

root=Path(__file__).resolve().parents[1]/'public/logo-options'
options=[('pacifico','Pacifico',400),('dancingscript','Dancing Script',600),('caveat','Caveat',600),('satisfy','Satisfy',400)]
manifest=[]
for number,(slug,name,weight) in enumerate(options,1):
    source=next((root/'fonts').glob(slug+'-*.ttf'))
    tt=TTFont(source)
    if 'fvar' in tt: tt=instantiateVariableFont(tt,{'wght':weight})
    data=BytesIO();tt.save(data)
    face=hb.Face(data.getvalue());font=hb.Font(face);font.scale=(face.upem,face.upem)
    buf=hb.Buffer();buf.add_str('FirstChair');buf.guess_segment_properties();hb.shape(font,buf)
    glyphs=tt.getGlyphSet();order=tt.getGlyphOrder();svg=SVGPathPen(glyphs);bounds=BoundsPen(glyphs)
    x=y=0
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        transform=(1,0,0,-1,x+pos.x_offset,-y-pos.y_offset)
        glyph=glyphs[order[info.codepoint]]
        glyph.draw(TransformPen(svg,transform));glyph.draw(TransformPen(bounds,transform))
        x+=pos.x_advance;y+=pos.y_advance
    left,top,right,bottom=bounds.bounds
    pad=face.upem*.035
    left-=pad;top-=pad;w=right-left+pad;h=bottom-top+pad
    width=w/face.upem*19;height=h/face.upem*19
    prefix=f'{number:02d}-'+name.lower().replace(' ','-')
    for color,value in [('white','#ffffff'),('indigo','#201047')]:
        markup=f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.4f}" height="{height:.4f}" viewBox="{left:g} {top:g} {w:g} {h:g}" role="img" aria-label="FirstChair"><title>FirstChair — {name}</title><path fill="{value}" d="{svg.getCommands()}"/></svg>\n'
        (root/f'{prefix}-{color}.svg').write_text(markup)
    manifest.append({'number':number,'name':name,'weight':weight,'prefix':prefix,'width':width,'height':height,'source':str(source.relative_to(root))})
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Created eight outlined SVGs at the existing 19px header type size.')
