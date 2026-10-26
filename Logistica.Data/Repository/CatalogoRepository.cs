using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class CatalogoRepository(LogisticaDBContext _context) : ICatalogoRepository
    {
        public async Task<List<ProvinciaDTO>> GetProvinciasAsync()
        {
            return await _context.Provincias
                .OrderBy(p => p.NombreProvincia)
                .Select(p => new ProvinciaDTO
                {
                    IdProvincia = p.IdProvincia,
                    NombreProvincia = p.NombreProvincia
                })
                .ToListAsync();
        }

        public async Task<List<LocalidadDTO>> GetLocalidadesAsync(int? idProvincia)
        {
            return await _context.Localidades
                .Where(l => idProvincia == null || l.IdProvincia == idProvincia)
                .OrderBy(l => l.NombreLocalidad)
                .Select(l => new LocalidadDTO
                {
                    IdLocalidad = l.IdLocalidad,
                    IdProvincia = l.IdProvincia,
                    NombreProvincia = l.Provincia.NombreProvincia,
                    NombreLocalidad = l.NombreLocalidad,
                    CodigoPostal = l.CodigoPostal
                })
                .ToListAsync();
        }

        public async Task<List<RolDTO>> GetRolesAsync()
        {
            return await _context.Roles
                .OrderBy(r => r.IdRol)
                .Select(r => new RolDTO
                {
                    IdRol = r.IdRol,
                    NombreRol = r.NombreRol,
                    Descripcion = r.Descripcion
                })
                .ToListAsync();
        }

        public async Task<List<MarcaDTO>> GetMarcasAsync()
        {
            return await _context.MarcasVehiculo
                .OrderBy(m => m.NombreMarca)
                .Select(m => new MarcaDTO
                {
                    IdMarca = m.IdMarca,
                    NombreMarca = m.NombreMarca
                })
                .ToListAsync();
        }

        public async Task<List<ModeloDTO>> GetModelosAsync(int? idMarca)
        {
            return await _context.ModelosVehiculo
                .Where(m => idMarca == null || m.IdMarca == idMarca)
                .OrderBy(m => m.Marca.NombreMarca).ThenBy(m => m.NombreModelo)
                .Select(m => new ModeloDTO
                {
                    IdModelo = m.IdModelo,
                    IdMarca = m.IdMarca,
                    NombreMarca = m.Marca.NombreMarca,
                    NombreModelo = m.NombreModelo
                })
                .ToListAsync();
        }

        public async Task<List<EstadoDTO>> GetEstadosPaqueteAsync()
        {
            return await _context.EstadosPaquete
                .OrderBy(e => e.IdEstadoPaquete)
                .Select(e => new EstadoDTO { Id = e.IdEstadoPaquete, Nombre = e.NombreEstado })
                .ToListAsync();
        }

        public async Task<List<EstadoDTO>> GetEstadosViajeAsync()
        {
            return await _context.EstadosViaje
                .OrderBy(e => e.IdEstadoViaje)
                .Select(e => new EstadoDTO { Id = e.IdEstadoViaje, Nombre = e.NombreEstadoViaje })
                .ToListAsync();
        }

        public async Task<RolDTO?> GetRolByIdAsync(int idRol)
        {
            return await _context.Roles
                .Where(r => r.IdRol == idRol)
                .Select(r => new RolDTO
                {
                    IdRol = r.IdRol,
                    NombreRol = r.NombreRol,
                    Descripcion = r.Descripcion
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsLocalidadAsync(int idLocalidad)
        {
            return await _context.Localidades.AnyAsync(l => l.IdLocalidad == idLocalidad);
        }

        public async Task<bool> ExistsMarcaAsync(int idMarca)
        {
            return await _context.MarcasVehiculo.AnyAsync(m => m.IdMarca == idMarca);
        }

        public async Task<bool> ExistsModeloAsync(int idModelo)
        {
            return await _context.ModelosVehiculo.AnyAsync(m => m.IdModelo == idModelo);
        }

        public async Task<bool> ExistsNombreMarcaAsync(string nombreMarca)
        {
            return await _context.MarcasVehiculo.AnyAsync(m => m.NombreMarca == nombreMarca);
        }

        public async Task<bool> ExistsNombreModeloAsync(int idMarca, string nombreModelo)
        {
            return await _context.ModelosVehiculo.AnyAsync(m => m.IdMarca == idMarca && m.NombreModelo == nombreModelo);
        }

        public async Task<MarcaDTO> CreateMarcaAsync(MarcaCrearDTO marca)
        {
            var entity = new MarcaVehiculo { NombreMarca = marca.NombreMarca };

            _context.MarcasVehiculo.Add(entity);
            await _context.SaveChangesAsync();

            return new MarcaDTO { IdMarca = entity.IdMarca, NombreMarca = entity.NombreMarca };
        }

        public async Task<ModeloDTO> CreateModeloAsync(ModeloCrearDTO modelo)
        {
            var entity = new ModeloVehiculo { IdMarca = modelo.IdMarca, NombreModelo = modelo.NombreModelo };

            _context.ModelosVehiculo.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetModelosAsync(modelo.IdMarca)).First(m => m.IdModelo == entity.IdModelo);
        }
    }
}
