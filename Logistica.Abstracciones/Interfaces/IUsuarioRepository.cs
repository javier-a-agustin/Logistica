using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<UsuarioCredencialDTO?> GetCredencialesAsync(string nombreUsuario);
        Task<List<UsuarioDTO>> GetAllAsync();
        Task<UsuarioDTO?> GetByIdAsync(int id);
        Task<bool> ExistsNombreUsuarioAsync(string nombreUsuario);
        Task<UsuarioDTO> CreateAsync(string nombreUsuario, string passwordHash, int idRol);
        Task<UsuarioDTO?> UpdateAsync(int id, UsuarioActualizarDTO usuario);
        Task<bool> UpdatePasswordAsync(int id, string passwordHash);
    }
}
