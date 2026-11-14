const sharp=require('../../node_modules/sharp');const [,,src,dst]=process.argv;
sharp(src).trim({threshold:1}).toBuffer({resolveWithObject:true}).then(({data,info})=>sharp(data).extend({top:4,bottom:4,left:4,right:4,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(dst)).then(i=>console.log(dst,i.width+'x'+i.height));
