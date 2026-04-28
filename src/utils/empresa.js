import { supabase } from '../supabaseClient';

export async function getOrCreateEmpresaForUser(usuarioData) {
    const email = String(usuarioData?.email || '').trim().toLowerCase();
    if (!email) {
        throw new Error('Usuario sem e-mail para vincular empresa.');
    }

    const { data: empresaExistente, error: erroBusca } = await supabase
        .from('empresas')
        .select('id')
        .eq('email', email)
        .limit(1);

    if (erroBusca) {
        throw new Error(`Erro ao buscar empresa: ${erroBusca.message}`);
    }

    if (empresaExistente?.length) {
        return empresaExistente[0].id;
    }

    const { data: novaEmpresa, error: erroCriacao } = await supabase
        .from('empresas')
        .insert([
            {
                nome: usuarioData.nome || 'Sem Nome',
                email,
                telefone: usuarioData.telefone || '',
            },
        ])
        .select('id')
        .limit(1);

    if (erroCriacao) {
        throw new Error(`Erro ao criar empresa: ${erroCriacao.message}`);
    }

    if (!novaEmpresa?.length) {
        throw new Error('Nao foi possivel criar a empresa deste usuario.');
    }

    return novaEmpresa[0].id;
}
