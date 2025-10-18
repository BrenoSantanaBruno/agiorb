// src/pages/TransactionsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactionImage,
} from '../api/transactionApi';

import { getChurches } from '../api/churchApi';
import FilePreviewModal from '../components/FilePreviewModal';
import { assetUrl } from '../utils/files';

const styles = {
    container: { maxWidth: 1200, margin: '0 auto', padding: '0 1rem' },
    title: { textAlign: 'center', color: '#264653', margin: '1.25rem 0', fontSize: '1.8rem', fontWeight: 800 },

    // top actions / filters
    actions: { display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    leftActions: { display: 'flex', gap: 8, alignItems: 'center' },
    addBtn: { background: '#2a9d8f', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    select: { padding: '8px 12px', border: '1px solid #a8dadc', borderRadius: 8, outlineColor: '#2a9d8f' },
    input: { padding: '8px 12px', border: '1px solid #a8dadc', borderRadius: 8, outlineColor: '#2a9d8f' },

    // table
    tableWrap: { overflowX: 'auto', marginTop: 12 },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: 900, background: '#fff', borderRadius: 8, overflow: 'hidden' },
    th: { textAlign: 'left', padding: '10px 12px', background: '#eaf4f4', color: '#264653', fontWeight: 700, borderBottom: '1px solid #dfeeee' },
    td: { padding: '8px 12px', borderBottom: '1px solid #f2f2f2', color: '#334', verticalAlign: 'top' },
    badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
    badgeIncome: { background: '#e6f8ef', color: '#137a3a' },
    badgeExpense: { background: '#fde8ea', color: '#b02133' },
    smallBtn: { border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
    smallDanger: { background: '#e63946', color: '#fff' },
    smallNeutral: { background: '#264653', color: '#fff' },

    // pagination
    pager: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10 },
    pagerBtn: { border: '1px solid #264653', background: '#fff', color: '#264653', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' },
    pagerBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

    // modal
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { background: '#fff', borderRadius: 12, padding: '1.25rem', maxWidth: 900, width: '95%', maxHeight: '92vh', overflow: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: 8, right: 12, border: 'none', background: 'transparent', fontSize: '22px', cursor: 'pointer' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' },
    label: { fontWeight: 700, color: '#264653', marginBottom: 4, display: 'block' },
    field: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #a8dadc', outlineColor: '#2a9d8f' },
    block: { gridColumn: '1/-1' },
    actionsRow: { gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 },
    primaryBtn: { background: '#2a9d8f', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
    dangerBtn: { background: '#e63946', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },

    // combobox (church)
    comboList: { border: '1px solid #ddd', borderRadius: 8, maxHeight: 240, overflowY: 'auto', background: '#fff', marginTop: 6 },
    comboItem: { padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #f1f1f1' },
    comboLoadMore: { textAlign: 'center', padding: 8, cursor: 'pointer', color: '#2a9d8f' },

    thumb: { display: 'block', width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' },
};

const perPage = 10;

const emptyForm = {
    id: null,
    church_id: '',
    description: '',
    type: 'income', // income | expense
    amount: '',
    date: '',
    category: '',
    items: [{ description: '', quantity: 1, unit_price: '' }],
    images: [],
};

export default function TransactionsPage() {
    // list
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingList, setLoadingList] = useState(false);

    // filters
    const [filterChurchId, setFilterChurchId] = useState('');

    // modal form
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    // combo churches (form)
    const [comboOpen, setComboOpen] = useState(false);
    const [churches, setChurches] = useState([]);
    const [churchSearch, setChurchSearch] = useState('');
    const [churchPage, setChurchPage] = useState(1);
    const [churchTotalPages, setChurchTotalPages] = useState(1);
    const [loadingChurches, setLoadingChurches] = useState(false);

    // file viewer
    const [viewer, setViewer] = useState({ open: false, files: [], index: 0 });
    const openViewer = (files, idx = 0) => setViewer({ open: true, files, index: idx });
    const closeViewer = () => setViewer(v => ({ ...v, open: false }));
    const prevViewer = () => setViewer(v => ({ ...v, index: Math.max(0, v.index - 1) }));
    const nextViewer = () => setViewer(v => ({ ...v, index: Math.min(v.files.length - 1, v.index + 1) }));

    const isFutureDate = useCallback((iso) => {
        if (!iso) return false;
        const d = new Date(iso);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d.getTime() > today.getTime();
    }, []);

    const formatDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const loadTransactions = useCallback(async () => {
        setLoadingList(true);
        try {
            const data = await getTransactions({ page, church_id: filterChurchId || undefined });
            // sua API retorna paginate laravel => { data, current_page, last_page }?
            // Pela sua transactionApi.js você já garante: Array.isArray ? res.data : res.data.data || [];
            // Para paginação, vamos tentar ler de res.data se existir; senão, assume só array.
            if (Array.isArray(data)) {
                setTransactions(data);
                setTotalPages(1);
            } else {
                const items = data.data || data.items || [];
                setTransactions(items);
                setTotalPages(data.last_page || data.total_pages || 1);
            }
        } catch (e) {
            toast.error('Erro ao carregar transações.');
        } finally {
            setLoadingList(false);
        }
    }, [page, filterChurchId]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    // load churches for combobox (form)
    const fetchChurches = useCallback(async (pageToLoad = 1, search = '') => {
        setLoadingChurches(true);
        try {
            const data = await getChurches({ page: pageToLoad, per_page: 10, search });
            const items = data.items || data.data || [];
            const tp = data.total_pages || data.last_page || 1;
            setChurchTotalPages(tp);
            setChurchPage(pageToLoad);
            setChurches(prev => (pageToLoad === 1 ? items : [...prev, ...items]));
        } catch {
            toast.error('Erro ao carregar igrejas.');
        } finally {
            setLoadingChurches(false);
        }
    }, []);

    // quando abrir combobox pela 1ª vez
    useEffect(() => {
        if (comboOpen) fetchChurches(1, churchSearch);
    }, [comboOpen, churchSearch, fetchChurches]);

    // handlers do form
    const resetForm = () => {
        setForm(emptyForm);
        setErrors({});
    };

    const openCreate = () => {
        resetForm();
        setOpenModal(true);
    };

    const openEdit = (t) => {
        setForm({
            id: t.id,
            church_id: t.church_id || t.church?.id || '',
            description: t.description || '',
            type: t.type || 'income',
            amount: t.amount || '',
            date: t.date ? t.date.substring(0, 10) : '', // yyyy-mm-dd
            category: t.category || '',
            items: (t.items && t.items.length) ? t.items.map(i => ({
                id: i.id,
                description: i.description,
                quantity: i.quantity,
                unit_price: i.unit_price
            })) : [{ description: '', quantity: 1, unit_price: '' }],
            images: [], // novos uploads (se houver)
        });
        setOpenModal(true);
    };

    const validateForm = () => {
        const e = {};
        if (!form.church_id) e.church_id = 'Selecione a igreja.';
        if (!form.description?.trim()) e.description = 'Informe a descrição.';
        if (!form.amount || Number(form.amount) <= 0) e.amount = 'Informe um valor válido.';
        if (!form.date) e.date = 'Informe a data.';
        if (isFutureDate(form.date)) e.date = 'Data no futuro não é permitida.';
        if (!form.items || !form.items.length || !form.items[0].description?.trim()) {
            e.items = 'Inclua pelo menos um item com descrição.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleItemChange = (idx, name, value) => {
        setForm(f => {
            const items = [...f.items];
            const cur = { ...items[idx] };
            if (name === 'quantity') {
                cur.quantity = value === '' ? '' : Math.max(1, parseInt(value, 10) || 1);
            } else if (name === 'unit_price') {
                // normaliza para 2 casas
                const cents = String(value).replace(/[^\d]/g, '');
                cur.unit_price = (parseInt(cents || '0', 10) / 100).toFixed(2);
            } else {
                cur[name] = value;
            }
            items[idx] = cur;
            return { ...f, items };
        });
    };
    const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unit_price: '' }] }));
    const removeItem = (idx) => setForm(f => {
        const items = [...f.items];
        items.splice(idx, 1);
        return { ...f, items: items.length ? items : [{ description: '', quantity: 1, unit_price: '' }] };
    });

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!validateForm()) return;

        try {
            const fd = new FormData();
            Object.keys(form).forEach((k) => {
                if (k === 'items') fd.append('items', JSON.stringify(form.items));
                else if (k === 'images') {
                    (form.images || []).forEach(file => fd.append('images[]', file));
                } else {
                    fd.append(k, form[k] == null ? '' : form[k]);
                }
            });

            if (form.id) {
                await updateTransaction(form.id, fd);
                toast.success('Transação atualizada!');
            } else {
                await createTransaction(fd);
                toast.success('Transação criada!');
            }
            setOpenModal(false);
            resetForm();
            setPage(1);
            loadTransactions();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Erro ao salvar transação.';
            toast.error(msg);
        }
    };

    const handleDeleteTx = async (t) => {
        if (!window.confirm('Deseja excluir esta transação?')) return;
        try {
            await deleteTransaction(t.id);
            toast.success('Transação excluída!');
            loadTransactions();
        } catch {
            toast.error('Erro ao excluir.');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Remover este comprovante?')) return;
        try {
            await deleteTransactionImage(imageId);
            toast.success('Comprovante removido!');
            // se estiver editando, atualize a lista novamente
            loadTransactions();
        } catch {
            toast.error('Erro ao remover comprovante.');
        }
    };

    // memo de churches como map id->name (para filtro superior rápido)
    const churchesMap = useMemo(() => {
        const map = new Map();
        churches.forEach(c => map.set(c.id, c.name));
        return map;
    }, [churches]);

    return (
        <div style={styles.container}>
            <ToastContainer />

            <h1 style={styles.title}>Tesouraria - Fluxo de Caixa</h1>

            <div style={styles.actions}>
                <div style={styles.leftActions}>
                    <button style={styles.addBtn} onClick={openCreate}>+ Nova Transação</button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    {/* filtro de igreja para a lista */}
                    <select
                        style={styles.select}
                        value={filterChurchId}
                        onChange={(e) => { setFilterChurchId(e.target.value); setPage(1); }}
                    >
                        <option value="">Todas as igrejas</option>
                        {/* Mostra as já carregadas no combobox ao menos */}
                        {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Igreja</th>
                        <th style={styles.th}>Descrição</th>
                        <th style={styles.th}>Data</th>
                        <th style={styles.th}>Tipo</th>
                        <th style={styles.th}>Valor</th>
                        <th style={styles.th}>Comprovantes</th>
                        <th style={styles.th}>Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {!loadingList && transactions.length === 0 && (
                        <tr><td style={styles.td} colSpan={8}>Nenhum registro.</td></tr>
                    )}

                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <td style={styles.td}>{t.id}</td>
                            <td style={styles.td}>{t.church?.name || '—'}</td>
                            <td style={styles.td}>{t.description}</td>
                            <td style={styles.td}>{formatDate(t.date)}</td>
                            <td style={styles.td}>
                  <span
                      style={{
                          ...styles.badge,
                          ...(t.type === 'income' ? styles.badgeIncome : styles.badgeExpense),
                      }}
                  >
                    {t.type === 'income' ? 'Entrada' : 'Saída'}
                  </span>
                            </td>
                            <td style={styles.td}>R$ {parseFloat(t.amount || 0).toFixed(2)}</td>
                            <td style={styles.td}>
                                {t.images?.length ? (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {t.images.map((img, i) => (
                                            <div key={img.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                <button
                                                    type="button"
                                                    title="Visualizar"
                                                    style={{ border: '1px solid #ddd', background: '#fff', borderRadius: 6, padding: 0, cursor: 'pointer' }}
                                                    onClick={() => openViewer(t.images, i)}
                                                >
                                                    <img src={assetUrl(img.path)} alt="" style={styles.thumb} />
                                                </button>
                                                {/* botão para excluir a imagem direto da tabela (opcional) */}
                                                <button style={{ ...styles.smallBtn, ...styles.smallDanger }} onClick={() => handleDeleteImage(img.id)}>
                                                    Remover
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : '—'}
                            </td>
                            <td style={styles.td}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button style={{ ...styles.smallBtn, ...styles.smallNeutral }} onClick={() => openEdit(t)}>Editar</button>
                                    <button style={{ ...styles.smallBtn, ...styles.smallDanger }} onClick={() => handleDeleteTx(t)}>Excluir</button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {loadingList && (
                        <tr><td style={styles.td} colSpan={8}>Carregando...</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* paginação simples */}
            <div style={styles.pager}>
                <button
                    style={{ ...styles.pagerBtn, ...(page <= 1 ? styles.pagerBtnDisabled : {}) }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                >
                    ‹ Anterior
                </button>
                <div>{page} / {totalPages}</div>
                <button
                    style={{ ...styles.pagerBtn, ...(page >= totalPages ? styles.pagerBtnDisabled : {}) }}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    Próxima ›
                </button>
            </div>

            {/* modal de criar/editar */}
            {openModal && (
                <div style={styles.overlay} onClick={() => setOpenModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setOpenModal(false)}>×</button>
                        <h3 style={{ textAlign: 'center', color: '#264653', marginTop: 0 }}>
                            {form.id ? 'Editar Transação' : 'Nova Transação'}
                        </h3>

                        <form onSubmit={handleSubmit} style={styles.formGrid}>
                            {/* IGREJA - combo */}
                            <div className="block" style={styles.block}>
                                <label style={styles.label}>Igreja</label>
                                <input
                                    readOnly
                                    placeholder="Selecione a igreja"
                                    value={churches.find(c => c.id === form.church_id)?.name || ''}
                                    style={styles.field}
                                    onClick={() => setComboOpen(o => !o)}
                                />
                                {errors.church_id && <div style={{ color: '#e63946', fontSize: 12 }}>{errors.church_id}</div>}

                                {comboOpen && (
                                    <div style={{ marginTop: 6 }}>
                                        <input
                                            placeholder="Buscar igreja..."
                                            value={churchSearch}
                                            onChange={(e) => setChurchSearch(e.target.value)}
                                            style={{ ...styles.field, marginBottom: 6 }}
                                        />
                                        <div style={styles.comboList}>
                                            {churches.map(c => (
                                                <div
                                                    key={c.id}
                                                    style={{
                                                        ...styles.comboItem,
                                                        background: c.id === form.church_id ? '#eaf4f4' : '#fff'
                                                    }}
                                                    onClick={() => {
                                                        setForm(f => ({ ...f, church_id: c.id }));
                                                        setComboOpen(false);
                                                    }}
                                                >
                                                    {c.name}
                                                </div>
                                            ))}

                                            {loadingChurches && <div style={{ padding: 10, textAlign: 'center' }}>Carregando...</div>}

                                            {!loadingChurches && churchPage < churchTotalPages && (
                                                <div
                                                    style={styles.comboLoadMore}
                                                    onClick={() => fetchChurches(churchPage + 1, churchSearch)}
                                                >
                                                    carregar mais...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="block" style={styles.block}>
                                <label style={styles.label}>Descrição</label>
                                <input
                                    style={styles.field}
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                />
                                {errors.description && <div style={{ color: '#e63946', fontSize: 12 }}>{errors.description}</div>}
                            </div>

                            <div>
                                <label style={styles.label}>Tipo</label>
                                <select
                                    style={styles.field}
                                    value={form.type}
                                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                                >
                                    <option value="income">Entrada</option>
                                    <option value="expense">Saída</option>
                                </select>
                            </div>

                            <div>
                                <label style={styles.label}>Valor (R$)</label>
                                <input
                                    style={styles.field}
                                    value={form.amount}
                                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                                    placeholder="0,00"
                                />
                                {errors.amount && <div style={{ color: '#e63946', fontSize: 12 }}>{errors.amount}</div>}
                            </div>

                            <div>
                                <label style={styles.label}>Data</label>
                                <input
                                    type="date"
                                    style={styles.field}
                                    value={form.date}
                                    max={new Date().toISOString().substring(0, 10)}
                                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                                />
                                {errors.date && <div style={{ color: '#e63946', fontSize: 12 }}>{errors.date}</div>}
                            </div>

                            <div>
                                <label style={styles.label}>Categoria (opcional)</label>
                                <input
                                    style={styles.field}
                                    value={form.category}
                                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                />
                            </div>

                            <div className="block" style={styles.block}>
                                <label style={styles.label}>Itens</label>
                                {errors.items && <div style={{ color: '#e63946', fontSize: 12, marginBottom: 6 }}>{errors.items}</div>}
                                {form.items.map((it, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                        <input
                                            placeholder="Descrição"
                                            style={{ ...styles.field, flex: 3 }}
                                            value={it.description}
                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qtd"
                                            style={{ ...styles.field, flex: 1 }}
                                            value={it.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                        />
                                        <input
                                            placeholder="Preço"
                                            style={{ ...styles.field, flex: 1 }}
                                            value={it.unit_price}
                                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                        />
                                        <button type="button" style={{ ...styles.smallBtn, ...styles.smallDanger }} onClick={() => removeItem(idx)}>X</button>
                                    </div>
                                ))}
                                <button type="button" style={{ ...styles.smallBtn, ...styles.smallNeutral }} onClick={addItem}>+ Item</button>
                            </div>

                            <div className="block" style={styles.block}>
                                <label style={styles.label}>Comprovantes (imagens/PDF)</label>
                                <input
                                    multiple
                                    type="file"
                                    onChange={(e) => setForm(f => ({ ...f, images: Array.from(e.target.files) }))}
                                />
                            </div>

                            <div style={styles.actionsRow}>
                                <button type="submit" style={styles.primaryBtn}>
                                    {form.id ? 'Salvar Alterações' : 'Cadastrar'}
                                </button>
                                {form.id && (
                                    <button type="button" style={styles.dangerBtn} onClick={() => handleDeleteTx(form)}>
                                        Excluir Transação
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de preview de anexos */}
            <FilePreviewModal
                open={viewer.open}
                files={viewer.files}
                index={viewer.index}
                onClose={closeViewer}
                onPrev={prevViewer}
                onNext={nextViewer}
            />
        </div>
    );
}
