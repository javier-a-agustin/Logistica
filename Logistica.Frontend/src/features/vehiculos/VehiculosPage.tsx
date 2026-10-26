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
import { useDeleteVehiculo, useVehiculos } from '@/hooks/useVehiculos'
import { Roles } from '@/lib/constants'
import { formatKg } from '@/lib/format'
import type { VehiculoDTO } from '@/types'
import { VehiculoForm } from './VehiculoForm'

type Edicion = { vehiculo?: VehiculoDTO }

export function VehiculosPage() {
  const { hasRole } = useAuth()
  // Despachante: solo lectura
  const esGerente = hasRole(Roles.Gerente)

  const [soloActivos, setSoloActivos] = useState(false)
  const vehiculos = useVehiculos(soloActivos)
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  const [aDarDeBaja, setADarDeBaja] = useState<VehiculoDTO | null>(null)
  const baja = useDeleteVehiculo()

  const columns: Column<VehiculoDTO>[] = [
    { header: 'Patente', cell: (v) => <span className="font-mono font-medium text-slate-900">{v.patente}</span> },
    { header: 'Marca / modelo', cell: (v) => `${v.nombreMarca} ${v.nombreModelo}` },
    { header: 'Capacidad', cell: (v) => formatKg(v.capacidadKg), className: 'text-right whitespace-nowrap' },
    { header: 'Estado', cell: (v) => (v.activo ? <Badge tone="green">Activo</Badge> : <Badge>De baja</Badge>) },
  ]
  if (esGerente) {
    columns.push({
      header: <span className="sr-only">Acciones</span>,
      className: 'text-right whitespace-nowrap',
      cell: (v) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEdicion({ vehiculo: v })}>
            Editar
          </Button>
          {v.activo && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setADarDeBaja(v)}>
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
        title="Vehículos"
        description={esGerente ? 'Flota de la empresa.' : 'Flota de la empresa (solo lectura).'}
        actions={esGerente && <Button onClick={() => setEdicion({})}>Nuevo vehículo</Button>}
      />
      <Card>
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <Checkbox label="Mostrar solo activos" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
        </div>
        <QueryState query={vehiculos} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No hay vehículos" />}>
          {(data) => <Table columns={columns} rows={data} rowKey={(v) => v.idVehiculo} />}
        </QueryState>
      </Card>

      <Modal open={!!edicion} onClose={() => setEdicion(null)} title={edicion?.vehiculo ? 'Editar vehículo' : 'Nuevo vehículo'}>
        {edicion && <VehiculoForm vehiculo={edicion.vehiculo} onDone={() => setEdicion(null)} />}
      </Modal>

      <ConfirmDialog
        open={!!aDarDeBaja}
        title="Dar de baja vehículo"
        message={
          <>
            ¿Dar de baja el vehículo <strong className="font-mono">{aDarDeBaja?.patente}</strong>? No podrá asignarse a nuevos viajes.
          </>
        }
        confirmLabel="Dar de baja"
        variant="danger"
        loading={baja.isPending}
        error={<ErrorAlert error={baja.error} />}
        onConfirm={() => aDarDeBaja && baja.mutate(aDarDeBaja.idVehiculo, { onSuccess: cerrarBaja })}
        onClose={cerrarBaja}
      />
    </>
  )
}
