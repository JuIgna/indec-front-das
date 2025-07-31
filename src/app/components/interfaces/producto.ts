export interface Producto {
    cod_barra: string;
    desc_producto: string;
    imagen: string;
    nom_categoria: string;
    nom_marca: string;
    nom_producto: string;
    nom_rubro: string;
    nom_tipo_producto: string;
    nro_categoria: number;
    nro_marca: number;
    nro_rubro: number;
    nro_tipo_producto: number;
    vigente: string;
}

export interface EstadoProducto {
    precio?: number,
    precio_promocion?: number,
    estado: 'con_promocion' | 'con_precio' | 'sin_stock' | 'sin_precio' | 'sin_precio_actual';
    mensaje_tooltip: string;
}

export interface productosComparados {
    cod_barra: string,
    nom_producto: string,
    imagen?: string,
    nro_supermercado?: number,
    razon_social?: string,
    mejor_precio?: number,
    mejor_precio_promocion?: number, // nuevo
    fecha_fin_promocion?: string, // nuevo
    precios: { [supermercado: string]: EstadoProducto };
    // sin_stock?: {[key: string]: number}; // 1 si no hay stock, 0 si hay
    // sin_precio?: {[key: string]: number} // 1 si no hay precio, 0 si tiene
    // sin_precio_actual?: {[key: string]: number} // 1 si no tiene precio actual (dia de hoy) 0 si no
}