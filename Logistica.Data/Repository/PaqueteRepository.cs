using System.Linq.Expressions;
using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class PaqueteRepository(LogisticaDBContext _context) : IPaqueteRepository
    {
        private static readonly Expression<Func<Paquete, PaqueteDTO>> ToDTO = p => new PaqueteDTO
        {
            IdPaquete = p.IdPaquete,
            CodigoSeguimiento = p.CodigoSeguimiento,
            IdClienteRem = p.IdClienteRem,
            Remitente = p.ClienteRem.Apellido == null
                ? p.ClienteRem.RazonSocialNombre
                : p.ClienteRem.RazonSocialNombre + " " + p.ClienteRem.Apellido,
            IdClienteDest = p.IdClienteDest,
            Destinatario = p.ClienteDest.Apellido == null
                ? p.ClienteDest.RazonSocialNombre
                : p.ClienteDest.RazonSocialNombre + " " + p.ClienteDest.Apellido,
            IdUsuarioRecepcion = p.IdUsuarioRecepcion,
            UsuarioRecepcion = p.UsuarioRecepcion.NombreUsuario,
            Descripcion = p.Descripcion,
            PesoKg = p.PesoKg,
            AltoCm = p.AltoCm,
            AnchoCm = p.AnchoCm,
            LargoCm = p.LargoCm,
            IdEstadoActual = p.IdEstadoActual,
            EstadoActual = p.EstadoActual.NombreEstado,
            FechaIngreso = p.FechaIngreso
        };

        public async Task<List<PaqueteDTO>> GetAllAsync(int? idEstado)
        {
            return await _context.Paquetes
                .Where(p => idEstado == null || p.IdEstadoActual == idEstado)
                .OrderBy(p => p.FechaIngreso)
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<PaqueteDTO?> GetByIdAsync(int id)
        {
            return await _context.Paquetes
                .Where(p => p.IdPaquete == id)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<PaqueteDTO?> GetByCodigoAsync(string codigoSeguimiento)
        {
            return await _context.Paquetes
                .Where(p => p.CodigoSeguimiento == codigoSeguimiento)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<List<PaqueteDTO>> GetByIdsAsync(List<int> ids)
        {
            return await _context.Paquetes
                .Where(p => ids.Contains(p.IdPaquete))
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<List<HistorialPaqueteDTO>> GetHistorialAsync(int idPaquete)
        {
            return await _context.HistorialPaquetes
                .Where(h => h.IdPaquete == idPaquete)
                .OrderBy(h => h.FechaHora).ThenBy(h => h.IdHistorial)
                .Select(h => new HistorialPaqueteDTO
                {
                    IdHistorial = h.IdHistorial,
                    IdEstadoPaquete = h.IdEstadoPaquete,
                    Estado = h.EstadoPaquete.NombreEstado,
                    IdUsuario = h.IdUsuario,
                    Usuario = h.Usuario.NombreUsuario,
                    FechaHora = h.FechaHora,
                    Observacion = h.Observacion
                })
                .ToListAsync();
        }

        public async Task<bool> ExistsCodigoAsync(string codigoSeguimiento)
        {
            return await _context.Paquetes.AnyAsync(p => p.CodigoSeguimiento == codigoSeguimiento);
        }

        public async Task<PaqueteDTO> CreateAsync(PaqueteCrearDTO paquete, string codigoSeguimiento, int idUsuarioRecepcion)
        {
            var fechaIngreso = DateTime.Now;

            var entity = new Paquete
            {
                CodigoSeguimiento = codigoSeguimiento,
                IdClienteRem = paquete.IdClienteRem,
                IdClienteDest = paquete.IdClienteDest,
                IdUsuarioRecepcion = idUsuarioRecepcion,
                Descripcion = paquete.Descripcion?.Trim(),
                PesoKg = paquete.PesoKg,
                AltoCm = paquete.AltoCm,
                AnchoCm = paquete.AnchoCm,
                LargoCm = paquete.LargoCm,
                IdEstadoActual = EstadosPaquete.EnDeposito,
                FechaIngreso = fechaIngreso
            };

            entity.Historial.Add(new HistorialPaquete
            {
                IdEstadoPaquete = EstadosPaquete.EnDeposito,
                IdUsuario = idUsuarioRecepcion,
                FechaHora = fechaIngreso,
                Observacion = "Ingreso al depósito de origen"
            });

            // Un unico SaveChanges: Paquete e HistorialPaquete se insertan en la misma transaccion
            _context.Paquetes.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.IdPaquete))!;
        }
    }
}
