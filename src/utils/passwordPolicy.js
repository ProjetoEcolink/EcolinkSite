export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 24;

export function validatePasswordStrength(password) {
    const value = String(password || '');

    if (value.length < PASSWORD_MIN_LENGTH) {
        return `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    if (value.length > PASSWORD_MAX_LENGTH) {
        return `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
    }

    if (!/[A-Z]/.test(value)) {
        return 'A senha deve conter ao menos 1 letra maiúscula.';
    }

    if (!/[a-z]/.test(value)) {
        return 'A senha deve conter ao menos 1 letra minúscula.';
    }

    if (!/[0-9]/.test(value)) {
        return 'A senha deve conter ao menos 1 número.';
    }

    return '';
}
