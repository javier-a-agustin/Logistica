import { useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog, Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorAlert, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useChoferes, useDeleteChofer } from '@/hooks/useChoferes'
import { Roles } from '@/lib/constants'
import { formatDate, todayIsoDate } from '@/lib/format'
import type { ChoferDTO } from '@/types'
import { ChoferForm } from './ChoferForm'

function Licencia({ chofer }: { chofer: ChoferDTO }) {
  if (!chofer.licenciaConducir) return <Badge tone="red">Sin licencia</Badge>
  // Fechas "yyyy-MM-dd": se pueden comparar como texto
  const vencida = !!chofer.fechaVencimientoLicencia && chofer.fechaVencimientoLicencia < todayIsoDate()
  return (
    <span className="inline-flex flex-wrap items-center gap-2 whitespace-nowrap">
      Vence {formatDate(chofer.fechaVencimientoLicencia)}
      {vencida && <Badge tone="red">Vencida</Badge>}
    </span>
  )
}

export function ChoferesPage() {
  const { hasRole } = useAuth()
  // Despachante: solo lectura
  const esGerente = hasRole(Roles.Gerente)

  const [soloActivos, setSoloActivos] = useState(false)
  const choferes = useChoferes(soloActivos)
  const [edicion, setEdicion] = useState<{ chofer?: ChoferDTO } | null>(null)
  const [aDarDeBaja, setADarDeBaja] = useState<ChoferDTO | null>(null)
  const baja = useDeleteChofer()

  const columns: Column<ChoferDTO>[] = [
    {
      header: 'Chofer',
      cell: (c) => (
        <span className="font-medium text-slate-900">
          {c.apellido}, {c.nombre}
        </span>
      ),
    },
    { header: 'DNI', cell: (c) => c.dni },
    {
      header: 'Usuario',
      cell: (c) => (
        <span className="inline-flex items-center gap-2">
          {c.nombreUsuario}
          {!c.usuarioActivo && <Badge>Usuario inactivo</Badge>}
        </span>
      ),
      hideOnMobile: true,
    },
    { header: 'Licencia', cell: (c) => <Licencia chofer={c} /> },
    { header: 'Teléfono', cell: (c) => c.telefono ?? '—', hideOnMobile: true },
    { header: 'Estado', cell: (c) => (c.activo ? <Badge tone="green">Activo</Badge> : <Badge>De baja</Badge>) },
  ]
  if (esGerente) {
    columns.push({
      header: <span className="sr-only">Acciones</span>,
      className: 'text-right whitespace-nowrap',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEdicion({ chofer: c })}>
            Editar
          </Button>
          {c.activo && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setADarDeBaja(c)}>
              Dar de baja
            </Button>
          )}
        </div>
      ),
    })
  }

  const cerrarBaja = () => {
    setADarDeBaja(null)
    baja.reset()
  }

  return (
    <>
      <PageHeader
        title="Choferes"
        description={esGerente ? 'Choferes y sus licencias.' : 'Choferes y sus licencias (solo lectura).'}
        actions={esGerente && <Button onClick={() => setEdicion({})}>Nuevo chofer</Button>}
      />
      <Card>
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <Checkbox label="Mostrar solo activos" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
        </div>
        <QueryState query={choferes} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No hay choferes" />}>
          {(data) => <Table columns={columns} rows={data} rowKey={(c) => c.idChofer} />}
        </QueryState>
      </Card>

      <Modal open={!!edicion} onClose={() => setEdicion(null)} title={edicion?.chofer ? 'Editar chofer' : 'Nuevo chofer'}>
        {edicion && <ChoferForm chofer={edicion.chofer} onDone={() => setEdicion(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!aDarDeBaja}
        title="Dar de baja chofer"
        message={
          <>
            ¿Dar de baja a{' '}
            <strong>
              {aDarDeBaja?.nombre} {aDarDeBaja?.apellido}
            </strong>
            ? No podrá asignarse a nuevos viajes.
          </>
        }
        confirmLabel="Dar de baja"
        variant="danger"
        loading={baja.isPending}
        error={<ErrorAlert error={baja.error} />}
        onConfirm={() => aDarDeBaja && baja.mutate(aDarDeBaja.idChofer, { onSuccess: cerrarBaja })}
        onClose={cerrarBaja}
      />
    </>
  )
}
