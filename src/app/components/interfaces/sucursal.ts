export interface SucursalInterface {
    nro_supermercado: number,
    nom_supermercado: string,
    nro_sucursal: number, 
    nom_sucursal: string,
    calle: string,
    nro_calle: string,
    telefonos: string,
    coord_latitud: string,
    coord_longitud: string,
    horario_sucursal: string,
    servicios_disponibles: string,
    nom_localidad: string,  
    nom_provincia: string,  
    nom_pais: string,      
    habilitada: boolean
}


// para cuando nos movemos entre pantallas
export interface filtrosSucursal {
    cod_pais: string,
    cod_provincia: string,
    nro_localidad: string | number,
    nro_supermercado: number | null
}
