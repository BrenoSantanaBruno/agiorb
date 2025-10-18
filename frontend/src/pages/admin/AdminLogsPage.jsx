import React,{useEffect,useState} from 'react';
import api from '../../api/axios';
import AdminModal from '../../components/admin/AdminModal';
import AdminCard from '../../components/admin/AdminCard';

export default function AdminLogsPage(){
    const [logs,setLogs]=useState([]);
    const [page,setPage]=useState(1);
    const [total,setTotal]=useState(1);
    const [loading,setLoading]=useState(false);
    const [sel,setSel]=useState(null);

    useEffect(()=>{ load(); },[page]);
    async function load(){
        setLoading(true);
        const r = await api.get('/api/admin/audit-logs',{params:{page}});
        setLogs(r.data.data);
        setTotal(r.data.last_page);
        setLoading(false);
    }

    return(
        <div style={{background:'#2b2b2b',minHeight:'100vh',paddingTop:20,color:'#eee'}}>
            <div style={{maxWidth:1100,margin:'0 auto',padding:'0 1rem'}}>
                <h2>Audit Logs</h2>
                {loading && <p>Carregando…</p>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1rem'}}>
                    {logs.map(l=>(
                        <AdminCard key={l.id} onClick={()=>setSel(l)}>
                            <b style={{color:'#fff'}}>#{l.id}</b><br/>
                            <small>{new Date(l.created_at).toLocaleString()}</small><br/>
                            <small>Usuário: {l.user_name}</small><br/>
                            <small>Ação: {l.action} - {l.url}</small>
                        </AdminCard>
                    ))}
                </div>
                <div style={{marginTop:15,textAlign:'center'}}>
                    {Array.from({length:total},(_,i)=>i+1).map(n=>(
                        <button key={n} onClick={()=>setPage(n)}
                                style={{marginRight:6,padding:'6px 12px',borderRadius:6,border:'none',
                                    background:n===page?'#7b2cbf':'#3a3a3a',color:'#fff',cursor:'pointer'}}>{n}</button>
                    ))}
                </div>
            </div>

            <AdminModal open={sel} onClose={()=>setSel(null)}>
                {sel && (
                    <>
                        <h3>Log #{sel.id}</h3>
                        <p><b>Usuário:</b> {sel.user_name} (ID {sel.user_id})</p>
                        <p><b>IP:</b> {sel.ip}</p>
                        <p><b>Navegador:</b> {sel.browser}</p>
                        <p><b>Local:</b> {sel.location || '-'}</p>
                        <p><b>Ação:</b> {sel.action}</p>
                        <p><b>URL:</b> {sel.url}</p>
                        <div>
                            <h4>Old Values</h4>
                            <pre style={{background:'#333',padding:10,borderRadius:6,maxHeight:150,overflow:'auto'}}>
                {JSON.stringify(sel.old_values,null,2)}
              </pre>
                            <h4>New Values</h4>
                            <pre style={{background:'#333',padding:10,borderRadius:6,maxHeight:150,overflow:'auto'}}>
                {JSON.stringify(sel.new_values,null,2)}
              </pre>
                        </div>
                    </>
                )}
            </AdminModal>
        </div>
    );
}
