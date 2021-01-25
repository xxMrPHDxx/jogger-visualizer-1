const url = "https://gump500-api.glitch.me/api";
const title = "GUMP500"
const iconsPerRow = 6;
const iconBG = "lightgrey";
const iconColor= "green";
const headerH = 50;
const colSpacing = 20;
const rowSpacing = 10;
const nameSpacing = 20;
const progressMax = 100, progressSpeed = 10;

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
  // draw title
  ctx.fillStyle = 'black';
  ctx.font = `"Courier New" ${Math.floor(headerH * 0.75)}px`;
  ctx.fillText(title, canvas.width/2, headerH/2);
  // draw runners
  data.forEach((runner,i)=>draw_runners(ctx,icon,runner,i,maxTotal));
}

function draw_runners(ctx, icon, runner, i, maxTotal, j=0){
  //position
  const x = i%iconsPerRow*(icon.width+colSpacing)+(colSpacing/2);
  const y = headerH + Math.floor(i/iconsPerRow)*(icon.height+rowSpacing+nameSpacing)+(rowSpacing/2);
  //total
  ctx.fillText(Math.round(runner.total, 1), x+icon.width*0.24, y+icon.height*0.12);
  //progress
  const progressH = icon.height/500*runner.total;
  if(progressH > icon.height) progressH = icon.height;
  const yy = map(j,0,100,0,progressH);
  ctx.drawImage(icon, x, y, icon.width, icon.height);
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = 'black';
  ctx.fillRect(x, y+icon.height-yy, icon.width, yy);
  ctx.globalCompositeOperation = 'source-over';
  if(j <= progressMax) setTimeout(draw_runners, 100, ctx, icon, runner, i, maxTotal, j+progressSpeed);
  //name
  const textSize = Math.floor(nameSpacing * 0.75);
  const tx = x+icon.width/2-runner.name.length*0.24*textSize, ty = y+icon.height;
  ctx.fillStyle = 'white';
  ctx.fillRect(tx, ty, icon.width, textSize*1.2);
  ctx.fillStyle = 'black';
  ctx.font = `"Courier New" ${textSize}px`;
  ctx.fillText(runner.name, tx, ty + (nameSpacing/2));
}

Promise.resolve(setup());