using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class ViajeRepository(LogisticaDBContext _context) : IViajeRepository
    {
        public async Task<List<ViajeDTO>> GetAllAsync(int? idEstado)
        {
            return await _context.Viajes
                .Where(v => idEstado == null || v.IdEstadoViaje == idEstado)
                .OrderByDescending(v => v.FechaSalida)
                .Select(v => new ViajeDTO
                {
                    IdViaje = v.IdViaje,
                    IdVehiculo = v.IdVehiculo,
                    Patente = v.Vehiculo.Patente,
                    IdChofer = v.IdChofer,
                    Chofer = v.Chofer.Nombre + " " + v.Chofer.Apellido,
                    Despachante = v.UsuarioDespachante.NombreUsuario,
                    FechaSalida = v.FechaSalida,
                    FechaLlegadaEstimada = v.FechaLlegadaEstimada,
                    IdEstadoViaje = v.IdEstadoViaje,
                    EstadoViaje = v.EstadoViaje.NombreEstadoViaje,
                    CantidadPaquetes = v.Detalles.Count(),
                    PesoTotalKg = v.Detalles.Sum(d => d.Paquete.PesoKg)
                })
                .ToListAsync();
        }

        public async Task<List<int>> GetIdsByUsuarioChoferAsync(int idUsuarioChofer, int idEstadoViaje)
        {
            return await _context.Viajes
                .Where(v => v.Chofer.IdUsuario == idUsuarioChofer && v.IdEstadoViaje == idEstadoViaje)
                .OrderBy(v => v.FechaSalida)
                .Select(v => v.IdViaje)
                .ToListAsync();
        }

        // Hoja de ruta: viaje + paquetes ordenados por OrdenEntrega con el domicilio normalizado del destinatario
        public async Task<HojaRutaDTO?> GetHojaRutaAsync(int id)
        {
            return await _context.Viajes
                .Where(v => v.IdViaje == id)
                .Select(v => new HojaRutaDTO
                {
                    IdViaje = v.IdViaje,
                    IdVehiculo = v.IdVehiculo,
                    Patente = v.Vehiculo.Patente,
                    Vehiculo = v.Vehiculo.Modelo.Marca.NombreMarca + " " + v.Vehiculo.Modelo.NombreModelo,
                    CapacidadKg = v.Vehiculo.CapacidadKg,
                    IdChofer = v.IdChofer,
                    IdUsuarioChofer = v.Chofer.IdUsuario,
                    Chofer = v.Chofer.Nombre + " " + v.Chofer.Apellido,
                    IdUsuarioDespachante = v.IdUsuarioDespachante,
                    Despachante = v.UsuarioDespachante.NombreUsuario,
                    FechaSalida = v.FechaSalida,
                    FechaLlegadaEstimada = v.FechaLlegadaEstimada,
                    IdEstadoViaje = v.IdEstadoViaje,
                    EstadoViaje = v.EstadoViaje.NombreEstadoViaje,
                    Entregas = v.Detalles
                        .OrderBy(d => d.OrdenEntrega)
                        .Select(d => new HojaRutaItemDTO
                        {
                            OrdenEntrega = d.OrdenEntrega,
                            IdPaquete = d.IdPaquete,
                            CodigoSeguimiento = d.Paquete.CodigoSeguimiento,
                            Descripcion = d.Paquete.Descripcion,
                            PesoKg = d.Paquete.PesoKg,
                            AltoCm = d.Paquete.AltoCm,
                            AnchoCm = d.Paquete.AnchoCm,
                            LargoCm = d.Paquete.LargoCm,
                            IdEstadoActual = d.Paquete.IdEstadoActual,
                            EstadoActual = d.Paquete.EstadoActual.NombreEstado,
                            Destinatario = d.Paquete.ClienteDest.Apellido == null
                                ? d.Paquete.ClienteDest.RazonSocialNombre
                                : d.Paquete.ClienteDest.RazonSocialNombre + " " + d.Paquete.ClienteDest.Apellido,
                            TelefonoDestinatario = d.Paquete.ClienteDest.Telefono,
                            Calle = d.Paquete.ClienteDest.Calle,
                            Altura = d.Paquete.ClienteDest.Altura,
                            PisoDepto = d.Paquete.ClienteDest.PisoDepto,
                            Localidad = d.Paquete.ClienteDest.Localidad.NombreLocalidad,
                            CodigoPostal = d.Paquete.ClienteDest.Localidad.CodigoPostal,
                            Provincia = d.Paquete.ClienteDest.Localidad.Provincia.NombreProvincia
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> CreateAsync(ViajeCrearDTO viaje, DateTime fechaSalida, int idUsuarioDespachante)
        {
            var idsPaquete = viaje.Paquetes.Select(p => p.IdPaquete).ToList();
            var paquetes = await _context.Paquetes.Where(p => idsPaquete.Contains(p.IdPaquete)).ToListAsync();

            var entity = new Viaje
            {
                IdVehiculo = viaje.IdVehiculo,
                IdChofer = viaje.IdChofer,
                IdUsuarioDespachante = idUsuarioDespachante,
                FechaSalida = fechaSalida,
                FechaLlegadaEstimada = viaje.FechaLlegadaEstimada,
                IdEstadoViaje = EstadosViaje.EnCurso
            };

            foreach (var item in viaje.Paquetes)
                entity.Detalles.Add(new DetalleViaje { IdPaquete = item.IdPaquete, OrdenEntrega = item.OrdenEntrega });

            foreach (var paquete in paquetes)
            {
                paquete.IdEstadoActual = EstadosPaquete.EnTransito;
                paquete.Historial.Add(new HistorialPaquete
                {
                    IdEstadoPaquete = EstadosPaquete.EnTransito,
                    IdUsuario = idUsuarioDespachante,
                    FechaHora = DateTime.Now,
                    Observacion = "Asignado a hoja de ruta"
                });
            }

            // Un unico SaveChanges: Viaje, DetalleViaje, Paquete e HistorialPaquete en la misma transaccion (todo o nada)
            _context.Viajes.Add(entity);
            await _context.SaveChangesAsync();

            return entity.IdViaje;
        }

        public async Task UpdateEstadoPaqueteAsync(int idPaquete, int idEstadoPaquete, int idUsuario, string? observacion)
        {
            var paquete = await _context.Paquetes.FirstAsync(p => p.IdPaquete == idPaquete);

            paquete.IdEstadoActual = idEstadoPaquete;
            paquete.Historial.Add(new HistorialPaquete
            {
                IdEstadoPaquete = idEstadoPaquete,
                IdUsuario = idUsuario,
                FechaHora = DateTime.Now,
                Observacion = observacion
            });

            await _context.SaveChangesAsync();
        }

        public async Task UpdateEstadoViajeAsync(int id, int idEstadoViaje)
        {
            var viaje = await _context.Viajes.FirstAsync(v => v.IdViaje == id);

            viaje.IdEstadoViaje = idEstadoViaje;
            await _context.SaveChangesAsync();
        }
    }
}
