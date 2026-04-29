export const MAX_FOTOS_LOTE = 5;

export const TIPOS_MATERIAIS_PADRAO = [
  'Baterias',
  'Celulares',
  'Computadores',
  'Monitores',
  'Placas de Circuito',
  'Impressoras',
  'Cabos e Fios',
  'Pilhas',
  'Televisores',
  'Tablets',
];

export function sanitizePesoInput(value) {
    const normalized = String(value || '').replace(',', '.').replace(/[^\d.]/g, '');
    const parts = normalized.split('.');
    if (parts.length <= 1) return normalized;
    return `${parts[0]}.${parts.slice(1).join('')}`;
}

export function normalizeMateriaisLote(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(/\n|,|;/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

export function normalizeFotoUrls(lote) {
    if (!lote) return [];

    const fromArray = lote.fotos_urls;
    if (Array.isArray(fromArray)) {
        return fromArray.filter(Boolean);
    }

    if (typeof fromArray === 'string') {
        try {
            const parsed = JSON.parse(fromArray);
            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }
        } catch {
            // Intencional: fallback para foto_url
        }
    }

    return lote.foto_url ? [lote.foto_url] : [];
}

export function buildLotePayload(lote, empresaId, fotoUrls) {
    const categoria = lote.tipo_material || lote.categoria || '';
    const descricaoCompleta = lote.descricao_completa || lote.descricao || '';
    const peso = lote.peso_kg === '' || lote.peso_kg == null ? null : Number(lote.peso_kg);
    const numeroItens = lote.numero_itens === '' || lote.numero_itens == null ? null : Number(lote.numero_itens);
    const materiais = normalizeMateriaisLote(lote.materiais_lote);

    return {
        empresa_id: empresaId,
        titulo: lote.titulo,
        categoria,
        tipo_material: categoria,
        peso_kg: Number.isFinite(peso) ? peso : null,
        numero_itens: Number.isFinite(numeroItens) ? Math.trunc(numeroItens) : null,
        materiais_lote: materiais,
        cidade: lote.cidade || null,
        estado: lote.estado || null,
        local_lote: lote.local_lote || null,
        descricao_resumida: lote.descricao_resumida || null,
        descricao_completa: descricaoCompleta || null,
        descricao: descricaoCompleta || null,
        fotos_urls: fotoUrls,
        foto_url: fotoUrls[0] || null,
        status: lote.status || 'disponivel',
        created_at: new Date().toISOString(),
    };
}

export function buildLegacyLotePayload(lote, empresaId, fotoUrls) {
    const categoria = lote.tipo_material || lote.categoria || 'Misto';
    const descricaoCompleta = lote.descricao_completa || lote.descricao || '';
    const peso = lote.peso_kg === '' || lote.peso_kg == null ? null : Number(lote.peso_kg);

    return {
        empresa_id: empresaId,
        titulo: lote.titulo,
        categoria,
        peso_kg: Number.isFinite(peso) ? peso : null,
        cidade: lote.cidade || null,
        estado: lote.estado || null,
        descricao: descricaoCompleta,
        foto_url: fotoUrls[0] || null,
        status: lote.status || 'disponivel',
        created_at: new Date().toISOString(),
    };
}
