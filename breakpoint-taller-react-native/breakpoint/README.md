# BreakPoint · Bitácora táctica de tenis

Taller integrador React Native · Sesiones 5, 6 y 7
React Native con Expo · JavaScript · NativeWind

---

## 1. Objetivo

Permitir que un jugador de tenis amateur registre el desempeño de sus partidos durante el cambio de lado y construya automáticamente un perfil táctico de cada rival, funcionando sin conexión porque las canchas rara vez tienen buena señal.

En términos del taller: integrar navegación anidada, CRUD remoto con autenticación por token, persistencia estructurada en SQLite y sincronización offline básica dentro de una sola aplicación coherente.

---

## 2. Tema y problema que resuelve

Un jugador de tenis amateur no tiene equipo técnico, ni video del rival, ni estadísticas. Entra a la cancha sin saber nada de quien tiene enfrente y sale sin saber qué hizo bien.

**BreakPoint** convierte los 90 segundos del cambio de lado en datos. Durante el partido se registra el marcador, el porcentaje de primer saque, los winners, los errores no forzados, el patrón que el rival está repitiendo y su lado más débil. Al terminar, la app calcula la efectividad del jugador y arma automáticamente un **perfil de scouting por rival** que se puede consultar antes del siguiente cruce.

La decisión de diseño más importante: **las canchas casi nunca tienen buena señal**. Por eso la aplicación es local primero: todo se escribe en SQLite y el servidor solo actualiza esa copia cuando hay internet.

**Entidad principal:** `partido` (match). Una sola entidad, trabajada a fondo, como pide el taller.

---

## 3. Instalación y ejecución

### Requisitos
- Node.js 18 o superior
- Expo Go instalado en el teléfono (Android o iOS)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Si tu versión de Expo difiere de la del package.json,
#    deja que Expo alinee las versiones nativas:
npx expo install --fix

# 3. Arrancar el proyecto
npx expo start -c
```

Escanea el código QR con Expo Go. La bandera `-c` limpia la caché de Metro, necesaria la primera vez por la configuración de NativeWind.

> **Nota sobre Babel:** `babel-preset-expo` (SDK 50+) ya incluye automáticamente el plugin de Reanimated. Por eso `babel.config.js` no lo declara. Si usas un SDK anterior, agrega `plugins: ['react-native-reanimated/plugin']` al final del archivo.

### Instalación desde cero (si prefieres crear el proyecto tú mismo)

```bash
npx create-expo-app@latest breakpoint --template blank
cd breakpoint
npx expo install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs @react-navigation/drawer \
  react-native-screens react-native-safe-area-context \
  react-native-gesture-handler react-native-reanimated \
  expo-secure-store expo-sqlite @react-native-community/netinfo \
  @react-native-async-storage/async-storage
npm install nativewind tailwindcss
```
Después copia los archivos de este repositorio sobre el proyecto generado.

---

## 4. Dependencias y para qué se usa cada una

| Dependencia | Uso en el proyecto |
|---|---|
| `expo` / `react-native` | Base del proyecto, solo JavaScript |
| `@react-navigation/native-stack` | Flujo lista → detalle y pantallas modales |
| `@react-navigation/bottom-tabs` | Tres secciones principales |
| `@react-navigation/drawer` | Opciones secundarias y cierre de sesión |
| `nativewind` + `tailwindcss` | Estilos por clases, combinados con StyleSheet nativo |
| `fetch` (API nativa) | Todo el HTTP. **No se usa Axios** |
| Context API + `useReducer` | Estado global de sesión, conectividad y partidos |
| `expo-secure-store` | Almacenamiento seguro del token de sesión |
| `expo-sqlite` | Persistencia estructurada de los partidos |
| `@react-native-community/netinfo` | Detección de conectividad |
| `@react-native-async-storage/async-storage` | **Solo** preferencias simples: filtros de la lista y fecha de última sincronización |

**No se usa:** TypeScript, archivos `.ts`/`.tsx`, Expo Router, Axios, Redux, Zustand, Firebase ni Supabase.

---

## 5. API y endpoints

Se usa **DummyJSON**, adaptando el recurso `/posts` al dominio del tenis, tal como permite el enunciado.

| Operación | Método | Endpoint |
|---|---|---|
| Colección de partidos | GET | `https://dummyjson.com/posts?limit=24&skip=0` |
| Detalle de un partido | GET | `https://dummyjson.com/posts/{id}` |
| Crear partido | POST | `https://dummyjson.com/posts/add` |
| Editar partido | PATCH | `https://dummyjson.com/posts/{id}` |
| Eliminar partido | DELETE | `https://dummyjson.com/posts/{id}` |
| Login | POST | `https://dummyjson.com/auth/login` |
| Usuario autenticado | GET | `https://dummyjson.com/auth/me` (con `Authorization: Bearer <token>`) |

