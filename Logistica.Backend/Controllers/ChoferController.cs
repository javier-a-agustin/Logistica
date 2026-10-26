using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = RolesSistema.Despachante + "," + RolesSistema.Gerente)]
    public class ChoferController(IChoferService _choferService) : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(bool soloActivos = false)
        {
            return Ok(await _choferService.GetAllAsync(soloActivos));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var chofer = await _choferService.GetByIdAsync(id);
            if (chofer == null)
                return NotFound();

            return Ok(chofer);
        }

        // Choferes activos, con licencia vigente y sin viaje en curso
        [HttpGet("Habilitados")]
        public async Task<IActionResult> GetHabilitadosAsync()
        {
            return Ok(await _choferService.GetHabilitadosAsync());
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(ChoferGuardarDTO chofer)
        {
            return Responder(await _choferService.CreateAsync(chofer), StatusCodes.Status201Created);
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, ChoferGuardarDTO chofer)
        {
            return Responder(await _choferService.UpdateAsync(id, chofer));
        }

        // Baja logica (Activo = N)
        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var resultado = await _choferService.DeleteAsync(id);
            if (resultado.Exito)
                return NoContent();

            return Responder(resultado);
        }
    }
}
