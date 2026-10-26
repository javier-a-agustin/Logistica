using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IUsuarioService
    {
        Task<List<UsuarioDTO>> GetAllAsync();
        Task<UsuarioDTO?> GetByIdAsync(int id);
        Task<Resultado<UsuarioDTO>> CreateAsync(UsuarioCrearDTO usuario);
        Task<Resultado<UsuarioDTO>> UpdateAsync(int id, UsuarioActualizarDTO usuario);
        Task<Resultado<bool>> UpdatePasswordAsync(int id, CambiarPasswordDTO cambio);
    }
}