### Cómo se adapta `/posts` a un partido de tenis

`src/services/matchMapper.js` hace la traducción en los dos sentidos:

- **Al enviar** (`toRemotePayload`): el partido se serializa como JSON dentro del campo `body`, delimitado por el marcador `<<BP:v1>>…<</BP:v1>>`. El `title` queda como `Rival · Torneo` y los `tags` guardan superficie y resultado.
- **Al recibir** (`fromRemotePost`): si el post trae el marcador, se lee el partido tal cual. Si es uno de los posts genéricos de DummyJSON (que vienen en inglés y sin relación con el tenis), se deriva un partido **en español y determinista** a partir del `id`: el mismo post produce siempre el mismo partido. La generación mantiene coherencia interna: el marcador corresponde al resultado, y un partido ganado tiende a tener mejor porcentaje de primer saque y más winners que errores. La distribución queda alrededor del 55% de victorias y los rivales se repiten dos o tres veces, que es lo que hace útil el perfil de scouting.

### Escrituras simuladas

DummyJSON **simula** las escrituras: `POST /posts/add` responde `201` con `id: 252`, pero ese recurso no se guarda realmente. La aplicación procesa la respuesta correctamente y marca el registro como `remote_simulated`. Si más adelante un `PATCH` o `DELETE` sobre ese id responde `404`, la app lo interpreta como escritura simulada, conserva la copia local y lo deja en estado `synced` con una nota explicativa, en lugar de reportar un fallo falso. Cualquier otro `404` sí se trata como error real.

---

## 6. Credenciales de prueba

| Campo | Valor |
|---|---|
| Usuario | `emilys` |
| Contraseña | `emilyspass` |

Vienen precargadas en la pantalla de login. Cualquier otro usuario válido de `https://dummyjson.com/users` también funciona.

---

## 7. Estructura del proyecto

```
breakpoint/
├── App.js                     Proveedores globales y tema del sistema
├── index.js                   Punto de entrada (importa gesture-handler primero)
├── babel.config.js            Preset de Expo + NativeWind
├── metro.config.js            withNativeWind
├── tailwind.config.js         Tokens de color del proyecto
├── global.css                 Directivas de Tailwind
└── src/
    ├── components/            Componentes visuales reutilizables
    │   ├── AppButton.js       Botón con estados de carga y accesibilidad
    │   ├── ChipGroup.js       Selector de opciones (role="radio")
    │   ├── EmptyState.js      Pantallas vacías con acción
    │   ├── ErrorView.js       Error + botón de reintento
    │   ├── Loading.js         Indicador de carga
    │   ├── MatchCard.js       Tarjeta de partido
    │   ├── OfflineBanner.js   Aviso permanente de "sin conexión"
    │   ├── ScreenContainer.js Contenedor con fondo del tema
    │   ├── SectionCard.js     Bloque de contenido
    │   ├── StatBar.js         Barra de estadística (StyleSheet nativo)
    │   ├── SyncBadge.js       pending / syncing / synced / failed
    │   └── TextField.js       Campo con etiqueta, error y pista
    ├── constants/
    │   ├── config.js          URL base, endpoints, claves de almacenamiento
    │   ├── tennis.js          Superficies, resultados, patrones, estados
    │   └── theme.js           Paletas clara y oscura
    ├── context/
    │   ├── AuthContext.js     Sesión, login, restauración y logout
    │   ├── ConnectivityContext.js  NetInfo
    │   └── MatchesContext.js  Estado global de partidos (useReducer)
    ├── database/
    │   ├── db.js              Conexión e inicialización de SQLite
    │   └── matchesRepository.js  TODO el SQL vive aquí
    ├── hooks/
    │   └── useAppTheme.js     useColorScheme + paleta
    ├── navigation/
    │   ├── RootNavigator.js   Público / privado + modales
    │   ├── DrawerNavigator.js Drawer con logout
    │   ├── TabsNavigator.js   Tres secciones
    │   ├── MatchesStack.js    Lista → detalle
    │   ├── StatsStack.js
    │   └── RivalsStack.js     Lista → detalle
    ├── screens/
    │   ├── public/            SplashScreen, LoginScreen, HowItWorksScreen
    │   ├── matches/           Lista, detalle y formulario
    │   ├── stats/             Análisis
    │   ├── rivals/            Perfiles e historial
    │   └── drawer/            Configuración y Acerca de
    ├── services/
    │   ├── httpClient.js      fetch con timeout, response.ok y errores
    │   ├── matchesApi.js      CRUD remoto
    │   ├── matchMapper.js     Adaptación DummyJSON ↔ tenis
    │   ├── authService.js     Login y SecureStore
    │   └── syncService.js     Cola de sincronización
    └── utils/
        ├── errors.js          HttpError, NetworkError y mensajes por código
        ├── format.js          Fechas y porcentajes
        ├── prefs.js           AsyncStorage (solo preferencias)
        └── validation.js      Validación de formularios
```

