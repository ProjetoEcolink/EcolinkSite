import { createBrowserClient } from '@supabase/ssr'


export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Nivel = 'Bronze' | 'Prata' | 'Ouro'
export type TipoPerfil = 'Usuario' | 'Parceiro' | 'Moderador'
export type TipoPonto = 'Coleta' | 'Doacao' | 'Assistencia' | 'Compra'
export type StatusPonto = 'Ativo' | 'Inativo' | 'Pendente'
export type TipoTransacao = 'Descarte' | 'Resgate' | 'Bonus' | 'Penalidade'



export interface Profile {
  id: string
  nome: string
  email: string
  avatar_url?: string
  nivel: Nivel
  pontos: number
  tipo_perfil: TipoPerfil
  created_at: string
}
export interface Point {
  id: number
  nome: string
  tipo: TipoPonto
  endereco: string
  latitude: number
  longitude: number
  horario_inicio?: string
  horario_fim?: string
  contato?: string
  site?: string
  foto_url?: string
  status: StatusPonto
  usuario_cadastrou?: string
  created_at: string
  distancia?: number // retornado pela função get_points_nearby
}

export interface Material {
  id: number
  nome_material: string
}

export interface Review {
  id: number
  point_id: number
  user_id: string
  nota: number
  comentario?: string
  created_at: string
}

export interface Reward {
  id: number
  nome_recompensa: string
  descricao?: string
  custo_pontos: number
  parceiro: string
  validade?: string
  ativo: boolean
}

export interface PointTransaction {
  id: number
  user_id: string
  pontos: number
  tipo: TipoTransacao
  descricao?: string
  point_id?: number
  reward_id?: number
  foto_url?: string
  created_at: string
}

export interface RankingUser {
  id: string
  nome: string
  avatar_url?: string
  nivel: Nivel
  pontos: number
  posicao: number
}

export interface DashboardStats {
  pontos_ativos: number
  pontos_pendentes: number
  total_usuarios: number
  total_descartes: number
  pontos_distribuidos: number
}

