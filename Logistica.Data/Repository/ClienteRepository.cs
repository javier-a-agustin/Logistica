using System.Linq.Expressions;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class ClienteRepository(LogisticaDBContext _context) : IClienteRepository
    {
        private static readonly Expression<Func<Cliente, ClienteDTO>> ToDTO = c => new ClienteDTO
        {
            IdCliente = c.IdCliente,
            RazonSocialNombre = c.RazonSocialNombre,
            Apellido = c.Apellido,
            TipoDocumento = c.TipoDocumento,
            NumeroDocumento = c.NumeroDocumento,
            Telefono = c.Telefono,
            Calle = c.Calle,
            Altura = c.Altura,
            PisoDepto = c.PisoDepto,
            IdLocalidad = c.IdLocalidad,
            NombreLocalidad = c.Localidad.NombreLocalidad,
            CodigoPostal = c.Localidad.CodigoPostal,
            NombreProvincia = c.Localidad.Provincia.NombreProvincia,
            Email = c.Email
        };

        public async Task<List<ClienteDTO>> GetAllAsync(string? busqueda)
        {
            var query = _context.Clientes.AsQueryable();

            if (!string.IsNullOrWhiteSpace(busqueda))
                query = query.Where(c => c.RazonSocialNombre.Contains(busqueda)
                    || (c.Apellido != null && c.Apellido.Contains(busqueda))
                    || c.NumeroDocumento.Contains(busqueda));

            return await query
                .OrderBy(c => c.RazonSocialNombre).ThenBy(c => c.Apellido)
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<ClienteDTO?> GetByIdAsync(int id)
        {
            return await _context.Clientes
                .Where(c => c.IdCliente == id)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<ClienteDTO?> GetByDocumentoAsync(string tipoDocumento, string numeroDocumento)
        {
            return await _context.Clientes
                .Where(c => c.TipoDocumento == tipoDocumento && c.NumeroDocumento == numeroDocumento)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsDocumentoAsync(string tipoDocumento, string numeroDocumento, int? excluirIdCliente)
        {
            return await _context.Clientes.AnyAsync(c => c.TipoDocumento == tipoDocumento
                && c.NumeroDocumento == numeroDocumento
                && (excluirIdCliente == null || c.IdCliente != excluirIdCliente));
        }

        public async Task<ClienteDTO> CreateAsync(ClienteGuardarDTO cliente)
        {
            var entity = new Cliente();
            Map(cliente, entity);

            _context.Clientes.Add(entity);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(entity.IdCliente))!;
        }

        public async Task<ClienteDTO?> UpdateAsync(int id, ClienteGuardarDTO cliente)
        {
            var entity = await _context.Clientes.FirstOrDefaultAsync(c => c.IdCliente == id);
            if (entity == null)
                return null;

            Map(cliente, entity);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> HasPaquetesAsync(int id)
        {
            return await _context.Paquetes.AnyAsync(p => p.IdClienteRem == id || p.IdClienteDest == id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Clientes.FirstOrDefaultAsync(c => c.IdCliente == id);
            if (entity == null)
                return false;

            _context.Clientes.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        private static void Map(ClienteGuardarDTO dto, Cliente entity)
        {
            entity.RazonSocialNombre = dto.RazonSocialNombre.Trim();
            entity.Apellido = string.IsNullOrWhiteSpace(dto.Apellido) ? null : dto.Apellido.Trim();
            entity.TipoDocumento = dto.TipoDocumento;
            entity.NumeroDocumento = dto.NumeroDocumento;
            entity.Telefono = dto.Telefono?.Trim();
            entity.Calle = dto.Calle.Trim();
            entity.Altura = dto.Altura;
            entity.PisoDepto = dto.PisoDepto?.Trim();
            entity.IdLocalidad = dto.IdLocalidad;
            entity.Email = dto.Email?.Trim();
        }
    }
}
