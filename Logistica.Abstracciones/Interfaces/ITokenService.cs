using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface ITokenService
    {
        LoginRespuestaDTO GenerateToken(UsuarioDTO usuario);
    }
}
