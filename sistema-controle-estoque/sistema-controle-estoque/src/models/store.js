const fs=require('node:fs/promises'),path=require('node:path');
const dir=path.join(__dirname,'../../data');
async function read(name){try{return JSON.parse(await fs.readFile(path.join(dir,name+'.json'),'utf8'))}catch(e){if(e.code==='ENOENT'){await fs.mkdir(dir,{recursive:true});await write(name,[]);return[]}throw e}}
async function write(name,data){await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name+'.json'),JSON.stringify(data,null,2)+'\n')}
module.exports={read,write};