---

## 8. Navegación

```
RootStack (público / privado según el estado de autenticación)
│
├── NO autenticado
│   ├── Login
│   └── [modal] Cómo funciona
│
└── Autenticado
    ├── Drawer
    │   ├── Inicio → Bottom Tabs
    │   │   ├── Partidos → Stack → Lista → Detalle
    │   │   ├── Análisis → Stack → Indicadores
    │   │   └── Rivales  → Stack → Lista → Detalle del rival
    │   ├── Configuración
    │   └── Acerca de  (+ botón Cerrar sesión)
    │
    └── [modal] Formulario de partido (crear / editar)
```

El cambio entre el flujo público y el privado depende **solo** del estado de `AuthContext`; nunca se navega manualmente pantalla por pantalla.

- **`useFocusEffect`**: en la lista de partidos, en el detalle, en Análisis, en Rivales y en Configuración, para releer SQLite al volver a la pantalla y reflejar los cambios locales sin recargar la app.
- **`BackHandler`**: en el formulario, para que el botón físico de Android no descarte datos sin confirmar.

---

## 9. Interfaz adaptable y accesibilidad

- **`useWindowDimensions`**: con ancho ≥ 700 px la lista de partidos y la de rivales pasan a dos columnas, el formulario acomoda campos en pareja y el panel de indicadores muestra cuatro tarjetas por fila en lugar de dos. Se ve girando el teléfono o en tablet.
- **`useColorScheme`**: `useAppTheme()` entrega la paleta clara u oscura, aplicada a fondos, textos, bordes, barra de estado y tema de React Navigation.
- **Accesibilidad**: `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` y `accessibilityState` en botones, tarjetas, chips, campos y pestañas. El aviso offline usa `role="alert"` con `accessibilityLiveRegion`. Las zonas táctiles tienen mínimo 40–48 px de alto.

---

## 10. CRUD remoto y manejo HTTP

- **GET** colección y **GET** detalle (botón "Verificar en el servidor").
- **POST** al crear, **PATCH** al editar, **DELETE** al eliminar.
- **Estados independientes por operación** en `MatchesContext`: `loadingInitial`, `refreshing`, `creating`, `updating`, `deletingId` y `syncing`, cada uno con su propio error.
- La acción en curso **deshabilita su botón** (`disabled` + `accessibilityState.busy`) para evitar solicitudes duplicadas.
- `httpClient.js` verifica siempre `response.ok` y traduce el código a un mensaje entendible: **400** datos inválidos, **401** sesión expirada, **403** sin permisos, **404** recurso no disponible, **409** conflicto, **422** campos faltantes, **429** demasiadas solicitudes, **500/502/503** problema del servidor. Hay timeout de 12 s vía `AbortController`.
- **Reintento**: `ErrorView` muestra el botón "Reintentar consulta" en la lista y en el detalle; Configuración permite reintentar la cola completa.
- Los formularios de creación y edición validan rival, torneo, fecha (`AAAA-MM-DD`), marcador (formato `6-4 3-6 7-5`), superficie, resultado y rangos numéricos.

---

## 11. Autenticación y sesión

