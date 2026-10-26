using System.Linq.Expressions;
using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class ChoferRepository(LogisticaDBContext _context) : IChoferRepository
    {
        private static readonly Expression<Func<Chofer, ChoferDTO>> ToDTO = c => new ChoferDTO
        {
            IdChofer = c.IdChofer,
            IdUsuario = c.IdUsuario,
            NombreUsuario = c.Usuario.NombreUsuario,
            UsuarioActivo = c.Usuario.Activo,
            Nombre = c.Nombre,
            Apellido = c.Apellido,
            Dni = c.Dni,
            LicenciaConducir = c.LicenciaConducir,
            FechaVencimientoLicencia = c.FechaVencimientoLicencia,
            Telefono = c.Telefono,
            Activo = c.Activo
        };

        public async Task<List<ChoferDTO>> GetAllAsync(bool soloActivos)
        {
            return await _context.Choferes
                .Where(c => !soloActivos || c.Activo)
                .OrderBy(c => c.Apellido).ThenBy(c => c.Nombre)
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<ChoferDTO?> GetByIdAsync(int id)
        {
            return await _context.Choferes
                .Where(c => c.IdChofer == id)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<ChoferDTO?> GetByUsuarioAsync(int idUsuario)
        {
            return await _context.Choferes
                .Where(c => c.IdUsuario == idUsuario)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsDniAsync(string dni, int? excluirIdChofer)
        {
            return await _context.Choferes.AnyAsync(c => c.Dni == dni
                && (excluirIdChofer == null || c.IdChofer != excluirIdChofer));
        }

        public async Task<bool> ExistsUsuarioAsync(int idUsuario, int? excluirIdChofer)
        {
            return await _context.Choferes.AnyAsync(c => c.IdUsuario == idUsuario
                && (excluirIdChofer == null || c.IdChofer != excluirIdChofer));
        }

        public async Task<ChoferDTO> CreateAsync(ChoferGuardarDTO chofer)
        {
            var entity = new Chofer();
            Map(chofer, entity);

            _context.Choferes.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.IdChofer))!;
        }

        public async Task<ChoferDTO?> UpdateAsync(int id, ChoferGuardarDTO chofer)
        {
            var entity = await _context.Choferes.FirstOrDefaultAsync(c => c.IdChofer == id);
            if (entity == null)
                return null;

            Map(chofer, entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> SetActivoAsync(int id, bool activo)
        {
            var entity = await _context.Choferes.FirstOrDefaultAsync(c => c.IdChofer == id);
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
                .Select(v => v.IdChofer)
                .Distinct()
                .ToListAsync();
        }

        private static void Map(ChoferGuardarDTO dto, Chofer entity)
        {
            entity.IdUsuario = dto.IdUsuario;
            entity.Nombre = dto.Nombre.Trim();
            entity.Apellido = dto.Apellido.Trim();
            entity.Dni = dto.Dni;
            entity.LicenciaConducir = dto.LicenciaConducir;
            entity.FechaVencimientoLicencia = dto.FechaVencimientoLicencia;
            entity.Telefono = dto.Telefono?.Trim();
            entity.Activo = dto.Activo;
        }
    }
}
