export default function ChurchesList({ churches }) {
    if (churches.length === 0) return <p>Nenhuma igreja cadastrada.</p>;

    return (
        <ul>
            {churches.map(church => (
                <li key={church.id}>
                    <strong>{church.name}</strong> — {church.address || 'Sem endereço'}
                </li>
            ))}
        </ul>
    );
}