export const VALIDATION_PATTERNS = {
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#.,])[A-Za-z\d@$!%*?&#.,]{8,}$/,

  BRAZILIAN_PHONE: /^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}-[0-9]{4}$/,

  CPF_DIGITS: /^[0-9]{11}$/,

  NAME: /^[a-zA-ZÀ-ÿ\s-]+$/,
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL: {
    INVALID_FORMAT: 'Email deve ter um formato válido',
    REQUIRED: 'Email é obrigatório',
    ALREADY_EXISTS: 'Este email já está cadastrado',
  },

  PASSWORD: {
    MIN_LENGTH: 'Senha deve ter pelo menos 8 caracteres',
    PATTERN:
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
    REQUIRED: 'Senha é obrigatória',
  },

  GENERAL: {
    REQUIRED: 'Este campo é obrigatório',
    INVALID_STRING: 'Este campo deve ser uma string',
    INTERNAL_ERROR: 'Erro interno do servidor',
  },

  USER: {
    ID_OR_EMAIL: {
      REQUIRED: 'ID ou email do usuário é obrigatório',
      NOT_FOUND: 'Usuário não encontrado',
    },

    USERNAME: {
      REQUIRED: 'Nome de usuário é obrigatório',
      NOT_FOUND: 'Usuário não encontrado',
      MAX_LENGTH: 'Nome de usuário não pode ultrapassar 100 caracteres',
      MIN_LENGTH: 'Nome de usuário deve ter no mínimo 2 caracteres',
    },
  },
} as const;

export const FIELD_LIMITS = {
  EMAIL: {
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
} as const;

export const SWAGGER_EXAMPLES = {
  USER: {
    ID: '550e8400-e29b-41d4-a716-446655440000',
    EMAIL: 'fulano@email.com',
    PASSWORD: 'MinhaSenh@123',
    USERNAME: 'Fulano de Tal',
  },
  DATES: {
    CREATED_AT: '2023-01-01T00:00:00Z',
    UPDATED_AT: '2023-01-02T00:00:00Z',
  },
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
} as const;