1. `POST /auth/login` con usuario y contraseña devuelve el token.
2. El token se guarda con **expo-secure-store** (nunca en AsyncStorage).
3. Al abrir la app, `AuthContext` **restaura la sesión**: lee el token y lo valida con `GET /auth/me` enviando `Authorization: Bearer <token>`.
   - Si responde **401/403**, borra la credencial y vuelve al flujo público.
   - Si **no hay internet**, mantiene la sesión con el usuario guardado y abre en modo offline (Configuración lo indica).
4. **Cerrar sesión** borra el token y el usuario de SecureStore y regresa al login. Los partidos guardados en SQLite se conservan.

---

## 12. Persistencia local y funcionamiento offline

### 12.1 SQLite

Tabla `matches` con clave primaria local `id` (autoincremental) separada del `remote_id` de la API:

```sql
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remote_id TEXT,
  owner TEXT NOT NULL,
  rival TEXT NOT NULL,
  torneo TEXT NOT NULL,
  superficie TEXT NOT NULL,
  fecha TEXT NOT NULL,
  resultado TEXT NOT NULL,
  marcador TEXT NOT NULL DEFAULT '',
  primer_saque_pct INTEGER NOT NULL DEFAULT 0,
  puntos_ganados_saque INTEGER NOT NULL DEFAULT 0,
  winners INTEGER NOT NULL DEFAULT 0,
  errores_no_forzados INTEGER NOT NULL DEFAULT 0,
  patron_rival TEXT NOT NULL DEFAULT '',
  lado_debil TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  sync_status TEXT NOT NULL DEFAULT 'synced',
  pending_action TEXT,
  remote_simulated INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);
```

- Todo el SQL vive en `src/database/matchesRepository.js`, separado de las pantallas.
- CRUD local completo: `insertMatch`, `listMatches`, `getMatchById`, `updateMatch`, `hardDeleteMatch`.
- **Todas las consultas usan parámetros `?`**. Nunca se concatenan datos del usuario dentro del SQL: en `listMatches` solo se compone la estructura del `WHERE` (los nombres de columna y los `?`), y los valores viajan siempre en el arreglo de parámetros.
- El análisis y los perfiles de rival se calculan con SQL (`GROUP BY`, `AVG`, `SUM`), así que funcionan sin internet.

### 12.2 Estrategia local primero

```
Abrir pantalla
 -> leer SQLite
 -> mostrar datos locales inmediatamente
 -> si hay conexión:
      consultar la API
      actualizar SQLite (upsert por remote_id)
      refrescar la interfaz
```

Implementado en `MatchesContext.bootstrap()`. La sincronización **nunca borra** filas locales que no vengan del servidor, porque las escrituras de DummyJSON son simuladas y no persisten.

### 12.3 Comportamiento offline

- **NetInfo** detecta la conectividad en `ConnectivityContext`.
- Aviso visible y permanente en la parte inferior cuando no hay conexión, con el número de operaciones pendientes.
- Los datos guardados siguen siendo consultables: lista, detalle, análisis y perfiles de rival funcionan completos sin internet.
- **Escrituras offline**: se soportan **crear** y **editar** (y también eliminar, que va más allá de lo exigido). La operación queda con `sync_status = 'pending'` y `pending_action = 'create' | 'update' | 'delete'`.
- **Al recuperar la conexión**, un `useEffect` detecta la transición offline → online y dispara la sincronización automáticamente. Además hay reintento manual desde la lista y desde Configuración.
- **Estados representados**: `pending`, `syncing`, `synced` y `failed`, visibles en el `SyncBadge` de cada tarjeta, en el detalle y en la cola de Configuración.

---

## 13. Estrategia de conflicto

**Gana el servidor, salvo que el registro local tenga cambios sin sincronizar.**

Cuando la sincronización trae un partido desde la API, `upsertFromRemote` revisa la fila local:

1. Si no existe localmente → se inserta como `synced`.
2. Si existe y **no** tiene `pending_action` → se sobrescribe con la versión del servidor (gana el servidor).
3. Si existe y **sí** tiene `pending_action` → se **omite** la actualización remota y se conserva la versión local hasta que la cola se envíe (gana el cliente).

