const api={
 async req(url,opt={}){const r=await fetch(url,{...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});const d=await r.json();if(!r.ok)throw Error(d.erro||'Erro na requisição');return d},
 get:(url)=>api.req(url),post:(url,d)=>api.req(url,{method:'POST',body:JSON.stringify(d)}),put:(url,d)=>api.req(url,{method:'PUT',body:JSON.stringify(d)}),del:url=>api.req(url,{method:'DELETE'})
};