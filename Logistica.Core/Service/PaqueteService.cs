using System.Security.Cryptography;
using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class PaqueteService(IPaqueteRepository _paqueteRepository, IClienteRepository _clienteRepository) : IPaqueteService
    {
        // Sin 0/O ni 1/I para evitar confusiones al dictar el codigo
        private const string CaracteresCodigo = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        public async Task<List<PaqueteDTO>> GetAllAsync(int? idEstado)
        {
            return await _paqueteRepository.GetAllAsync(idEstado);
        }

        public async Task<PaqueteDTO?> GetByIdAsync(int id)
        {
            return await _paqueteRepository.GetByIdAsync(id);
        }

        public async Task<SeguimientoDTO?> GetSeguimientoAsync(string codigoSeguimiento)
        {
            var paquete = await _paqueteRepository.GetByCodigoAsync(codigoSeguimiento.Trim().ToUpperInvariant());
            if (paquete == null)
                return null;

            return new SeguimientoDTO
            {
                Paquete = paquete,
                Historial = await _paqueteRepository.GetHistorialAsync(paquete.IdPaquete)
            };
        }

        // Fase 1 del diagrama de secuencia: el paquete ingresa "En depósito" y se registra en el historial
        public async Task<Resultado<PaqueteDTO>> CreateAsync(PaqueteCrearDTO paquete, int idUsuarioRecepcion)
        {
            if (await _clienteRepository.GetByIdAsync(paquete.IdClienteRem) == null)
                return Resultado<PaqueteDTO>.Fallo(TipoError.Validacion, "El cliente remitente no existe");

            if (await _clienteRepository.GetByIdAsync(paquete.IdClienteDest) == null)
                return Resultado<PaqueteDTO>.Fallo(TipoError.Validacion, "El cliente destinatario no existe");

            var codigoSeguimiento = await GenerateCodigoSeguimientoAsync();

            return Resultado<PaqueteDTO>.Ok(await _paqueteRepository.CreateAsync(paquete, codigoSeguimiento, idUsuarioRecepcion));
        }

        // Formato: TLS-AAMMDD-XXXXXX (ej: TLS-261025-K7M2QA)
        private async Task<string> GenerateCodigoSeguimientoAsync()
        {
            string codigo;
            do
            {
                codigo = $"TLS-{DateTime.Now:yyMMdd}-{RandomNumberGenerator.GetString(CaracteresCodigo, 6)}";
            }
            while (await _paqueteRepository.ExistsCodigoAsync(codigo));

            return codigo;
        }
    }
}
