import { useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useUsuarios } from '@/hooks/useUsuarios'
import type { UsuarioDTO } from '@/types'
import { CambiarPasswordForm, CrearUsuarioForm, EditarUsuarioForm } from './UsuarioForms'

type Accion = { tipo: 'crear' } | { tipo: 'editar'; usuario: UsuarioDTO } | { tipo: 'password'; usuario: UsuarioDTO }

const titulos = { crear: 'Nuevo usuario', editar: 'Editar usuario', password: 'Cambiar contraseña' }

export function UsuariosPage() {
  const { session } = useAuth()
  const usuarios = useUsuarios()
  const [accion, setAccion] = useState<Accion | null>(null)
  const cerrar = () => setAccion(null)

  const columns: Column<UsuarioDTO>[] = [
    {
      header: 'Usuario',
      cell: (u) => (
        <span className="inline-flex items-center gap-2 font-medium text-slate-900">
          {u.nombreUsuario}
          {u.idUsuario === session?.idUsuario && <Badge tone="blue">Vos</Badge>}
        </span>
      ),
    },
    { header: 'Rol', cell: (u) => u.nombreRol },
    { header: 'Estado', cell: (u) => (u.activo ? <Badge tone="green">Activo</Badge> : <Badge>Inactivo</Badge>) },
    {
      header: <span className="sr-only">Acciones</span>,
      className: 'text-right whitespace-nowrap',
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setAccion({ tipo: 'editar', usuario: u })}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAccion({ tipo: 'password', usuario: u })}>
            Contraseña
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Usuarios del sistema, roles y acceso."
        actions={<Button onClick={() => setAccion({ tipo: 'crear' })}>Nuevo usuario</Button>}
      />
      <Card>
        <QueryState query={usuarios} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No hay usuarios" />}>
          {(data) => <Table columns={columns} rows={data} rowKey={(u) => u.idUsuario} />}
        </QueryState>
      </Card>

      <Modal
        open={!!accion}
        onClose={cerrar}
        title={accion ? titulos[accion.tipo] : ''}
        description={accion && accion.tipo !== 'crear' ? accion.usuario.nombreUsuario : undefined}
      >
        {accion?.tipo === 'crear' && <CrearUsuarioForm onDone={cerrar} />}
        {accion?.tipo === 'editar' && (
          <EditarUsuarioForm usuario={accion.usuario} esUsuarioActual={accion.usuario.idUsuario === session?.idUsuario} onDone={cerrar} />
        )}
        {accion?.tipo === 'password' && <CambiarPasswordForm usuario={accion.usuario} onDone={cerrar} />}
      </Modal>
    </>
  )
}
