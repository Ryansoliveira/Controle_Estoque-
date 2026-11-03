const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const db=require('./src/models/store'),{consultar}=require('./src/services/brasilapi');
const PORT=process.env.PORT||3333,publicDir=path.join(__dirname,'public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))};
function body(req){return new Promise((ok,no)=>{let s='';req.on('data',c=>s+=c);req.on('end',()=>{try{ok(s?JSON.parse(s):{})}catch{no(Error('JSON inválido.'))}});req.on('error',no)})}
const digits=x=>String(x||'').replace(/\D/g,''),str=x=>String(x??'').trim();
function validF(d){if(!str(d.razaoSocial)||!digits(d.cnpj)||!str(d.telefone)||!str(d.email))return'O preenchimento de razão social, CNPJ, telefone e e-mail é obrigatório.';if(digits(d.cnpj).length!==14)return'CNPJ deve ter 14 dígitos.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(d.email)))return'E-mail inválido.';return null}
function validP(d){for(const k of ['nome','codigo','categoria','descricao','fornecedorId'])if(!str(d[k]))return`Campo ${k} é obrigatório.`;if(d.preco===''||!Number.isFinite(+d.preco)||+d.preco<0)return'Preço deve ser número não negativo.';if(d.quantidade===''||!Number.isInteger(+d.quantidade)||+d.quantidade<0)return'Quantidade deve ser inteiro não negativo.';return null}
async function api(req,res,u){
 const p=u.pathname.split('/').filter(Boolean),tipo=p[1],id=p[2],method=req.method;
 try{
 if(tipo==='brasilapi'&&p[2]==='cnpj'&&method==='GET'){try{return json(res,200,await consultar(u.searchParams.get('cnpj')))}catch(e){return json(res,e.status||502,{erro:e.message})}}
 if(!['produtos','fornecedores'].includes(tipo))return json(res,404,{erro:'Rota não encontrada.'});
 const [items,other]=await Promise.all([db.read(tipo),db.read(tipo==='produtos'?'fornecedores':'produtos')]);
 if(method==='GET'&&!id){let result=items;if(tipo==='produtos'){const nome=(u.searchParams.get('nome')||'').toLowerCase(),cat=u.searchParams.get('categoria')||'';result=items.filter(x=>x.nome.toLowerCase().includes(nome)&&(!cat||x.categoria===cat)).map(x=>({...x,fornecedor:other.find(f=>f.id===x.fornecedorId)||null}))}return json(res,200,result)}
 if(method==='GET'&&id){const x=items.find(x=>x.id===id);return json(res,x?200:404,x||{erro:'Registro não encontrado.'})}
 if(method==='POST'||method==='PUT'){
  const d=await body(req),err=tipo==='produtos'?validP(d):validF(d);if(err)return json(res,400,{erro:err});
  if(tipo==='produtos'){
   if(!other.some(f=>f.id===d.fornecedorId))return json(res,400,{erro:'Fornecedor não encontrado.'});
   if(items.some(x=>x.codigo.toLowerCase()===str(d.codigo).toLowerCase()&&x.id!==id))return json(res,409,{erro:'Código de produto já cadastrado.'});
  }else if(items.some(x=>digits(x.cnpj)===digits(d.cnpj)&&x.id!==id))return json(res,409,{erro:'CNPJ já cadastrado.'});
  if(method==='PUT'&&!items.some(x=>x.id===id))return json(res,404,{erro:'Registro não encontrado.'});
  const record=tipo==='produtos'?{nome:str(d.nome),codigo:str(d.codigo),categoria:str(d.categoria),descricao:str(d.descricao),preco:+d.preco,quantidade:+d.quantidade,fornecedorId:d.fornecedorId}:{razaoSocial:str(d.razaoSocial),nomeFantasia:str(d.nomeFantasia),cnpj:digits(d.cnpj),telefone:str(d.telefone),email:str(d.email),endereco:d.endereco||{}};
  if(method==='POST'){record.id=randomUUID();items.push(record)}else Object.assign(items[items.findIndex(x=>x.id===id)],record);
  await db.write(tipo,items);return json(res,method==='POST'?201:200,method==='POST'?record:items.find(x=>x.id===id));
 }
 if(method==='DELETE'&&id){if(!items.some(x=>x.id===id))return json(res,404,{erro:'Registro não encontrado.'});if(tipo==='fornecedores'&&other.some(x=>x.fornecedorId===id))return json(res,409,{erro:'Fornecedor possui produtos vinculados e não pode ser excluído.'});await db.write(tipo,items.filter(x=>x.id!==id));return json(res,200,{mensagem:'Excluído com sucesso.'})}
 return json(res,404,{erro:'Rota ou método não encontrado.'});
 }catch(e){return json(res,400,{erro:e.message||'Erro ao processar requisição.'})}
}
http.createServer((req,res)=>{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/'))return api(req,res,u);let f=path.join(publicDir,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));if(!f.startsWith(publicDir))return json(res,403,{erro:'Acesso negado.'});fs.readFile(f,(e,b)=>{if(e)return json(res,404,{erro:'Página não encontrada.'});res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});res.end(b)})}).listen(PORT,()=>console.log(`Estoque Fácil em http://localhost:${PORT}`));