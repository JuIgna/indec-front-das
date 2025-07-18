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

export interface productosComparados {
    cod_barra: string,
    nom_producto: string,
    imagen: string,
    nro_supermercado: number,
    razon_social: string,
    mejor_precio: number
}