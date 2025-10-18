import React,{useEffect,useState,useCallback} from 'react';
import api from '../../api/axios';
import AdminCard from '../../components/admin/AdminCard';
import AdminButton from '../../components/admin/AdminButton';
import AdminModal from '../../components/admin/AdminModal';

const emptyMember={id:null, name:'', email:''};

export default function AdminUsersPage(){
    const [list,setList]=useState([]);
    const [modal,setModal]=useState(false);
    const [member,setMember]=useState(emptyMember);
    const [page,setPage]=useState(1);
    const [totalPages,setTotal]=useState(1);
    const [search,setSearch]=useState('');

    const load = useCallback(async()=>{
        const res = await api.get('/api/admin/members',{params:{page,search}});
        setList(res.data.data.sort((a,b)=>a.name.localeCompare(b.name)));
        setTotal(res.data.last_page);
    },[page,search]);

    useEffect(()=>{ load(); },[load]);

    async function createUser(id){
        try {
            const r = await api.post(`/api/admin/members/${id}/create-user`);
            alert('Usuário criado.\nSenha: '+r.data.password);
            load();
        } catch(err){
            if(err.response && err.response.status === 422){
                alert(err.response.data.error || 'Já existe usuário com este e-mail.');
            } else {
                console.error(err);
                alert('Erro ao criar usuário');
            }
        }
    }

    async function updateStatus(uid,active){
        await api.put(`/api/admin/users/${uid}`,{is_active:active});
        load();
    }
    async function resetPwd(uid){
        const r=await api.post(`/api/admin/users/${uid}/reset-password`);
        alert('Nova senha: '+r.data.new_password);
    }

    return(
        <div style={{background:'#2b2b2b',minHeight:'100vh',paddingTop:20,color:'#eee'}}>
            <div style={{maxWidth:1200,margin:'0 auto',padding:'0 1rem'}}>
                <h2>Usuários / Acesso</h2>
                <input value={search} placeholder="Buscar..."
                       onChange={e=>{setSearch(e.target.value); setPage(1);}}
                       style={{background:'#3b3b3b',color:'#fff',border:'1px solid #555',padding:8,width:'100%',borderRadius:6}}/>
                <div style={{marginTop:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem'}}>
                    {list.map(m=>(
                        <AdminCard key={m.id} onClick={()=>{setMember(m);setModal(true);}}>
                            <b style={{color:'#fff'}}>{m.name}</b><br/>
                            <small>{m.email}</small><br/>
                            <small>{m.city}/{m.state}</small><br/>
                            {m.user?
                                <span style={{color:'#80ed99',fontSize:13}}>✔ possui acesso</span>:
                                <span style={{color:'#e63946',fontSize:13}}>✖ sem acesso</span>
                            }
                        </AdminCard>
                    ))}
                </div>
                <div style={{marginTop:20,textAlign:'center'}}>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                        <button key={n} onClick={()=>setPage(n)}
                                style={{marginRight:6,padding:'6px 12px',borderRadius:6,border:'none',
                                    background:n===page?'#7b2cbf':'#3d3d3d',color:'#fff',cursor:'pointer'}}>{n}</button>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            <AdminModal open={modal} onClose={()=>setModal(false)}>
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                {member.user ? (
                    <>
                        <p>Status: {member.user.is_active ? 'Ativo' : 'Inativo'}</p>
                        <AdminButton onClick={()=>resetPwd(member.user.id)}>Resetar senha</AdminButton>
                        <AdminButton style={{marginLeft:10}} onClick={()=>
                            updateStatus(member.user.id, member.user.is_active?0:1)
                        }>
                            {member.user.is_active?'Desativar acesso':'Ativar acesso'}
                        </AdminButton>
                    </>
                ) : (
                    <AdminButton onClick={()=>createUser(member.id)}>Criar acesso</AdminButton>
                )}
            </AdminModal>
        </div>
    );
}
