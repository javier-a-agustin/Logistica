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
    public class VehiculoController(IVehiculoService _vehiculoService) : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(bool soloActivos = false)
        {
            return Ok(await _vehiculoService.GetAllAsync(soloActivos));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var vehiculo = await _vehiculoService.GetByIdAsync(id);
            if (vehiculo == null)
                return NotFound();

            return Ok(vehiculo);
        }

        // Vehiculos activos sin viaje en curso
        [HttpGet("Disponibles")]
        public async Task<IActionResult> GetDisponiblesAsync()
        {
            return Ok(await _vehiculoService.GetDisponiblesAsync());
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(VehiculoGuardarDTO vehiculo)
        {
            return Responder(await _vehiculoService.CreateAsync(vehiculo), StatusCodes.Status201Created);
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, VehiculoGuardarDTO vehiculo)
        {
            return Responder(await _vehiculoService.UpdateAsync(id, vehiculo));
        }

        // Baja logica (Activo = N)
        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var resultado = await _vehiculoService.DeleteAsync(id);
            if (resultado.Exito)
                return NoContent();

            return Responder(resultado);
        }
    }
}
