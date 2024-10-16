type Levels = 'Administrador' | 'Usuário'

declare module '#auth-utils' {
  interface User{
    email: string,
    level: Levels,
    nome: string,
  }
}

export { Levels }
