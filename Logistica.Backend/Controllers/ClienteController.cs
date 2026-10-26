using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Despachante + "," + RolesSistema.Gerente)]
    public class ClienteController(IClienteService _clienteService) : ApiControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(string? busqueda)
        {
            return Ok(await _clienteService.GetAllAsync(busqueda));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var cliente = await _clienteService.GetByIdAsync(id);
            if (cliente == null)
                return NotFound();

            return Ok(cliente);
        }

        // Fase 1: el recepcionista consulta si el remitente/destinatario ya esta registrado
        [HttpGet("Documento/{tipoDocumento}/{numeroDocumento}")]
        public async Task<IActionResult> GetByDocumentoAsync(string tipoDocumento, string numeroDocumento)
        {
            var cliente = await _clienteService.GetByDocumentoAsync(tipoDocumento, numeroDocumento);
            if (cliente == null)
                return NotFound();

            return Ok(cliente);
        }

        [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Gerente)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(ClienteGuardarDTO cliente)
        {
            return Responder(await _clienteService.CreateAsync(cliente), StatusCodes.Status201Created);
        }

        [Authorize(Roles = RolesSistema.Recepcionista + "," + RolesSistema.Gerente)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(int id, ClienteGuardarDTO cliente)
        {
            return Responder(await _clienteService.UpdateAsync(id, cliente));
        }

        [Authorize(Roles = RolesSistema.Gerente)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var resultado = await _clienteService.DeleteAsync(id);
            if (resultado.Exito)
                return NoContent();

            return Responder(resultado);
        }
    }
}
