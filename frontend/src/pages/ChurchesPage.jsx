// src/pages/ChurchesPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { IMaskInput } from 'react-imask';
import { getChurches, createChurch, updateChurch, deleteChurch } from '../api/churchApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const styles = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0' },
    title: { color: '#264653', fontSize: '1.8rem', fontWeight: 700 },
    addBtn: { background: '#2a9d8f', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' },
    search: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #a8dadc', outlineColor: '#2a9d8f', marginBottom: '1.2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' },
    card: { border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem', background: '#f1f6f9', boxShadow: '0 2px 6px rgb(38 70 83 / 0.15)', cursor: 'pointer' },
    pagination: { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 },
    pageBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid #264653', background: '#fff', color: '#264653', cursor: 'pointer' },
    activePg: { background: '#264653', color: '#fff' },

    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { background: '#fff', borderRadius: 12, padding: '2rem', maxWidth: '650px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: 10, right: 10, border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' },

    form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' },
    label: { fontWeight: 600, color: '#264653', marginBottom: 4 },
    input: { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #a8dadc', outlineColor: '#2a9d8f' },
    error: { color: '#e63946', fontSize: '0.8rem', marginTop: 2 },

    btnPrimary: { background: '#2a9d8f', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', marginRight: 8 },
    btnDanger: { background: '#e63946', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }
};

const emptyForm = {
    id: null,
    name: '',
    pastor_name: '',
    sucursal: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    contact_phone: '',
    contact_email: '',
    is_active: '1'
};

export default function ChurchesPage() {
    const [churches, setChurches] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [modalOpen, setModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const perPage = 10;
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

    // Carrega igrejas (memoizada) — remove warning do React
    const loadChurches = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getChurches({ page, per_page: perPage, search });
            const items = data.items || [];
            setTotalPages(data.total_pages || 1);

            if (isMobile) {
                setChurches(prev => (page === 1 ? items : [...prev, ...items]));
            } else {
                setChurches(items);
            }
        } catch {
            toast.error('Erro ao carregar');
        }
        setLoading(false);
    }, [page, perPage, search, isMobile]);

    // Executa sempre que page/search mudarem
    useEffect(() => {
        loadChurches();
    }, [loadChurches]);

    // Infinite scroll no mobile
    useEffect(() => {
        if (!isMobile) return;
        const onScroll = () => {
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
            if (nearBottom && !loading && page < totalPages) {
                setPage(p => p + 1);
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [loading, page, totalPages, isMobile]);

    // CEP -> preenche endereço
    async function fetchCep(cep) {
        const c = (cep || '').replace(/\D/g, '');
        if (c.length !== 8) return;
        try {
            const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
            const d = await r.json();
            if (!d.erro) {
                setForm(f => ({
                    ...f,
                    street: d.logradouro || '',
                    neighborhood: d.bairro || '',
                    city: d.localidade || '',
                    state: d.uf || ''
                }));
            }
        } catch {
            /* noop */
        }
    }

    function openModal(c = null) {
        setForm(c ? { ...c, is_active: String(c.is_active ?? '1') } : emptyForm);
        setModalOpen(true);
        setErrors({});
    }
    function closeModal() {
        setModalOpen(false);
        setForm(emptyForm);
    }

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = 'Obrigatório';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!validate()) return;
        try {
            if (form.id) await updateChurch(form.id, form);
            else await createChurch(form);
            toast.success(form.id ? 'Atualizada!' : 'Criada!');
            closeModal();
            // volta para a página 1 e deixa o efeito recarregar
            setPage(1);
            if (isMobile) setChurches([]); // evita duplicar na lista antes de recarregar
        } catch {
            toast.error('Erro ao salvar');
        }
    }

    async function handleDelete() {
        if (!window.confirm('Excluir igreja?')) return;
        try {
            await deleteChurch(form.id);
            toast.success('Excluída!');
            closeModal();
            setPage(1);
            if (isMobile) setChurches([]);
        } catch {
            toast.error('Erro ao excluir');
        }
    }

    function changePage(n) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPage(n);
    }

    return (
        <div style={styles.container}>
            <ToastContainer />
            <div style={styles.header}>
                <h1 style={styles.title}>Secretaria - AGIORB</h1>
                <button style={styles.addBtn} onClick={() => openModal(null)}>+ Nova Igreja</button>
            </div>

            <input
                style={styles.search}
                placeholder="Pesquisar..."
                value={search}
                onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                    if (isMobile) setChurches([]);
                }}
            />

            <div style={styles.grid}>
                {churches.map(ch => (
                    <div key={ch.id} style={styles.card} onClick={() => openModal(ch)}>
                        <b>{ch.name}</b><br />
                        <i>{ch.pastor_name}</i><br />
                        <small>{ch.city}/{ch.state}</small>
                    </div>
                ))}
            </div>

            {!isMobile && (
                <div style={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                            key={n}
                            style={n === page ? { ...styles.pageBtn, ...styles.activePg } : styles.pageBtn}
                            onClick={() => changePage(n)}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )}

            {isMobile && loading && <p style={{ textAlign: 'center', marginTop: 10 }}>Carregando...</p>}
            {isMobile && !loading && page === totalPages && (
                <p style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>Fim dos resultados</p>
            )}

            {modalOpen && (
                <div style={styles.overlay} onClick={closeModal}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={closeModal}>×</button>
                        <h3 style={{ textAlign: 'center' }}>{form.id ? 'Editar' : 'Nova'} Igreja</h3>

                        <form onSubmit={handleSave} style={styles.form}>
                            <div>
                                <label style={styles.label}>Nome</label>
                                <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                {errors.name && <div style={styles.error}>{errors.name}</div>}
                            </div>

                            <div>
                                <label style={styles.label}>Pastor Presidente</label>
                                <input style={styles.input} value={form.pastor_name} onChange={e => setForm({ ...form, pastor_name: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Sucursal</label>
                                <input style={styles.input} value={form.sucursal} onChange={e => setForm({ ...form, sucursal: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>CEP</label>
                                <IMaskInput
                                    mask="00000-000"
                                    style={styles.input}
                                    value={form.cep}
                                    onAccept={v => { setForm({ ...form, cep: v }); fetchCep(v); }}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Rua</label>
                                <input style={styles.input} value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Número</label>
                                <input style={styles.input} value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Complemento</label>
                                <input style={styles.input} value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Bairro</label>
                                <input style={styles.input} value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Cidade</label>
                                <input style={styles.input} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Estado</label>
                                <input style={styles.input} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                            </div>

                            <div>
                                <label style={styles.label}>Telefone</label>
                                <IMaskInput
                                    mask="+55 (00) 90000-0000"
                                    style={styles.input}
                                    value={form.contact_phone}
                                    onAccept={v => setForm({ ...form, contact_phone: v })}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>E-mail</label>
                                <input style={styles.input} value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={styles.label}>Status</label>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={String(form.is_active) === '1'}
                                            onChange={() => setForm({ ...form, is_active: '1' })}
                                        />{' '}
                                        Ativa
                                    </label>
                                    <label style={{ marginLeft: 10 }}>
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={String(form.is_active) === '0'}
                                            onChange={() => setForm({ ...form, is_active: '0' })}
                                        />{' '}
                                        Inativa
                                    </label>
                                </div>
                            </div>

                            <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '1rem' }}>
                                <button type="submit" style={styles.btnPrimary}>{form.id ? 'Salvar' : 'Cadastrar'}</button>
                                {form.id && (
                                    <button type="button" style={styles.btnDanger} onClick={handleDelete}>
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
