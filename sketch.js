const url = "https://gump500-api.glitch.me/api";
const title = "GUMP500"
const iconBG = "lightgrey";
const iconColor= "green";
const headerH = 80;
const spacing = 20;
const nameSpacing = 20;
const progressMax = 100, progressSpeed = 4;

function loadImage(url){
  return new Promise((res,rej)=>{
    const img = new Image();
    img.src = url;
    img.onload = ()=>res(img);
    img.onerror = rej;
  });
}

async function loadScaledImage(url,targetWidth=null,targetHeight=null){
  const img = await loadImage(url);
  if(typeof targetWidth!=='number' && typeof targetHeight!=='number') return img;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = typeof targetWidth==='number' ? targetWidth : img.width;
  ctx.canvas.height = typeof targetHeight==='number' ? targetHeight : img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, ctx.canvas.width, ctx.canvas.height);
  return ctx.canvas;
}

function map(a,b,c,d,e){ return d+(a-b)*(e-d)/(c-b); }

async function setup(){
  // create canvas and initialize drawing context
  const canvas = document.querySelector('canvas#screen');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const ctx = canvas.getContext('2d');
  // Center all text
  ctx.textAlign = 'center';
  // load json from api and the icons
  const [data, icon] = await Promise.all([
    fetch(url).then(res=>res.json()),
    loadScaledImage('img/jogging.png', 90, 120)
  ]);
  // recalculate total miles per runner as api doesn't show correct number
  let maxTotal = 0;
  data.forEach(runner =>{    
    runner.total = runner.history.reduce((sum, {miles})=>sum+miles, 0);
    if(runner.total > maxTotal) maxTotal = runner.total;
  });
  // sort from ascending
  data.sort((a,b)=>b.total-a.total);
  // draw runners
  for(let j=0; j<=progressMax; j+=progressSpeed)
    setTimeout(()=>{
      // background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // draw title
      ctx.fillStyle = 'black';
      ctx.font = `bold 32px "Arial Black"`;
      ctx.fillText(title, canvas.width/2, headerH/2);
      // draw runners
      data.forEach((runner,i)=>draw_runners(ctx,icon,runner,i,maxTotal,j)); 
    }, j*10);
}

function draw_runners(ctx, icon, runner, i, maxTotal, j){
  // constants
  const ww = icon.width + spacing, hh = icon.height + spacing;
  const iconsPerRow = Math.floor(ctx.canvas.width/ww);
  const xoff = (ctx.canvas.width - ww*iconsPerRow) / 2;
  const textSize = Math.floor(nameSpacing * 0.75);
  console.log(textSize);
  //position
  const x = xoff + (i%iconsPerRow) * ww;
  const y = headerH + Math.floor(i/iconsPerRow) * hh;
  //progress
  const h = map(runner.total, 0, maxTotal, 0, icon.height);
  const ph = map(j, 0, 100, 0, h);
  ctx.globalCompositeOperation = 'xor';
  ctx.drawImage(icon, x, y, icon.width, icon.height);
  ctx.fillStyle = '#d0d';
  ctx.fillRect(x, y+icon.height-ph, icon.width, ph);
  ctx.globalCompositeOperation = 'source-over';
  //total
  ctx.fillStyle = '#000';
  ctx.font = `bold 24px "Courier New"`;
  ctx.fillText(Math.round(runner.total, 1), x+icon.width/2, y+icon.height/2);
  //name
  ctx.font = `12px "Courier New"`;
  ctx.fillText(runner.name, x+icon.width/2, y+icon.height + (nameSpacing/2));
}

Promise.resolve(setup());