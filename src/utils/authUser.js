export function buildLocalUserFromSupabase(authUser, fallback = {}) {
    const meta = authUser?.user_metadata || {};

    return {
        id: authUser?.id || fallback.id || null,
        email: authUser?.email || fallback.email || '',
        nome: meta.nome || meta.name || fallback.nome || 'Usuario',
        perfil: meta.perfil || fallback.perfil || 'Usuario',
        documento: meta.documento || fallback.documento || '',
        telefone: meta.telefone || fallback.telefone || '',
        authProvider: 'supabase',
    };
}

export function persistAuthenticatedUser(userData) {
    const userWithoutPassword = { ...userData };
    delete userWithoutPassword.senha;

    localStorage.setItem('usuario', JSON.stringify(userWithoutPassword));

    if (userWithoutPassword.email) {
        const emailKey = userWithoutPassword.email.trim().toLowerCase();
        localStorage.setItem('pendingAuthEmail', userWithoutPassword.email);
        clearLegacyPasswordForEmail(emailKey);
        localStorage.setItem(`ecolink-user-${emailKey}`, JSON.stringify(userWithoutPassword));
    }

    return userWithoutPassword;
}

export function clearAuthenticatedUser() {
    localStorage.removeItem('usuario');
}

export function clearLegacyPasswordForEmail(email) {
    const emailKey = String(email || '').trim().toLowerCase();
    if (!emailKey) return;

    localStorage.removeItem(`ecolink-password-${emailKey}`);

    const legacyUserRaw = localStorage.getItem(`ecolink-user-${emailKey}`);
    if (!legacyUserRaw) return;

    try {
        const legacyUser = JSON.parse(legacyUserRaw);
        delete legacyUser.senha;
        localStorage.setItem(`ecolink-user-${emailKey}`, JSON.stringify(legacyUser));
    } catch {
        localStorage.removeItem(`ecolink-user-${emailKey}`);
    }
}
