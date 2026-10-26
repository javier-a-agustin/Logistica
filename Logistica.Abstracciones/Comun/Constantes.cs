namespace Logistica.Abstracciones.Comun
{
    // Deben coincidir con Roles.NombreRol en data.sql (se usan en [Authorize(Roles = ...)])
    public static class RolesSistema
    {
        public const string Recepcionista = "Recepcionista";
        public const string Despachante = "Despachante";
        public const string Chofer = "Chofer";
        public const string Gerente = "Gerente";
    }

    // Los Id coinciden con los datos semilla de la tabla EstadosPaquete en data.sql
    public static class EstadosPaquete
    {
        public const int EnDeposito = 1;
        public const int EnTransito = 2;
        public const int Entregado = 3;
        public const int Cancelado = 4;
    }

    // Los Id coinciden con los datos semilla de la tabla EstadosViaje en data.sql
    public static class EstadosViaje
    {
        public const int Programado = 1;
        public const int EnCurso = 2;
        public const int Finalizado = 3;
        public const int Cancelado = 4;
    }
}
