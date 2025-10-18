import React,{useEffect,useState,useCallback} from 'react';
import api from '../../api/axios';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';
import AdminCard  from '../../components/admin/AdminCard';

export default function AdminMembersPage(){
    const empty={id:null,name:'',email:'',cpf_cnpj:'',phone:'',street:'',number:'',neighborhood:'',city:'',state:'',country:'',zip:'',is_active:'1'};
    const [members,setMembers]=useState([]);
    const [modal,setModal]=useState(false);
    const [form,setForm]=useState(empty);
    const [page,setPage]=useState(1);
    const [totalPages,setTotal]=useState(1);
    const [search,setSearch]=useState('');

    const load=useCallback(async()=>{
        const res=await api.get('/api/admin/members',{params:{page,search}});
        const arr=res.data.data.sort((a,b)=>a.name.localeCompare(b.name));
        setMembers(arr); setTotal(res.data.last_page);
    },[page,search]);

    useEffect(()=>{ load(); },[load]);

    async function save(e){e.preventDefault();
        if(form.id) await api.put(`/api/admin/members/${form.id}`,form);
        else await api.post('/api/admin/members',form);
        setModal(false); setPage(1); load();
    }
    async function remove(){
        if(window.confirm('Excluir membro?')){
            await api.delete(`/api/admin/members/${form.id}`); setModal(false); setPage(1); load();
        }
    }

    const bg='#2b2b2b', text='#eee';

    return (
        <div style={{background:bg,minHeight:'100vh',paddingTop:'1rem',color:text}}>
            <div style={{maxWidth:1200,margin:'0 auto',padding:'0 1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h2>Membros</h2>
                    <AdminButton onClick={()=>{setForm(empty);setModal(true);}}>+ Novo</AdminButton>
                </div>
                <input
                    style={{width:'100%',background:'#3b3b3b',color:'#fff',border:'1px solid #555',padding:8,borderRadius:6,margin:'1rem 0'}}
                    placeholder="Buscar membro..."
                    value={search}
                    onChange={e=>{setSearch(e.target.value); setPage(1);}}
                />
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem'}}>
                    {members.map(m=>(
                        <AdminCard key={m.id} onClick={()=>{setForm({...m,is_active:m.is_active?'1':'0'});setModal(true);}}>
                            <b style={{color:'#fff'}}>{m.name}</b><br/>
                            <small>{m.email}</small><br/>
                            <small>{m.city}/{m.state}</small>
                        </AdminCard>
                    ))}
                </div>
                <div style={{marginTop:20,display:'flex',justifyContent:'center',gap:8}}>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                        <button key={n} onClick={()=>setPage(n)} style={{
                            padding:'6px 12px',
                            borderRadius:6,
                            background:n===page?'#7b2cbf':'#3a3a3a',
                            color:'#fff',
                            border:'none',
                            cursor:'pointer'
                        }}>{n}</button>
                    ))}
                </div>
            </div>

            <AdminModal open={modal} onClose={()=>setModal(false)}>
                <h3>{form.id?'Editar':'Novo'} Membro</h3>
                <form onSubmit={save} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    {[
                        ['name','Nome'],['email','Email'],['cpf_cnpj','CPF/CNPJ'],['phone','Telefone'],
                        ['street','Rua'],['number','Número'],['neighborhood','Bairro'],
                        ['city','Cidade'],['state','Estado'],['country','País'],['zip','CEP']
                    ].map(([f,l])=>(
                        <div key={f}>
                            <label>{l}</label>
                            <input value={form[f]||''}
                                   onChange={e=>setForm({...form,[f]:e.target.value})}
                                   style={{width:'100%',padding:7,background:'#3d3d3d',color:'#fff',border:'1px solid #555',borderRadius:5}}/>
                        </div>
                    ))}
                    <div>
                        <label>Status</label>
                        <select value={form.is_active} onChange={e=>setForm({...form,is_active:e.target.value})}
                                style={{width:'100%',padding:7,background:'#3d3d3d',color:'#fff',border:'1px solid #555',borderRadius:5}}>
                            <option value="1">Ativo</option>
                            <option value="0">Inativo</option>
                        </select>
                    </div>

                    <div style={{gridColumn:'1/-1',textAlign:'center',marginTop:15}}>
                        <AdminButton type="submit">Salvar</AdminButton>
                        {form.id && <AdminButton type="button" style={{marginLeft:10,background:'#d62828'}} onClick={remove}>Excluir</AdminButton>}
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
