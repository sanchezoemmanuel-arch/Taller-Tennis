import { SUPERFICIES, RESULTADOS } from '../constants/tennis';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SCORE_RE = /^[0-9]{1,2}-[0-9]{1,2}(\([0-9]{1,2}\))?( [0-9]{1,2}-[0-9]{1,2}(\([0-9]{1,2}\))?)*$/;

function numberField(errors, values, key, message, { min = 0, max = 999 } = {}) {
  const raw = String(values[key] ?? '').trim();
  if (raw === '') {
    errors[key] = message;
    return;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    errors[key] = `Escribe un número entre ${min} y ${max}.`;
  }
}

export function validateMatch(values) {
  const errors = {};

  if (!String(values.rival ?? '').trim()) {
    errors.rival = 'Escribe contra quién jugaste.';
  } else if (String(values.rival).trim().length < 3) {
    errors.rival = 'El nombre del rival necesita al menos 3 caracteres.';
  }

  if (!String(values.torneo ?? '').trim()) {
    errors.torneo = 'Indica el torneo, liga o cancha.';
  }

  if (!DATE_RE.test(String(values.fecha ?? '').trim())) {
    errors.fecha = 'Usa el formato AAAA-MM-DD, por ejemplo 2026-03-14.';
  }

  if (!SUPERFICIES.some((s) => s.value === values.superficie)) {
    errors.superficie = 'Elige una superficie.';
  }

  if (!RESULTADOS.some((r) => r.value === values.resultado)) {
    errors.resultado = 'Marca si ganaste o perdiste.';
  }

  const marcador = String(values.marcador ?? '').trim();
  if (!marcador) {
    errors.marcador = 'Registra el marcador, por ejemplo 6-4 3-6 7-5.';
  } else if (!SCORE_RE.test(marcador)) {
    errors.marcador = 'Formato de marcador inválido. Usa 6-4 3-6 7-5.';
  }

  numberField(errors, values, 'primerSaquePct', 'Registra el % de primeros saques.', { min: 0, max: 100 });
  numberField(errors, values, 'puntosGanadosSaque', 'Registra el % de puntos ganados con saque.', { min: 0, max: 100 });
  numberField(errors, values, 'winners', 'Registra cuántos winners hiciste.', { min: 0, max: 300 });
  numberField(errors, values, 'erroresNoForzados', 'Registra los errores no forzados.', { min: 0, max: 300 });

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
