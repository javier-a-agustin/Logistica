using System.Security.Claims;
using Logistica.Abstracciones.Comun;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Logistica.Backend.Controllers
{
    public abstract class ApiControllerBase : ControllerBase
    {
        // Id del usuario autenticado (claim "sub" del JWT)
        protected int IdUsuarioActual => int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

        // Traduce el Resultado de la capa de negocio al codigo HTTP correspondiente
        protected IActionResult Responder<T>(Resultado<T> resultado, int codigoExito = StatusCodes.Status200OK)
        {
            if (resultado.Exito)
                return StatusCode(codigoExito, resultado.Datos);

            return resultado.TipoError switch
            {
                TipoError.NoEncontrado => NotFound(resultado.Error),
                TipoError.NoAutorizado => Unauthorized(resultado.Error),
                TipoError.Prohibido => StatusCode(StatusCodes.Status403Forbidden, resultado.Error),
                TipoError.Conflicto => Conflict(resultado.Error),
                _ => BadRequest(resultado.Error)
            };
        }
    }
}
