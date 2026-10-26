import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { EmptyState, ErrorAlert, QueryState } from '@/components/ui/States'
import { Table } from '@/components/ui/Table'
import { useCreateMarca, useCreateModelo, useMarcas, useModelos } from '@/hooks/useCatalogos'
import { applyApiFieldErrors, requiredId, requiredText } from '@/lib/forms'

export function CatalogosPage() {
  return (
    <>
      <PageHeader title="Catálogos" description="Marcas y modelos de vehículos." />
      <div className="grid gap-5 lg:grid-cols-2">
        <MarcasCard />
        <ModelosCard />
      </div>
    </>
  )
}

// MarcaCrearDTO
const marcaSchema = z.object({ nombreMarca: requiredText(50) })

function MarcasCard() {
  const marcas = useMarcas()
  const crear = useCreateMarca()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof marcaSchema>>({ resolver: zodResolver(marcaSchema), defaultValues: { nombreMarca: '' } })

  const onSubmit = handleSubmit((values) => {
    crear.mutate(values, {
      onSuccess: () => reset(),
      onError: (error) => applyApiFieldErrors(error, setError, ['nombreMarca']),
    })
  })

  return (
    <Card>
      <CardHeader title="Marcas" />
      <CardBody className="border-b border-slate-200">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Input placeholder="Nueva marca" aria-label="Nombre de la marca" maxLength={50} error={errors.nombreMarca?.message} containerClassName="flex-1" {...register('nombreMarca')} />
          <Button type="submit" loading={crear.isPending}>
            Agregar
          </Button>
        </form>
        <ErrorAlert error={crear.error} knownFields={['nombreMarca']} className="mt-3" />
      </CardBody>
      <QueryState query={marcas} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No hay marcas cargadas" />}>
        {(data) => (
          <Table
            columns={[{ header: 'Marca', cell: (m) => m.nombreMarca }]}
            rows={[...data].sort((a, b) => a.nombreMarca.localeCompare(b.nombreMarca))}
            rowKey={(m) => m.idMarca}
          />
        )}
      </QueryState>
    </Card>
  )
}

// ModeloCrearDTO
const modeloSchema = z.object({
  idMarca: requiredId('Seleccioná una marca'),
  nombreModelo: requiredText(50),
})

function ModelosCard() {
  const [filtroMarca, setFiltroMarca] = useState('')
  const marcas = useMarcas()
  const modelos = useModelos(Number(filtroMarca) || undefined)
  const crear = useCreateModelo()

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<z.input<typeof modeloSchema>, unknown, z.output<typeof modeloSchema>>({
    resolver: zodResolver(modeloSchema),
    defaultValues: { idMarca: '', nombreModelo: '' },
  })

  const onSubmit = handleSubmit((values) => {
    crear.mutate(values, {
      // Se conserva la marca para cargar varios modelos seguidos
      onSuccess: () => resetField('nombreModelo'),
      onError: (error) => applyApiFieldErrors(error, setError, ['idMarca', 'nombreModelo']),
    })
  })

  const opcionesMarca = marcas.data?.map((m) => (
    <option key={m.idMarca} value={m.idMarca}>
      {m.nombreMarca}
    </option>
  ))

  return (
    <Card>
      <CardHeader title="Modelos" />
      <CardBody className="border-b border-slate-200">
        <form onSubmit={onSubmit} noValidate className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-start">
          <Select aria-label="Marca del modelo" placeholder="Marca…" error={errors.idMarca?.message} {...register('idMarca')}>
            {opcionesMarca}
          </Select>
          <Input placeholder="Nuevo modelo" aria-label="Nombre del modelo" maxLength={50} error={errors.nombreModelo?.message} {...register('nombreModelo')} />
          <Button type="submit" loading={crear.isPending}>
            Agregar
          </Button>
        </form>
        <ErrorAlert error={crear.error} knownFields={['idMarca', 'nombreModelo']} className="mt-3" />
      </CardBody>
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <Select label="Filtrar por marca" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} placeholder="Todas" containerClassName="sm:max-w-xs">
          {opcionesMarca}
        </Select>
      </div>
      <QueryState query={modelos} isEmpty={(data) => data.length === 0} empty={<EmptyState title="No hay modelos para mostrar" />}>
        {(data) => (
          <Table
            columns={[
              { header: 'Marca', cell: (m) => m.nombreMarca },
              { header: 'Modelo', cell: (m) => <span className="font-medium text-slate-900">{m.nombreModelo}</span> },
            ]}
            rows={data}
            rowKey={(m) => m.idModelo}
          />
        )}
      </QueryState>
    </Card>
  )
}
