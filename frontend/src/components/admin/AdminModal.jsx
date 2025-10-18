import React from 'react';

export default function AdminModal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div
                onClick={(e)=>e.stopPropagation()}
                style={{
                    background: '#2b2b2b',
                    padding: 24,
                    borderRadius: 12,
                    width: '95%',
                    maxWidth: 600,
                    color: '#eee',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: 22,
                        position: 'absolute',
                        top: 20,
                        right: 30,
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}
