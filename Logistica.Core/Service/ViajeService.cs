using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class ViajeService(
        IViajeRepository _viajeRepository,
        IPaqueteRepository _paqueteRepository,
        IVehiculoService _vehiculoService,
        IChoferService _choferService) : IViajeService
    {
        // Fase 2 del diagrama de secuencia: listados para armar el viaje
        public async Task<DisponiblesDespachoDTO> GetDisponiblesAsync()
        {
            return new DisponiblesDespachoDTO
            {
                Paquetes = await _paqueteRepository.GetAllAsync(EstadosPaquete.EnDeposito),
                Vehiculos = await _vehiculoService.GetDisponiblesAsync(),
                Choferes = await _choferService.GetHabilitadosAsync()
            };
        }

        public async Task<List<ViajeDTO>> GetAllAsync(int? idEstado)
        {
            return await _viajeRepository.GetAllAsync(idEstado);
        }

        public async Task<Resultado<HojaRutaDTO>> GetHojaRutaAsync(int id, int idUsuario, bool esChofer)
        {
            var hojaRuta = await _viajeRepository.GetHojaRutaAsync(id);
            if (hojaRuta == null)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.NoEncontrado, "El viaje no existe");

            // Un chofer solo puede ver y operar sus propias hojas de ruta
            if (esChofer && hojaRuta.IdUsuarioChofer != idUsuario)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Prohibido, "La hoja de ruta pertenece a otro chofer");

            return Resultado<HojaRutaDTO>.Ok(hojaRuta);
        }

        // Fase 3 del diagrama de secuencia: el chofer consulta su viaje asignado
        public async Task<List<HojaRutaDTO>> GetMisViajesAsync(int idUsuarioChofer)
        {
            var idsViaje = await _viajeRepository.GetIdsByUsuarioChoferAsync(idUsuarioChofer, EstadosViaje.EnCurso);

            var hojasRuta = new List<HojaRutaDTO>();
            foreach (var idViaje in idsViaje)
                hojasRuta.Add((await _viajeRepository.GetHojaRutaAsync(idViaje))!);

            return hojasRuta;
        }

        // Fase 2 del diagrama de secuencia: armado del viaje con validacion de capacidad
        public async Task<Resultado<HojaRutaDTO>> CreateAsync(ViajeCrearDTO viaje, int idUsuarioDespachante)
        {
            var fechaSalida = viaje.FechaSalida ?? DateTime.Now;
            var idsPaquete = viaje.Paquetes.Select(p => p.IdPaquete).ToList();

            if (idsPaquete.Count == 0)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, "El viaje debe incluir al menos un paquete");

            if (idsPaquete.Distinct().Count() != idsPaquete.Count)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, "Hay paquetes repetidos en el viaje");

            if (viaje.Paquetes.Select(p => p.OrdenEntrega).Distinct().Count() != idsPaquete.Count)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, "El orden de entrega no puede repetirse");

            if (viaje.FechaLlegadaEstimada < fechaSalida)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, "La fecha de llegada estimada no puede ser anterior a la fecha de salida");

            // Vehiculo
            var vehiculo = await _vehiculoService.GetByIdAsync(viaje.IdVehiculo);
            if (vehiculo == null)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.NoEncontrado, "El vehículo no existe");

            if (!vehiculo.Activo)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, $"El vehículo {vehiculo.Patente} está dado de baja");

            if (!(await _vehiculoService.GetDisponiblesAsync()).Any(v => v.IdVehiculo == vehiculo.IdVehiculo))
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Conflicto, $"El vehículo {vehiculo.Patente} ya tiene un viaje en curso");

            // Chofer: la licencia tiene que estar vigente hoy y el dia de salida
            var chofer = await _choferService.GetByIdAsync(viaje.IdChofer);
            if (chofer == null)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.NoEncontrado, "El chofer no existe");

            var fechaControlLicencia = DateOnly.FromDateTime(fechaSalida > DateTime.Today ? fechaSalida : DateTime.Today);
            if (!ChoferService.IsHabilitado(chofer, fechaControlLicencia))
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, $"El chofer {chofer.Nombre} {chofer.Apellido} no está habilitado (inactivo o sin licencia de conducir vigente)");

            if (!(await _choferService.GetHabilitadosAsync()).Any(c => c.IdChofer == chofer.IdChofer))
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Conflicto, $"El chofer {chofer.Nombre} {chofer.Apellido} ya tiene un viaje en curso");

            // Paquetes: deben existir y estar "En depósito"
            var paquetes = await _paqueteRepository.GetByIdsAsync(idsPaquete);

            var inexistentes = idsPaquete.Except(paquetes.Select(p => p.IdPaquete)).ToList();
            if (inexistentes.Count > 0)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.NoEncontrado, $"No existen los paquetes con Id: {string.Join(", ", inexistentes)}");

            var noDisponibles = paquetes.Where(p => p.IdEstadoActual != EstadosPaquete.EnDeposito).ToList();
            if (noDisponibles.Count > 0)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, $"Los siguientes paquetes no están 'En depósito': {string.Join(", ", noDisponibles.Select(p => p.CodigoSeguimiento))}");

            // Regla de negocio: SUM(Paquete.PesoKg) <= Vehiculo.CapacidadKg
            var pesoTotalKg = paquetes.Sum(p => p.PesoKg);
            if (pesoTotalKg > vehiculo.CapacidadKg)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion,
                    $"El peso total de los paquetes ({pesoTotalKg:0.##} kg) supera la capacidad máxima del vehículo {vehiculo.Patente} ({vehiculo.CapacidadKg:0.##} kg)");

            var idViaje = await _viajeRepository.CreateAsync(viaje, fechaSalida, idUsuarioDespachante);

            return Resultado<HojaRutaDTO>.Ok((await _viajeRepository.GetHojaRutaAsync(idViaje))!);
        }

        // Fase 3 del diagrama de secuencia: el chofer registra "Entregado" o "Cancelado"
        public async Task<Resultado<HojaRutaItemDTO>> UpdateEstadoPaqueteAsync(int idViaje, int idPaquete, ActualizarEstadoPaqueteDTO estado, int idUsuarioChofer)
        {
            if (estado.IdEstadoPaquete != EstadosPaquete.Entregado && estado.IdEstadoPaquete != EstadosPaquete.Cancelado)
                return Resultado<HojaRutaItemDTO>.Fallo(TipoError.Validacion, "Solo se puede registrar el estado Entregado o Cancelado");

            if (estado.IdEstadoPaquete == EstadosPaquete.Cancelado && string.IsNullOrWhiteSpace(estado.Observacion))
                return Resultado<HojaRutaItemDTO>.Fallo(TipoError.Validacion, "La observación es obligatoria al cancelar una entrega");

            var hojaRuta = await GetHojaRutaAsync(idViaje, idUsuarioChofer, true);
            if (!hojaRuta.Exito)
                return Resultado<HojaRutaItemDTO>.Fallo(hojaRuta.TipoError, hojaRuta.Error!);

            if (hojaRuta.Datos!.IdEstadoViaje != EstadosViaje.EnCurso)
                return Resultado<HojaRutaItemDTO>.Fallo(TipoError.Validacion, "El viaje no está en curso");

            var entrega = hojaRuta.Datos.Entregas.FirstOrDefault(e => e.IdPaquete == idPaquete);
            if (entrega == null)
                return Resultado<HojaRutaItemDTO>.Fallo(TipoError.NoEncontrado, "El paquete no pertenece a este viaje");

            if (entrega.IdEstadoActual != EstadosPaquete.EnTransito)
                return Resultado<HojaRutaItemDTO>.Fallo(TipoError.Validacion, $"El paquete ya tiene registrado su estado final ({entrega.EstadoActual})");

            await _viajeRepository.UpdateEstadoPaqueteAsync(idPaquete, estado.IdEstadoPaquete, idUsuarioChofer, estado.Observacion?.Trim());

            var actualizada = await _viajeRepository.GetHojaRutaAsync(idViaje);
            return Resultado<HojaRutaItemDTO>.Ok(actualizada!.Entregas.First(e => e.IdPaquete == idPaquete));
        }

        // Fase 3 del diagrama de secuencia: cierre del viaje (Limite de Salida)
        public async Task<Resultado<HojaRutaDTO>> FinalizarAsync(int id, int idUsuarioChofer)
        {
            var hojaRuta = await GetHojaRutaAsync(id, idUsuarioChofer, true);
            if (!hojaRuta.Exito)
                return hojaRuta;

            if (hojaRuta.Datos!.IdEstadoViaje != EstadosViaje.EnCurso)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion, "El viaje no está en curso");

            var pendientes = hojaRuta.Datos.Entregas.Where(e => e.IdEstadoActual == EstadosPaquete.EnTransito).ToList();
            if (pendientes.Count > 0)
                return Resultado<HojaRutaDTO>.Fallo(TipoError.Validacion,
                    $"Quedan paquetes sin estado final (Entregado/Cancelado): {string.Join(", ", pendientes.Select(p => p.CodigoSeguimiento))}");

            await _viajeRepository.UpdateEstadoViajeAsync(id, EstadosViaje.Finalizado);

            return Resultado<HojaRutaDTO>.Ok((await _viajeRepository.GetHojaRutaAsync(id))!);
        }
    }
}
