export default function Button({ children, ...props }) {
    return (
        <button
            style={{
                padding: '8px 16px',
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: 4,
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
            }}
            {...props}
        >
            {children}
        </button>
    );
}
