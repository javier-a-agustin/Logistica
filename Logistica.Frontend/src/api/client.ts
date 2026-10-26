const API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

// Error tipado de la API. fieldErrors usa los nombres de propiedad en camelCase (ej: "pesoKg")
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions {
  query?: Record<string, QueryValue>
  body?: unknown
  signal?: AbortSignal
}

// La sesión vive en auth/, acá solo se inyecta como dependencia para no generar ciclos
let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function configureApiClient(options: { getToken: () => string | null; onUnauthorized: () => void }) {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
}

const defaultMessages: Record<number, string> = {
  0: 'No se pudo conectar con el servidor',
  400: 'La solicitud no es válida',
  401: 'La sesión expiró. Volvé a iniciar sesión',
  403: 'No tenés permisos para realizar esta acción',
  404: 'No se encontró el recurso solicitado',
  409: 'La operación entra en conflicto con datos existentes',
  500: 'Error interno del servidor',
  502: 'El servidor no está disponible',
  503: 'El servidor no está disponible',
  504: 'El servidor no respondió a tiempo',
}

function defaultMessage(status: number): string {
  return defaultMessages[status] ?? `Error inesperado (${status})`
}

// "PesoKg" -> "pesoKg", "$.pesoKg" -> "pesoKg", "Paquetes[0].IdPaquete" -> "paquetes.0.idPaquete"
function normalizeFieldName(key: string): string {
  return key
    .replace(/^\$\.?/, '')
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
    .join('.')
}

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && ('title' in value || 'errors' in value)
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
  return text
}

// Errores de negocio: string plano. Validación de modelo: ValidationProblemDetails
function toApiError(status: number, body: unknown): ApiError {
  if (typeof body === 'string' && body.trim() && !body.trimStart().startsWith('<')) {
    return new ApiError(status, body.trim())
  }

  if (isProblemDetails(body)) {
    if (body.errors && Object.keys(body.errors).length > 0) {
      const fieldErrors: Record<string, string[]> = {}
      for (const [key, messages] of Object.entries(body.errors)) {
        const field = normalizeFieldName(key) || '_'
        fieldErrors[field] = [...(fieldErrors[field] ?? []), ...messages]
      }
      return new ApiError(status, 'Revisá los datos ingresados', fieldErrors)
    }
    if (body.detail) return new ApiError(status, body.detail)
  }

  return new ApiError(status, defaultMessage(status))
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, defaultMessage(0))
  }

  const body = await parseBody(response)

  if (!response.ok) {
    // Un 401 con token enviado significa sesión vencida o inválida. En el login es "credenciales incorrectas"
    if (response.status === 401 && token) onUnauthorized()
    throw toApiError(response.status, body)
  }

  return body as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}

// Para segmentos de ruta con datos del usuario (ej: número de documento)
export const seg = (value: string | number) => encodeURIComponent(String(value))
