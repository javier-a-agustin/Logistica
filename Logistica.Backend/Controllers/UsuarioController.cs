using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    // Administracion de usuarios: exclusivo del Gerente
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = RolesSistema.Gerente)]
    public class UsuarioController(IUsuarioService _usuarioService) : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            return Ok(await _usuarioService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var usuario = await _usuarioService.GetByIdAsync(id);
            if (usuario == null)
                return NotFound();

            return Ok(usuario);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(UsuarioCrearDTO usuario)
        {
            return Responder(await _usuarioService.CreateAsync(usuario), StatusCodes.Status201Created);
        }

        // Cambia rol y/o activa/desactiva el usuario
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, UsuarioActualizarDTO usuario)
        {
            return Responder(await _usuarioService.UpdateAsync(id, usuario));
        }

        [HttpPut("{id}/Password")]
        public async Task<IActionResult> UpdatePasswordAsync(int id, CambiarPasswordDTO cambio)
        {
            var resultado = await _usuarioService.UpdatePasswordAsync(id, cambio);
            if (resultado.Exito)
                return NoContent();

            return Responder(resultado);
        }
    }
}
