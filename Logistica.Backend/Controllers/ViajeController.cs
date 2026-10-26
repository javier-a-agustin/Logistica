using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistica.Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ViajeController(IViajeService _viajeService) : ApiControllerBase
    {
        // Fase 2: paquetes "En depósito", vehiculos disponibles y choferes habilitados
        [Authorize(Roles = RolesSistema.Despachante + "," + RolesSistema.Gerente)]
        [HttpGet("Disponibles")]
        public async Task<IActionResult> GetDisponiblesAsync()
        {
            return Ok(await _viajeService.GetDisponiblesAsync());
        }

        [Authorize(Roles = RolesSistema.Despachante + "," + RolesSistema.Gerente)]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync(int? idEstado)
        {
            return Ok(await _viajeService.GetAllAsync(idEstado));
        }

        // El chofer solo puede consultar sus propias hojas de ruta
        [Authorize(Roles = RolesSistema.Despachante + "," + RolesSistema.Gerente + "," + RolesSistema.Chofer)]
        [HttpGet("{id}/HojaRuta")]
        public async Task<IActionResult> GetHojaRutaAsync(int id)
        {
            return Responder(await _viajeService.GetHojaRutaAsync(id, IdUsuarioActual, User.IsInRole(RolesSistema.Chofer)));
        }

        // Fase 2: crea el viaje validando SUM(PesoKg) <= CapacidadKg
        [Authorize(Roles = RolesSistema.Despachante + "," + RolesSistema.Gerente)]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(ViajeCrearDTO viaje)
        {
            return Responder(await _viajeService.CreateAsync(viaje, IdUsuarioActual), StatusCodes.Status201Created);
        }

        // Fase 3: hojas de ruta en curso del chofer autenticado
        [Authorize(Roles = RolesSistema.Chofer)]
        [HttpGet("MisViajes")]
        public async Task<IActionResult> GetMisViajesAsync()
        {
            return Ok(await _viajeService.GetMisViajesAsync(IdUsuarioActual));
        }

        // Fase 3: el chofer registra "Entregado" o "Cancelado" (con observacion obligatoria)
        [Authorize(Roles = RolesSistema.Chofer)]
        [HttpPut("{id}/Paquete/{idPaquete}/Estado")]
        public async Task<IActionResult> UpdateEstadoPaqueteAsync(int id, int idPaquete, ActualizarEstadoPaqueteDTO estado)
        {
            return Responder(await _viajeService.UpdateEstadoPaqueteAsync(id, idPaquete, estado, IdUsuarioActual));
        }

        // Fase 3: cierre del recorrido
        [Authorize(Roles = RolesSistema.Chofer)]
        [HttpPut("{id}/Finalizar")]
        public async Task<IActionResult> FinalizarAsync(int id)
        {
            return Responder(await _viajeService.FinalizarAsync(id, IdUsuarioActual));
        }
    }
}
