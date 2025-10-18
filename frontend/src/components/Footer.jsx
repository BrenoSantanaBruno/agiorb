import React from 'react';

export default function Footer() {
    return (
        <footer style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '.8rem',
            color: '#999'
        }}>
            <div>Devstorm © Todos os direitos reservados</div>
            <div>Whatsapp: +55 21 97532-7553</div>
            <div>
                <a href="https://devstorm.io" target="_blank" rel="noreferrer" style={{color:'#999'}}>
                    https://devstorm.io
                </a>
            </div>
        </footer>
    );
}
