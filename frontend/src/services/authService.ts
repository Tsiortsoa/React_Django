import instanceApi from './api'

export interface ReponseSession {
  username: string
  is_admin: boolean
}

export interface ReponseLogin extends ReponseSession {
  token: string
}

// Envoie les identifiants au backend et renvoie le token + le rôle
export async function appelerLogin(username: string, password: string): Promise<ReponseLogin> {
  const reponse = await instanceApi.post<ReponseLogin>('/auth/login/', { username, password })
  return reponse.data
}

// Demande au backend de supprimer le token de l'utilisateur connecté
export async function appelerLogout(): Promise<void> {
  await instanceApi.post('/auth/logout/')
}

export async function appelerWhoami(): Promise<ReponseSession> {
  const reponse = await instanceApi.get<ReponseSession>('/auth/whoami/')
  return reponse.data
}