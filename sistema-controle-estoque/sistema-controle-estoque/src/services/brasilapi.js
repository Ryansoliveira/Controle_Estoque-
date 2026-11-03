async function consultar(cnpj){
 const n=String(cnpj||'').replace(/\D/g,'');if(n.length!==14)throw Object.assign(new Error('Informe um CNPJ com 14 dígitos.'),{status:400});
 const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);
 try{const r=await fetch(`https://brasilapi.com.br/api/cnpj/v1/${n}`,{signal:c.signal});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(r.status===404?'CNPJ não encontrado.':'BrasilAPI indisponível no momento.'),{status:r.status===404?404:502});
 return {cnpj:d.cnpj||n,razaoSocial:d.razao_social||'',nomeFantasia:d.nome_fantasia||'',situacaoCadastral:d.descricao_situacao_cadastral||'',telefone:d.ddd_telefone_1||'',email:d.email||'',endereco:{logradouro:[d.descricao_tipo_de_logradouro,d.logradouro].filter(Boolean).join(' '),numero:d.numero||'',complemento:d.complemento||'',bairro:d.bairro||'',municipio:d.municipio||'',estado:d.uf||'',cep:d.cep||''}};
 }catch(e){if(e.name==='AbortError')throw Object.assign(new Error('Tempo limite da consulta excedido. Preencha manualmente.'),{status:504});throw e}finally{clearTimeout(t)}
}
module.exports={consultar};