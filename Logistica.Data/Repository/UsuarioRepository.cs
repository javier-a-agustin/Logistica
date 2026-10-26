using System.Linq.Expressions;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Logistica.Data.EF;
using Microsoft.EntityFrameworkCore;

namespace Logistica.Data.Repository
{
    public class UsuarioRepository(LogisticaDBContext _context) : IUsuarioRepository
    {
        private static readonly Expression<Func<Usuario, UsuarioDTO>> ToDTO = u => new UsuarioDTO
        {
            IdUsuario = u.IdUsuario,
            NombreUsuario = u.NombreUsuario,
            IdRol = u.IdRol,
            NombreRol = u.Rol.NombreRol,
            Activo = u.Activo
        };

        public async Task<UsuarioCredencialDTO?> GetCredencialesAsync(string nombreUsuario)
        {
            return await _context.Usuarios
                .Where(u => u.NombreUsuario == nombreUsuario)
                .Select(u => new UsuarioCredencialDTO
                {
                    IdUsuario = u.IdUsuario,
                    NombreUsuario = u.NombreUsuario,
                    IdRol = u.IdRol,
                    NombreRol = u.Rol.NombreRol,
                    Activo = u.Activo,
                    PasswordHash = u.PasswordHash
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<UsuarioDTO>> GetAllAsync()
        {
            return await _context.Usuarios
                .OrderBy(u => u.NombreUsuario)
                .Select(ToDTO)
                .ToListAsync();
        }

        public async Task<UsuarioDTO?> GetByIdAsync(int id)
        {
            return await _context.Usuarios
                .Where(u => u.IdUsuario == id)
                .Select(ToDTO)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsNombreUsuarioAsync(string nombreUsuario)
        {
            return await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreUsuario);
        }

        public async Task<UsuarioDTO> CreateAsync(string nombreUsuario, string passwordHash, int idRol)
        {
            var usuario = new Usuario
            {
                NombreUsuario = nombreUsuario,
                PasswordHash = passwordHash,
                IdRol = idRol,
                Activo = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(usuario.IdUsuario))!;
        }

        public async Task<UsuarioDTO?> UpdateAsync(int id, UsuarioActualizarDTO usuario)
        {
            var entity = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdUsuario == id);
            if (entity == null)
                return null;

            entity.IdRol = usuario.IdRol;
            entity.Activo = usuario.Activo;
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> UpdatePasswordAsync(int id, string passwordHash)
        {
            var entity = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdUsuario == id);
            if (entity == null)
                return false;

            entity.PasswordHash = passwordHash;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
