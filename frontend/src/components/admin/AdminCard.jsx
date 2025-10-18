import React from 'react';

export default function AdminCard({ children, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: '#373737',
                padding: '1rem',
                borderRadius: 10,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,.4)',
                color: '#f0f0f0',
                transition: 'transform .15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {children}
        </div>
    );
}
