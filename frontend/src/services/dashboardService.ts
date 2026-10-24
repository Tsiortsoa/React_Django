import type { DonneesDashboard } from '../types'
import instanceApi from './api'

export async function chargerDashboard(): Promise<DonneesDashboard> {
  const reponse = await instanceApi.get<DonneesDashboard>('/dashboard/')
  return reponse.data
}