// ============================================================
// MÓDULO: AUTENTICAÇÃO
// ============================================================
export const auth = {

  /** Cadastro com e-mail e senha */
  async signUp(nome: string, email: string, senha: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { full_name: nome } }
    })
    if (error) throw error
    return data
  },

  /** Login com e-mail e senha */
  async signIn(email: string, senha: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
    return data
  },

  /** Login com Google */
  async signInWithGoogle() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) throw error
    return data
  },

  /** Logout */
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /** Usuário logado atual */
  async getUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /** Recuperação de senha */
  async resetPassword(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
  },
}
export const profiles = {

  /** Buscar perfil pelo ID */
  async getById(userId: string): Promise<Profile> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  /** Atualizar perfil */
  async update(userId: string, updates: Partial<Pick<Profile, 'nome' | 'avatar_url'>>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Fazer upload de avatar */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('ecolink-public')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('ecolink-public').getPublicUrl(path)
    return data.publicUrl
  },
}
export const points = {

  /** Buscar pontos próximos a uma localização (raio em metros) */
  async getNearby(lat: number, lng: number, raio = 5000): Promise<Point[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_points_nearby', { lat, lng, raio })
    if (error) throw error
    return data
  },

  /** Listar todos os pontos ativos */
  async listAll(): Promise<Point[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('status', 'Ativo')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  /** Buscar ponto por ID com materiais e avaliações */
  async getById(id: number) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points')
      .select(`
        *,
        point_materials (
          materials ( id, nome_material )
        ),
        reviews ( id, nota, comentario, created_at, profiles ( nome, avatar_url ) )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  /** Filtrar pontos por tipo e/ou material */
  async filter(tipo?: TipoPonto, materialId?: number): Promise<Point[]> {
    const supabase = createClient()
    let query = supabase.from('points').select(`
      *,
      point_materials!inner ( material_id )
    `).eq('status', 'Ativo')

    if (tipo) query = query.eq('tipo', tipo)
    if (materialId) query = query.eq('point_materials.material_id', materialId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /** Cadastrar novo ponto (parceiro/moderador) */
  async create(point: Omit<Point, 'id' | 'created_at' | 'distancia'>, materialIds: number[]) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points')
      .insert(point)
      .select()
      .single()
    if (error) throw error

    // Vincular materiais
    if (materialIds.length > 0) {
      const relations = materialIds.map(mid => ({ point_id: data.id, material_id: mid }))
      const { error: matError } = await supabase.from('point_materials').insert(relations)
      if (matError) throw matError
    }
    return data
  },

  /** Atualizar status do ponto (moderadores) */
  async updateStatus(id: number, status: StatusPonto) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================================
// MÓDULO: AVALIAÇÕES
// ============================================================
export const reviews = {

  /** Listar avaliações de um ponto */
  async listByPoint(pointId: number): Promise<Review[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles ( nome, avatar_url )')
      .eq('point_id', pointId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  /** Criar ou atualizar avaliação */
  async upsert(pointId: number, userId: string, nota: number, comentario?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reviews')
      .upsert({ point_id: pointId, user_id: userId, nota, comentario })
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================================
// MÓDULO: GAMIFICAÇÃO
// ============================================================
export const gamification = {

  /** Registrar descarte com foto (ganha +50 pontos) */
  async registerDiscard(userId: string, pointId: number, fotoFile: File) {
    const supabase = createClient()

    // 1. Upload da foto de comprovação
    const path = `descartes/${userId}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('ecolink-public')
      .upload(path, fotoFile)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('ecolink-public').getPublicUrl(path)

    // 2. Registrar transação (+50 pontos)
    const { data, error } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        pontos: 50,
        tipo: 'Descarte',
        descricao: 'Descarte confirmado com foto',
        point_id: pointId,
        foto_url: urlData.publicUrl
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Resgatar recompensa */
  async redeemReward(userId: string, rewardId: number) {
    const supabase = createClient()

    // Buscar custo da recompensa
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('custo_pontos, nome_recompensa')
      .eq('id', rewardId)
      .single()
    if (rewardError) throw rewardError

    // Verificar saldo do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pontos')
      .eq('id', userId)
      .single()
    if (profileError) throw profileError

    if (profile.pontos < reward.custo_pontos) {
      throw new Error('Pontos insuficientes')
    }

    // Registrar transação negativa
    const { data, error } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        pontos: -reward.custo_pontos,
        tipo: 'Resgate',
        descricao: `Resgate: ${reward.nome_recompensa}`,
        reward_id: rewardId
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Buscar histórico de transações do usuário */
  async getTransactions(userId: string): Promise<PointTransaction[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  /** Ranking dos usuários */
  async getRanking(): Promise<RankingUser[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ranking_usuarios')
      .select('*')
    if (error) throw error
    return data
  },

  /** Listar recompensas disponíveis */
  async listRewards(): Promise<Reward[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('ativo', true)
      .order('custo_pontos', { ascending: true })
    if (error) throw error
    return data
  },
}

// ============================================================
// MÓDULO: SUGESTÕES DE PONTOS
// ============================================================
export const suggestions = {

  /** Usuário sugere novo ponto */
  async create(suggestion: {
    user_id: string
    nome: string
    tipo: TipoPonto
    endereco: string
    latitude?: number
    longitude?: number
    contato?: string
    materiais?: string[]
  }) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Moderador lista sugestões pendentes */
  async listPending() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suggestions')
      .select('*, profiles ( nome, email )')
      .eq('status', 'Pendente')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  /** Moderador aprova ou rejeita sugestão */
  async review(id: number, status: 'Aprovado' | 'Rejeitado', moderadorId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('suggestions')
      .update({ status, moderador_id: moderadorId })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============================================================
// MÓDULO: DASHBOARD (parceiros e moderadores)
// ============================================================
export const dashboard = {

  /** Estatísticas gerais */
  async getStats(): Promise<DashboardStats> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  /** Pontos cadastrados com filtro de status */
  async getPoints(status?: StatusPonto) {
    const supabase = createClient()
    let query = supabase
      .from('points')
      .select('*, point_materials ( materials ( nome_material ) )')
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return data
  },

  /** Distribuição de pontos por tipo (para gráfico de barras) */
  async getPointsByType() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('points')
      .select('tipo')
      .eq('status', 'Ativo')
    if (error) throw error

    const counts: Record<string, number> = {}
    data.forEach(({ tipo }) => { counts[tipo] = (counts[tipo] || 0) + 1 })
    return Object.entries(counts).map(([tipo, quantidade]) => ({ tipo, quantidade }))
  },

  /** Descartes por mês (últimos 6 meses) */
  async getDiscardsByMonth() {
    const supabase = createClient()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data, error } = await supabase
      .from('point_transactions')
      .select('created_at')
      .eq('tipo', 'Descarte')
      .gte('created_at', sixMonthsAgo.toISOString())
    if (error) throw error

    const counts: Record<string, number> = {}
    data.forEach(({ created_at }) => {
      const mes = new Date(created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      counts[mes] = (counts[mes] || 0) + 1
    })
    return Object.entries(counts).map(([mes, total]) => ({ mes, total }))
  },
}

// ============================================================
// MÓDULO: IA (histórico de classificações)
// ============================================================
export const aiService = {

  /** Salvar resultado da classificação por IA */
  async saveResult(
    userId: string,
    tipoDispositivo: string,
    imagemUrl: string,
    precisao: number,
    materialSugerido: string
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ia_history')
      .insert({
        user_id: userId,
        tipo_dispositivo_identificado: tipoDispositivo,
        imagem_url: imagemUrl,
        precisao,
        material_sugerido: materialSugerido
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Histórico do usuário */
  async getHistory(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ia_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}

// ============================================================
// MÓDULO: MATERIAIS
// ============================================================
export const materials = {

  /** Listar todos os materiais */
  async listAll(): Promise<Material[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('nome_material', { ascending: true })
    if (error) throw error
    return data
  },
}


