using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController(IAuthService _authService, IUsuarioService _usuarioService) : ApiControllerBase
    {
        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> LoginAsync(LoginDTO login)
        {
            return Responder(await _authService.LoginAsync(login));
        }

        // Datos del usuario autenticado (cualquier rol)
        [HttpGet("Me")]
        public async Task<IActionResult> GetMeAsync()
        {
            var usuario = await _usuarioService.GetByIdAsync(IdUsuarioActual);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }
    }
}
