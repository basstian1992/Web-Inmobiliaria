const OLD_DOMAIN = 'https://fotos.propiedadesyparcelas.cl/';
const BASE_URL = 'https://propiedadesyparcelas.cl/fotos/';

export function normalizarUrlImagen(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith(OLD_DOMAIN)) {
    return url.replace(OLD_DOMAIN, BASE_URL);
  }
  return url;
}
