import { useState } from 'react';
import Button from '../../components/Button';

export default function ChurchForm({ onCreate }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        description: '',
        denomination: '',
        pastor_name: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function handleChange(e) {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onCreate(formData);
            setFormData({
                name: '',
                address: '',
                contact_phone: '',
                contact_email: '',
                website: '',
                description: '',
                denomination: '',
                pastor_name: '',
            });
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} style={{marginTop: 20}}>
            <input
                name="name"
                placeholder="Nome"
                value={formData.name}
                onChange={handleChange}
                required
            /><br />

            <input
                name="address"
                placeholder="Endereço"
                value={formData.address}
                onChange={handleChange}
            /><br />

            <input
                name="contact_phone"
                placeholder="Telefone"
                value={formData.contact_phone}
                onChange={handleChange}
            /><br />

            <input
                name="contact_email"
                type="email"
                placeholder="Email"
                value={formData.contact_email}
                onChange={handleChange}
            /><br />

            <input
                name="website"
                placeholder="Website"
                value={formData.website}
                onChange={handleChange}
            /><br />

            <textarea
                name="description"
                placeholder="Descrição"
                value={formData.description}
                onChange={handleChange}
            /><br />

            <input
                name="denomination"
                placeholder="Denominação"
                value={formData.denomination}
                onChange={handleChange}
            /><br />

            <input
                name="pastor_name"
                placeholder="Nome do Pastor"
                value={formData.pastor_name}
                onChange={handleChange}
            /><br />

            {error && <p style={{color:'red'}}>{error}</p>}

            <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
            </Button>
        </form>
    );
}