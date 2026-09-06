import { PATRONES, LADOS_DEBILES, SUPERFICIES } from '../constants/tennis';

// DummyJSON no tiene un recurso de tenis, así que /posts se adapta al dominio.
// Los partidos creados desde la app viajan serializados dentro de "body" con este marcador.
const MARKER_START = '<<BP:v1>>';
const MARKER_END = '<</BP:v1>>';

const RIVALES = [
  'Andrés Mejía', 'Laura Restrepo', 'Camilo Vélez', 'Sofía Arango',
  'Julián Ospina', 'Valeria Cardona', 'Mateo Zapata', 'Daniela Ruiz',
  'Sebastián Gil', 'Paula Henao', 'Tomás Bedoya', 'Ana Betancur',
];

const TORNEOS = [
  'Liga Municipal · Cancha 3',
  'Copa Antioquia',
  'Circuito Aburrá',
  'Torneo Interclubes',
  'Nocturno de Envigado',
  'Ranking Departamental',
  'Copa Apertura',
  'Amistoso de entrenamiento',
  'Torneo de Belén',
  'Clasificatorio Regional',
];

const NOTAS = [
  'Arranqué dormido el primer set. Mejoré cuando empecé a variar alturas y a jugar más profundo.',
  'Me costó leer su segundo saque. Adelantarme dos pasos en la devolución cambió el partido.',
  'Aguanté bien el peloteo largo, pero perdí varios puntos por querer cerrar antes de tiempo.',
  'La cancha estaba lenta y eso me favoreció. Paciencia y altura fueron la clave.',
  'Se me fue el partido en los puntos importantes. Necesito trabajar el saque bajo presión.',
  'Buen día de derecha. Cada vez que abrí la cancha con el saque, el punto siguiente fue mío.',
  'Mucho viento en contra en el segundo set. Bajé el ritmo y funcionó.',
  'Empecé nervioso, pero el plan de atacar su revés funcionó desde el tercer game.',
  'Partido físico. Me faltó fondo en el tercer set y ahí se decidió todo.',
  'Cerré bien en la red. Cuando subí después del saque, gané casi todos los puntos.',
];

const SETS_GANADOS = ['6-4', '6-3', '7-5', '6-2', '7-6(5)', '6-1'];
const SETS_PERDIDOS = ['4-6', '3-6', '5-7', '2-6', '6-7(4)', '1-6'];

function hash(seed, mod) {
  const n = (Number(seed) || 1) * 2654435761;
  return Math.abs(Math.floor(n / 65536)) % mod;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// El marcador debe ser coherente con el resultado registrado.
function buildScore(id, gano) {
  const primero = gano ? SETS_GANADOS[hash(id + 31, 6)] : SETS_PERDIDOS[hash(id + 31, 6)];
  const segundo = gano ? SETS_GANADOS[hash(id + 37, 6)] : SETS_PERDIDOS[hash(id + 37, 6)];
  const intermedio = gano ? SETS_PERDIDOS[hash(id + 41, 6)] : SETS_GANADOS[hash(id + 41, 6)];
  const tresSets = hash(id + 43, 100) < 42;
  return tresSets ? `${primero} ${intermedio} ${segundo}` : `${primero} ${segundo}`;
}

export function toRemotePayload(match) {
  const meta = {
    rival: match.rival,
    torneo: match.torneo,
    superficie: match.superficie,
    fecha: match.fecha,
    resultado: match.resultado,
    marcador: match.marcador,
    primerSaquePct: Number(match.primerSaquePct) || 0,
    puntosGanadosSaque: Number(match.puntosGanadosSaque) || 0,
    winners: Number(match.winners) || 0,
    erroresNoForzados: Number(match.erroresNoForzados) || 0,
    patronRival: match.patronRival || '',
    ladoDebil: match.ladoDebil || '',
  };

  return {
    title: `${match.rival} · ${match.torneo}`,
    body: `${MARKER_START}${JSON.stringify(meta)}${MARKER_END}\n${match.notas || ''}`,
    userId: 1,
    tags: ['tenis', match.superficie, match.resultado],
  };
}

function parseMarker(body = '') {
  const start = body.indexOf(MARKER_START);
  const end = body.indexOf(MARKER_END);
  if (start === -1 || end === -1) return null;
  try {
    const json = body.slice(start + MARKER_START.length, end);
    const meta = JSON.parse(json);
    const notas = body.slice(end + MARKER_END.length).trim();
    return { meta, notas };
  } catch {
    return null;
  }
}

// Los posts genéricos de DummyJSON se traducen a partidos históricos en español,
// de forma determinista: el mismo post produce siempre el mismo partido.
// Los números se generan coherentes entre sí (un partido ganado suele tener
// más winners que errores y mejor porcentaje de primer saque).
function deriveFromPlainPost(post) {
  const id = Number(post.id) || 1;

  // Alrededor del 57% de victorias: un historial creíble, no un invicto.
  const gano = hash(id + 17, 100) < 57;

  const mes = String(hash(id + 11, 7) + 1).padStart(2, '0');
  const dia = String(hash(id, 28) + 1).padStart(2, '0');

  const base = hash(id + 6, 16) + 9;
  const winners = gano ? clamp(base + hash(id + 8, 11), 6, 60) : clamp(base - hash(id + 8, 5), 3, 40);
  const errores = gano ? clamp(base - hash(id + 9, 6), 3, 40) : clamp(base + hash(id + 10, 15), 8, 70);

  return {
    rival: RIVALES[hash(id, RIVALES.length)],
    torneo: TORNEOS[hash(id + 3, TORNEOS.length)],
    superficie: SUPERFICIES[hash(id + 5, SUPERFICIES.length)].value,
    fecha: `2026-${mes}-${dia}`,
    resultado: gano ? 'victoria' : 'derrota',
    marcador: buildScore(id, gano),
    primerSaquePct: gano ? clamp(56 + hash(id + 1, 25), 50, 84) : clamp(41 + hash(id + 1, 22), 34, 68),
    puntosGanadosSaque: gano ? clamp(54 + hash(id + 4, 26), 48, 82) : clamp(38 + hash(id + 4, 22), 30, 64),
    winners,
    erroresNoForzados: errores,
    patronRival: PATRONES[hash(id + 10, PATRONES.length)],
    ladoDebil: LADOS_DEBILES[hash(id + 12, LADOS_DEBILES.length)],
    notas: NOTAS[hash(id + 19, NOTAS.length)],
  };
}

export function fromRemotePost(post) {
  if (!post || post.id === undefined) return null;
  const parsed = parseMarker(String(post.body || ''));
  const base = parsed ? { ...parsed.meta, notas: parsed.notas } : deriveFromPlainPost(post);

  return {
    remoteId: String(post.id),
    rival: base.rival,
    torneo: base.torneo,
    superficie: base.superficie,
    fecha: base.fecha,
    resultado: base.resultado,
    marcador: base.marcador,
    primerSaquePct: Number(base.primerSaquePct) || 0,
    puntosGanadosSaque: Number(base.puntosGanadosSaque) || 0,
    winners: Number(base.winners) || 0,
    erroresNoForzados: Number(base.erroresNoForzados) || 0,
    patronRival: base.patronRival || '',
    ladoDebil: base.ladoDebil || '',
    notas: base.notas || '',
  };
}
