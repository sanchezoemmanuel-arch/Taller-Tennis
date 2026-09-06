# Guía de Git paso a paso

La rúbrica pide "historial de commits que evidencie el proceso". Un solo commit
con todo el proyecto se ve exactamente igual que un proyecto descargado.

---

## Parte A · Preparar (una sola vez)

### A1. Verifica que Git esté instalado

```powershell
git --version
```

Si dice que no reconoce el comando, descárgalo de https://git-scm.com/download/win,
instálalo con las opciones por defecto y **cierra y vuelve a abrir PowerShell**.

### A2. Identifícate

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

Usa el mismo correo de tu cuenta de GitHub para que los commits te queden asignados.

### A3. Inicializa el repositorio

```powershell
cd C:\dev\breakpoint
git init
git branch -M main
```

### A4. Confirma que node_modules queda fuera

```powershell
git status
```

En la lista **no debe aparecer `node_modules/`**. Si aparece, el `.gitignore`
no se copió; verifica con `Test-Path C:\dev\breakpoint\.gitignore`.

---

## Parte B · Los 14 commits por fase

Pega **un bloque a la vez** y presiona Enter. No uses `git add .` todavía.

### Semana 1 — base, HTTP y CRUD remoto

```powershell
git add .gitignore package.json package-lock.json app.json babel.config.js metro.config.js tailwind.config.js global.css index.js
git commit -m "chore: proyecto Expo con NativeWind y configuracion base"
```

```powershell
git add src/constants/theme.js src/hooks/ src/components/ScreenContainer.js src/components/AppButton.js src/components/TextField.js src/components/ChipGroup.js src/components/Loading.js src/components/ErrorView.js src/components/EmptyState.js src/components/SectionCard.js src/components/CourtMark.js
git commit -m "feat(ui): sistema visual, tema claro/oscuro y componentes base"
```

```powershell
git add src/constants/config.js src/utils/errors.js src/services/httpClient.js
git commit -m "feat(http): cliente fetch con timeout y manejo de errores por codigo"
```

```powershell
git add src/constants/tennis.js src/utils/format.js src/utils/validation.js src/services/matchMapper.js src/services/matchesApi.js
git commit -m "feat(api): mapeo de DummyJSON al dominio de tenis y CRUD remoto"
```

### Semana 2 — autenticación y SQLite

```powershell
git add src/services/authService.js src/context/AuthContext.js src/screens/public/
git commit -m "feat(auth): login, token en SecureStore y restauracion de sesion"
```

```powershell
git add src/database/
git commit -m "feat(db): esquema SQLite y repositorio con consultas parametrizadas"
```

```powershell
git add src/context/ConnectivityContext.js src/components/OfflineBanner.js src/utils/prefs.js
git commit -m "feat(net): deteccion de conectividad con NetInfo y aviso visible"
```

```powershell
git add src/services/syncService.js src/components/SyncBadge.js
git commit -m "feat(sync): cola con estados pending, syncing, synced y failed"
```

```powershell
git add src/context/MatchesContext.js
git commit -m "feat(state): contexto global de partidos con useReducer"
```

### Semana 3 — pantallas, offline y entrega

```powershell
git add src/screens/matches/ src/components/MatchCard.js
git commit -m "feat(partidos): lista, detalle y formulario modal con escritura offline"
```

```powershell
git add src/screens/stats/ src/screens/rivals/ src/components/StatBar.js
git commit -m "feat(analisis): indicadores y perfiles de rival calculados con SQL"
```

```powershell
git add src/screens/drawer/
git commit -m "feat(drawer): configuracion, cola de sincronizacion y acerca de"
```

```powershell
git add App.js src/navigation/
git commit -m "feat(nav): navegacion anidada stack, tabs y drawer con flujo publico/privado"
```

```powershell
git add README.md GIT.md
git commit -m "docs: README con instalacion, endpoints, pruebas offline y estrategia de conflicto"
```

### Cierre: por si quedó algo suelto

```powershell
git add .
git status
```

Si `git status` muestra archivos preparados, ciérralos:

```powershell
git commit -m "chore: archivos restantes del proyecto"
```

Si dice `nothing to commit, working tree clean`, ya está todo.

### Revisa el historial

```powershell
git log --oneline
```

Debes ver los 14 commits, el más reciente arriba.

---

## Parte C · Subir a GitHub

### C1. Crea el repositorio

Entra a https://github.com/new

- **Repository name:** `breakpoint-tenis`
- **Public**
- **NO marques** "Add a README file", ni .gitignore, ni licencia.
- Clic en **Create repository**.

### C2. Conéctalo y sube

Reemplaza `TU-USUARIO` por tu usuario real:

```powershell
git remote add origin https://github.com/TU-USUARIO/breakpoint-tenis.git
git push -u origin main
```

La primera vez se abre una ventana del navegador para autorizar. Inicia sesión
y acepta.

### C3. Verifica

Abre `https://github.com/TU-USUARIO/breakpoint-tenis` y revisa que:

- Aparezcan los archivos y la carpeta `src/`
- **NO** aparezca `node_modules/`
- El README se vea formateado en la página principal
- La pestaña **Commits** muestre los 14

---

## Parte D · De aquí en adelante

Cada vez que cambies algo y lo pruebes:

```powershell
git add .
git commit -m "fix: descripcion de lo que corregiste"
git push
```

Los commits `fix:` son los que más valor tienen ante el evaluador, porque
demuestran que probaste la aplicación. No los inventes: escríbelos cuando algo
falle de verdad.

---

## Comandos de rescate

```powershell
git log --oneline              # ver el historial
git status                     # ver que cambio
git diff                       # ver el detalle de los cambios
git restore <archivo>          # descartar cambios de un archivo
git reset HEAD~1               # deshacer el ultimo commit y conservar los cambios
git commit --amend -m "..."    # corregir el mensaje del ultimo commit
git remote -v                  # ver a que repositorio apunta
```

Si te equivocaste en la URL del remoto:

```powershell
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/breakpoint-tenis.git
```
