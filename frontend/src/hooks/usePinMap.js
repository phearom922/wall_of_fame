import { useEffect, useState } from 'react';
import api from '../api/client';

export default function usePinMap() {
    const [map, setMap] = useState({}); // { [pinName]: { logoUrl, color, rank } }

    useEffect(() => {
        const load = async () => {
            const res = await api.get('/api/pins');
            const pins = res.data || [];
            const m = {};
            pins.forEach(p => { m[p.name] = { logoUrl: p.logoUrl, color: p.color, rank: p.rank }; });
            setMap(m);
        };
        load();
    }, []);

    return map;
}
