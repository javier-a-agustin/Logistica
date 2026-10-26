using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PaqueteController(IPaqueteService _paqueteService) : ApiControllerBase
    {
        [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Despachante + "," + RolesSistema.Gerente)]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(int? idEstado)
        {
            return Ok(await _paqueteService.GetAllAsync(idEstado));
        }

        [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Despachante + "," + RolesSistema.Gerente)]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var paquete = await _paqueteService.GetByIdAsync(id);
            if (paquete == null)
                return NotFound();

            return Ok(paquete);
        }

        // Trazabilidad: estado actual + historial completo (cualquier rol)
        [HttpGet("Seguimiento/{codigoSeguimiento}")]
        public async Task<IActionResult> GetSeguimientoAsync(string codigoSeguimiento)
        {
            var seguimiento = await _paqueteService.GetSeguimientoAsync(codigoSeguimiento);
            if (seguimiento == null)
                return NotFound();

            return Ok(seguimiento);
        }

        // Fase 1: alta de la encomienda en el deposito. Devuelve el comprobante con el CodigoSeguimiento
        [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Gerente)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(PaqueteCrearDTO paquete)
        {
            return Responder(await _paqueteService.CreateAsync(paquete, IdUsuarioActual), StatusCodes.Status201Created);
        }
    }
}
