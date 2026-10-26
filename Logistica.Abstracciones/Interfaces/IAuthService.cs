using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IAuthService
    {
        Task<Resultado<LoginRespuestaDTO>> LoginAsync(LoginDTO login);
    }
}
