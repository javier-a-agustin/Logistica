using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    // Las consultas de catalogos estan disponibles para cualquier usuario autenticado
    [Route("[controller]")]
    [ApiController]
    public class CatalogoController(ICatalogoService _catalogoService) : ApiControllerBase
    {
        [HttpGet("Provincias")]
        public async Task<IActionResult> GetProvinciasAsync()
        {
            return Ok(await _catalogoService.GetProvinciasAsync());
        }

        [HttpGet("Localidades")]
        public async Task<IActionResult> GetLocalidadesAsync(int? idProvincia)
        {
            return Ok(await _catalogoService.GetLocalidadesAsync(idProvincia));
        }

        [HttpGet("Roles")]
        public async Task<IActionResult> GetRolesAsync()
        {
            return Ok(await _catalogoService.GetRolesAsync());
        }

        [HttpGet("Marcas")]
        public async Task<IActionResult> GetMarcasAsync()
        {
            return Ok(await _catalogoService.GetMarcasAsync());
        }

        [HttpGet("Modelos")]
        public async Task<IActionResult> GetModelosAsync(int? idMarca)
        {
            return Ok(await _catalogoService.GetModelosAsync(idMarca));
        }

        [HttpGet("EstadosPaquete")]
        public async Task<IActionResult> GetEstadosPaqueteAsync()
        {
            return Ok(await _catalogoService.GetEstadosPaqueteAsync());
        }

        [HttpGet("EstadosViaje")]
        public async Task<IActionResult> GetEstadosViajeAsync()
        {
            return Ok(await _catalogoService.GetEstadosViajeAsync());
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPost("Marcas")]
        public async Task<IActionResult> CreateMarcaAsync(MarcaCrearDTO marca)
        {
            return Responder(await _catalogoService.CreateMarcaAsync(marca), StatusCodes.Status201Created);
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpPost("Modelos")]
        public async Task<IActionResult> CreateModeloAsync(ModeloCrearDTO modelo)
        {
            return Responder(await _catalogoService.CreateModeloAsync(modelo), StatusCodes.Status201Created);
        }
    }
}