**Por qué esta estrategia y no otra:**
- *Gana el servidor siempre* haría perder lo que el jugador anotó en la cancha, que es justo el dato que la app existe para capturar.
- *Gana el cliente siempre* dejaría la copia local desactualizada indefinidamente.
- *Gana el más reciente* exigiría relojes confiables en ambos lados y DummyJSON no expone `updatedAt`.
- *Preguntar al usuario* sería la opción más correcta para un producto real; en un registro deportivo personal, donde el único autor es el propio jugador, interrumpirlo con un diálogo de conflicto es más costoso que útil.

Para escalar a producción, el siguiente paso sería que el servidor expusiera una versión o `ETag` por registro y resolver con "gana el más reciente" comparando marcas de tiempo del servidor, dejando el diálogo al usuario únicamente cuando ambos lados cambiaron campos distintos.

---

## 14. Cómo probar el proyecto

### Flujo básico
1. Abre la app y toca **¿Cómo funciona BreakPoint?** (pantalla modal del flujo público).
2. Inicia sesión con `emilys` / `emilyspass`.
3. La lista carga primero desde SQLite y luego se actualiza desde la API.
4. Entra a un partido → **Detalle** (Stack). Prueba **Verificar en el servidor** (GET de detalle).
5. Toca **+** → formulario **modal** → registra un partido (POST).
6. Edita ese partido (PATCH) y elimina otro (DELETE).
7. Gira el teléfono o ábrela en tablet para ver el cambio a dos columnas.
8. Cambia el tema del sistema a oscuro y verifica la adaptación.
9. Abre el **Drawer** desde el borde izquierdo → Configuración, Acerca de y Cerrar sesión.

### Prueba offline (la parte importante)

1. Con la app abierta y sesión iniciada, **activa el modo avión**.
2. Aparece el aviso inferior **"Sin conexión · Estás viendo tus datos guardados"**.
3. Navega por la lista, el detalle, Análisis y Rivales: **todo sigue funcionando** porque se lee de SQLite.
4. Toca **+** y registra un partido nuevo. Al guardar, la app avisa que quedó pendiente.
5. La tarjeta muestra el badge **Pendiente** y la pestaña Partidos muestra un contador.
6. Edita ese partido u otro: también queda pendiente.
7. Ve al **Drawer → Configuración** y revisa la **cola de sincronización**.
8. **Desactiva el modo avión**. Al recuperar la conexión la sincronización arranca sola: los badges pasan por **Sincronizando** y terminan en **Sincronizado**.
9. Si algo falla, el registro queda en **Falló** con el mensaje del servidor y se puede reintentar desde Configuración o desde la lista.

### Probar la restauración de sesión
Cierra la app por completo y vuelve a abrirla: entra directo al flujo privado sin pedir credenciales. Con modo avión activo también abre, en modo offline.

---

## 15. Video de demostración

Duración máxima: 5 minutos. Guion sugerido:

| Tiempo | Contenido |
|---|---|
| 0:00–0:30 | Login, token guardado y entrada al flujo privado |
| 0:30–1:15 | Navegación: Tabs, Stack lista → detalle, Drawer y modal |
| 1:15–2:15 | CRUD remoto: crear, editar y eliminar con sus estados de carga |
| 2:15–2:45 | Adaptabilidad (rotación) y modo oscuro |
| 2:45–3:15 | Datos locales en SQLite: Análisis y perfiles de rival |
| 3:15–4:30 | Modo avión: aviso, consulta offline, escritura pendiente |
| 4:30–5:00 | Recuperar conexión, sincronización automática y logout |

---

## 16. Checklist del taller

- [x] React Native con Expo y JavaScript
- [x] Sin archivos `.ts` ni `.tsx`
- [x] Sin Expo Router, Axios ni Redux
- [x] Stack + Bottom Tabs + Drawer con navegación pública/privada
- [x] Tres secciones principales y pantalla de detalle
- [x] Pantalla modal + `useFocusEffect` + `BackHandler`
- [x] `useWindowDimensions`, accesibilidad básica y `useColorScheme`
- [x] GET, POST, PATCH y DELETE sobre la entidad principal
- [x] Estados independientes por operación y manejo de errores HTTP
- [x] Sesión guardada y restaurada con SecureStore
- [x] SQLite con repositorio separado y CRUD local
- [x] Datos locales consultables sin internet
- [x] NetInfo detectando conectividad
- [x] Creación y edición offline
- [x] Operación pendiente con reintento al recuperar conexión
- [x] Estrategia de conflicto y pruebas documentadas en este README
- [x] Guion de video de máximo 5 minutos
