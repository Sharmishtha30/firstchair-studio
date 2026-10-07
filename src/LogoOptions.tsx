import './logo-options.css';
const options=[['01-pacifico','Pacifico'],['02-dancing-script','Dancing Script'],['03-caveat','Caveat'],['04-satisfy','Satisfy']];
export function LogoOptions(){
 return <main className="logo-options-page">
  <header className="logo-options-heading"><a href="/">Back to FirstChair Studio</a><h1>FirstChair logo options</h1><p>Four wordmarks at the current header’s 19px type size. The live logo is unchanged.</p></header>
  <div className="logo-options-grid">{options.map(([file,font],index)=><section className="logo-option" key={file} aria-labelledby={'logo-option-'+index}>
   <h2 id={'logo-option-'+index}>Option {index+1}</h2>
   <div className="logo-option-sky"><div className="sky-background" aria-hidden="true"><span/><span/><span/></div><img src={'/logo-options/'+file+'-white.svg'} alt={'FirstChair in '+font+', white'}/><p>{font}</p></div>
   <div className="logo-option-white"><img src={'/logo-options/'+file+'-indigo.svg'} alt={'FirstChair in '+font+', deep indigo'}/><p>{font}</p></div>
   <div className="logo-option-downloads">{(['white','indigo'] as const).map(color=><p key={color}>{color==='white'?'White':'Deep indigo'}: <a download href={'/logo-options/'+file+'-'+color+'.svg'}>SVG</a> · <a download href={'/logo-options/'+file+'-'+color+'.png'}>PNG</a></p>)}</div>
  </section>)}</div>
 </main>;
}
