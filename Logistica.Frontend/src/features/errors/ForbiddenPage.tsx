import { Link } from 'react-router'
import { Card, CardBody } from '@/components/ui/Card'

export function ForbiddenPage() {
  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <CardBody className="py-10">
        <p className="text-4xl font-bold text-slate-300">403</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Sin acceso</h1>
        <p className="mt-1 text-sm text-slate-500">Tu rol no tiene permisos para ver esta sección.</p>
        <Link to="/" className="mt-5 inline-block text-sm font-medium text-brand-600 hover:underline">
          Ir al inicio
        </Link>
      </CardBody>
    </Card>
  )
}
