import { useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorAlert, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useClientes, useDeleteCliente } from '@/hooks/useClientes'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Roles } from '@/lib/constants'
import { formatDireccion, nombreCompleto } from '@/lib/format'
import type { ClienteDTO } from '@/types'
import { ClienteForm } from './ClienteForm'

type Edicion = { modo: 'nuevo' } | { modo: 'editar'; cliente: ClienteDTO }

export function ClientesPage() {
  const { hasRole } = useAuth()
  // Despachante: solo lectura. Recepcionista: alta y edición. Gerente: además baja
  const puedeEditar = hasRole(Roles.Recepcionista, Roles.Gerente)
  const puedeEliminar = hasRole(Roles.Gerente)

  const [busqueda, setBusqueda] = useState('')
  const busquedaDebounced = useDebouncedValue(busqueda.trim())
  const clientes = useClientes(busquedaDebounced)

  const [edicion, setEdicion] = useState<Edicion | null>(null)
  const [aEliminar, setAEliminar] = useState<ClienteDTO | null>(null)
  const eliminar = useDeleteCliente()

  const columns: Column<ClienteDTO>[] = [
    {
      header: 'Cliente',
      cell: (c) => <span className="font-medium text-slate-900">{nombreCompleto(c.razonSocialNombre, c.apellido)}</span>,
    },
    { header: 'Documento', cell: (c) => `${c.tipoDocumento} ${c.numeroDocumento}`, className: 'whitespace-nowrap' },
    {
      header: 'Dirección',
      cell: (c) => (
        <>
          <p>{formatDireccion(c.calle, c.altura, c.pisoDepto)}</p>
          <p className="text-xs text-slate-500">
            {c.nombreLocalidad} ({c.codigoPostal}), {c.nombreProvincia}
          </p>
        </>
      ),
      hideOnMobile: true,
    },
    {
      header: 'Contacto',
      cell: (c) => (
        <>
          {c.telefono && <p>{c.telefono}</p>}
          {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
          {!c.telefono && !c.email && <span className="text-slate-400">—</span>}
        </>
      ),
      hideOnMobile: true,
    },
  ]

  if (puedeEditar) {
    columns.push({
      header: <span className="sr-only">Acciones</span>,
      className: 'text-right whitespace-nowrap',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEdicion({ modo: 'editar', cliente: c })}>
            Editar
          </Button>
          {puedeEliminar && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setAEliminar(c)}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    })
  }

  const cerrarEliminar = () => {
    setAEliminar(null)
    eliminar.reset()
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Remitentes y destinatarios registrados."
        actions={puedeEditar && <Button onClick={() => setEdicion({ modo: 'nuevo' })}>Nuevo cliente</Button>}
      />
      <Card>
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <Input
            type="search"
            placeholder="Buscar por nombre, razón social o documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar clientes"
            className="sm:max-w-md"
          />
        </div>
        <QueryState
          query={clientes}
          isEmpty={(data) => data.length === 0}
          empty={
            <EmptyState
              title={busquedaDebounced ? 'Sin resultados' : 'No hay clientes registrados'}
              description={busquedaDebounced ? `Ningún cliente coincide con “${busquedaDebounced}”.` : undefined}
            />
          }
        >
          {(data) => <Table columns={columns} rows={data} rowKey={(c) => c.idCliente} />}
        </QueryState>
      </Card>

      <Modal
        open={!!edicion}
        onClose={() => setEdicion(null)}
        title={edicion?.modo === 'editar' ? 'Editar cliente' : 'Nuevo cliente'}
        size="lg"
      >
        {edicion && (
          <ClienteForm
            cliente={edicion.modo === 'editar' ? edicion.cliente : undefined}
            onSaved={() => setEdicion(null)}
            onCancel={() => setEdicion(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar cliente"
        message={
          aEliminar && (
            <>
              ¿Eliminar a <strong>{nombreCompleto(aEliminar.razonSocialNombre, aEliminar.apellido)}</strong>? Los clientes con paquetes
              registrados no pueden eliminarse.
            </>
          )
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={eliminar.isPending}
        error={<ErrorAlert error={eliminar.error} />}
        onConfirm={() => aEliminar && eliminar.mutate(aEliminar.idCliente, { onSuccess: cerrarEliminar })}
        onClose={cerrarEliminar}
      />
    </>
  )
}
