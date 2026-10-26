using System.Linq.Expressions;
using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class VehiculoRepository(LogisticaDBContext _context) : IVehiculoRepository
    {
        private static readonly Expression<Func<Vehiculo, VehiculoDTO>> ToDTO = v => new VehiculoDTO
        {
            IdVehiculo = v.IdVehiculo,
            Patente = v.Patente,
            IdModelo = v.IdModelo,
            NombreModelo = v.Modelo.NombreModelo,
            IdMarca = v.Modelo.IdMarca,
            NombreMarca = v.Modelo.Marca.NombreMarca,
            CapacidadKg = v.CapacidadKg,
            Activo = v.Activo
        };

        public async Task<List<VehiculoDTO>> GetAllAsync(bool soloActivos)
        {
            return await _context.Vehiculos
                .Where(v => !soloActivos || v.Activo)
                .OrderBy(v => v.Patente)
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<VehiculoDTO?> GetByIdAsync(int id)
        {
            return await _context.Vehiculos
                .Where(v => v.IdVehiculo == id)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsPatenteAsync(string patente, int? excluirIdVehiculo)
        {
            return await _context.Vehiculos.AnyAsync(v => v.Patente == patente
                && (excluirIdVehiculo == null || v.IdVehiculo != excluirIdVehiculo));
        }

        public async Task<VehiculoDTO> CreateAsync(VehiculoGuardarDTO vehiculo)
        {
            var entity = new Vehiculo();
            Map(vehiculo, entity);

            _context.Vehiculos.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.IdVehiculo))!;
        }

        public async Task<VehiculoDTO?> UpdateAsync(int id, VehiculoGuardarDTO vehiculo)
        {
            var entity = await _context.Vehiculos.FirstOrDefaultAsync(v => v.IdVehiculo == id);
            if (entity == null)
                return null;

            Map(vehiculo, entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> SetActivoAsync(int id, bool activo)
        {
            var entity = await _context.Vehiculos.FirstOrDefaultAsync(v => v.IdVehiculo == id);
            if (entity == null)
                return false;

            entity.Activo = activo;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<int>> GetIdsEnViajeActivoAsync()
        {
            return await _context.Viajes
                .Where(v => v.IdEstadoViaje == EstadosViaje.Programado || v.IdEstadoViaje == EstadosViaje.EnCurso)
                .Select(v => v.IdVehiculo)
                .Distinct()
                .ToListAsync();
        }

        private static void Map(VehiculoGuardarDTO dto, Vehiculo entity)
        {
            entity.Patente = dto.Patente;
            entity.IdModelo = dto.IdModelo;
            entity.CapacidadKg = dto.CapacidadKg;
            entity.Activo = dto.Activo;
        }
    }
}
