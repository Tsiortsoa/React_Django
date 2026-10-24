import axios from 'axios'

export const cleToken = 'tokenAuth'
export const cleUtilisateur = 'utilisateurAuth'
export const cleMessageSession = 'messageSession'

const urlApi: string = import.meta.env.VITE_API_URL || '/api'

const instanceApi = axios.create({
  baseURL: urlApi,
})

instanceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(cleToken)
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

instanceApi.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur.response?.status === 401) {
      localStorage.removeItem(cleToken)
      localStorage.removeItem(cleUtilisateur)
      sessionStorage.setItem(cleMessageSession, 'Votre session a expiré. Veuillez vous reconnecter.')
      window.location.href = '/login'
    }
    return Promise.reject(erreur)
  },
)

export default instanceApi