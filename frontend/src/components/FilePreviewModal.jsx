import React from 'react';
import { assetUrl, isImage, isPdf } from '../utils/files';

const styles = {
    overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999},
    modal:{background:'#fff',borderRadius:12,maxWidth:'90vw',width:'90vw',maxHeight:'90vh',overflow:'hidden',position:'relative',boxShadow:'0 10px 30px rgba(0,0,0,.2)'},
    header:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderBottom:'1px solid #eee'},
    title:{fontWeight:700,color:'#264653'},
    body:{padding:12,display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa'},
    btn:{border:'none',background:'#264653',color:'#fff',borderRadius:6,padding:'6px 10px',cursor:'pointer',marginRight:8},
    iconBtn:{border:'none',background:'transparent',fontSize:'22px',cursor:'pointer',color:'#333'},
    pager:{display:'flex',alignItems:'center',gap:8},
};

export default function FilePreviewModal({ open, files, index, onClose, onPrev, onNext }) {
    if (!open || !files?.length) return null;
    const file = files[index];
    const url  = assetUrl(file.path || file.url || '');

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e)=>e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={styles.title}>Anexo {index+1} de {files.length}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={styles.pager}>
                            <button style={styles.btn} onClick={onPrev} disabled={index===0}>‹</button>
                            <button style={styles.btn} onClick={onNext} disabled={index===files.length-1}>›</button>
                        </div>
                        <a style={styles.btn} href={url} target="_blank" rel="noreferrer">Abrir em nova aba</a>
                        <button style={styles.iconBtn} onClick={onClose}>×</button>
                    </div>
                </div>
                <div style={styles.body}>
                    {isImage(url) && <img src={url} alt="" style={{maxWidth:'100%',maxHeight:'78vh',borderRadius:8}}/>}
                    {isPdf(url)    && <iframe title="PDF" src={url} style={{width:'100%',height:'78vh',border:'none'}}/>}
                    {!isImage(url) && !isPdf(url) && (
                        <div style={{padding:20,textAlign:'center'}}>
                            <p>Pré-visualização não suportada.</p>
                            <a className="btn" href={url} target="_blank" rel="noreferrer">Baixar/Abrir</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
