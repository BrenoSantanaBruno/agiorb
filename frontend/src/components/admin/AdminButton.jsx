import React from 'react';

export default function AdminButton({ children, ...props }) {
    return (
        <button
            style={{
                background: '#7b2cbf',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
            }}
            {...props}
        >
            {children}
        </button>
    );
}
