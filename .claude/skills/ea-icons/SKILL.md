---
name: ea-icons
description: Crea íconos SVG con estilo flat geométrico para el proyecto Entrenamiento Auditivo. Usar cuando el usuario pida íconos, ilustraciones SVG, o gráficos para la app de música. Activa cuando mencione "ícono", "SVG", "ilustración", o cuando trabajes en componentes que necesiten íconos musicales.
---

# EA Icons

Skill para crear íconos SVG con estilo flat geométrico adaptados al proyecto Entrenamiento Auditivo (música latina).

## Estilo Visual

> **IMPORTANTE:** Antes de diseñar cualquier ícono, revisa las imágenes de referencia en `.claude/skills/ea-icons/references/` para entender el estilo visual exacto que buscamos. Usa la herramienta Read para ver cada imagen.

### Principios clave

1. **Formas geométricas limpias** — Rectángulos, círculos, líneas definidas
2. **Sin degradados** — Colores planos y sólidos únicamente
3. **Paleta limitada** — 4-5 colores máximo por ícono
4. **Contornos selectivos** — Líneas finas del color navy para definir detalles
5. **Composición con capas** — Elementos superpuestos crean profundidad
6. **Estilo "flat design"** — Sin sombras, sin 3D, todo bidimensional

### Paleta de colores (del proyecto)

```
Terracota/Naranja:  #D97A4A (primary - acentos principales, elementos destacados)
Púrpura vibrante:   #A855C8 (accent - elementos secundarios llamativos)
Verde esmeralda:    #34A06B (success - naturaleza, elementos positivos)
Rojo coral:         #D9534A (destructive - alertas, énfasis dramático)
Dorado/Ámbar:       #CBA054 (chart-4 - detalles cálidos, brillo)
Navy oscuro:        #1E2333 (foreground - contornos, profundidad, detalles)
Blanco hueso:       #F9F9FB (background - espacios, contraste, fondos claros)
```

### Uso de colores por contexto musical

- **Terracota** → Instrumentos de percusión, ritmo, elementos latinos cálidos
- **Púrpura** → Notas musicales, melodía, elementos de escucha/audio
- **Verde** → Éxito, respuesta correcta, progreso
- **Rojo coral** → Error, pausa, elementos dramáticos
- **Dorado** → Trofeos, logros, elementos premium
- **Navy** → Contornos, texto en íconos, profundidad

## Proceso de Creación

1. **Simplificar** — Reducir el concepto musical a formas geométricas básicas
2. **Construir** — Apilar rectángulos, círculos, paths simples
3. **Detallar** — Agregar líneas finas navy para definición
4. **Color** — Aplicar 3-4 colores máximo con buen contraste

## Técnicas SVG

### Formas base (preferir primitivas)
```svg
<!-- Rectángulos con esquinas redondeadas -->
<rect x="10" y="10" width="40" height="30" rx="4" fill="#D97A4A"/>

<!-- Círculos para notas, botones -->
<circle cx="32" cy="32" r="8" fill="#A855C8"/>

<!-- Líneas para pentagramas, detalles -->
<line x1="10" y1="30" x2="50" y2="30" stroke="#1E2333" stroke-width="1.5"/>
```

### Paths simples para formas custom
```svg
<!-- Triángulos, formas angulares -->
<path d="M10,40 L30,20 L50,40 Z" fill="#34A06B"/>

<!-- Arcos para instrumentos curvos -->
<path d="M10,30 Q30,10 50,30" fill="none" stroke="#1E2333" stroke-width="2"/>
```

### Estructura base de ícono
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo opcional (usar solo si necesario) -->
  <rect width="64" height="64" fill="#D97A4A" rx="12"/>

  <!-- Elementos de atrás hacia adelante -->
  <!-- Forma principal primero -->
  <!-- Detalles y líneas al final -->
</svg>
```

## Ejemplos Musicales

### Ícono de Nota Musical
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Cabeza de nota -->
  <ellipse cx="20" cy="44" rx="10" ry="7" fill="#A855C8" transform="rotate(-20 20 44)"/>

  <!-- Plica (línea vertical) -->
  <rect x="28" y="12" width="3" height="35" fill="#1E2333"/>

  <!-- Corchete -->
  <path d="M31,12 Q45,18 40,28" fill="none" stroke="#1E2333" stroke-width="3" stroke-linecap="round"/>
</svg>
```

### Ícono de Audífonos
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Banda superior -->
  <path d="M14,32 Q14,12 32,12 Q50,12 50,32"
        fill="none" stroke="#1E2333" stroke-width="5" stroke-linecap="round"/>

  <!-- Auricular izquierdo -->
  <rect x="8" y="30" width="14" height="22" rx="4" fill="#D97A4A"/>
  <rect x="10" y="34" width="10" height="14" rx="2" fill="#1E2333"/>

  <!-- Auricular derecho -->
  <rect x="42" y="30" width="14" height="22" rx="4" fill="#D97A4A"/>
  <rect x="44" y="34" width="10" height="14" rx="2" fill="#1E2333"/>
</svg>
```

### Ícono de Conga/Tambor
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Cuerpo del tambor -->
  <path d="M16,20 L12,52 Q12,56 32,56 Q52,56 52,52 L48,20 Z" fill="#D97A4A"/>

  <!-- Parche superior -->
  <ellipse cx="32" cy="20" rx="18" ry="6" fill="#F9F9FB"/>
  <ellipse cx="32" cy="20" rx="18" ry="6" fill="none" stroke="#1E2333" stroke-width="2"/>

  <!-- Aros decorativos -->
  <ellipse cx="32" cy="32" rx="16" ry="3" fill="none" stroke="#CBA054" stroke-width="2"/>
  <ellipse cx="32" cy="44" rx="14" ry="2.5" fill="none" stroke="#CBA054" stroke-width="2"/>
</svg>
```

### Ícono de Play/Reproducir
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Círculo de fondo -->
  <circle cx="32" cy="32" r="28" fill="#34A06B"/>

  <!-- Triángulo de play -->
  <path d="M26,20 L26,44 L46,32 Z" fill="#F9F9FB"/>
</svg>
```

### Ícono de Teclado/Piano
```svg
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Base del teclado -->
  <rect x="4" y="20" width="56" height="32" rx="2" fill="#F9F9FB" stroke="#1E2333" stroke-width="2"/>

  <!-- Teclas blancas (separadores) -->
  <line x1="12" y1="20" x2="12" y2="52" stroke="#1E2333" stroke-width="1"/>
  <line x1="20" y1="20" x2="20" y2="52" stroke="#1E2333" stroke-width="1"/>
  <line x1="28" y1="20" x2="28" y2="52" stroke="#1E2333" stroke-width="1"/>
  <line x1="36" y1="20" x2="36" y2="52" stroke="#1E2333" stroke-width="1"/>
  <line x1="44" y1="20" x2="44" y2="52" stroke="#1E2333" stroke-width="1"/>
  <line x1="52" y1="20" x2="52" y2="52" stroke="#1E2333" stroke-width="1"/>

  <!-- Teclas negras -->
  <rect x="9" y="20" width="6" height="20" rx="1" fill="#1E2333"/>
  <rect x="17" y="20" width="6" height="20" rx="1" fill="#1E2333"/>
  <rect x="33" y="20" width="6" height="20" rx="1" fill="#1E2333"/>
  <rect x="41" y="20" width="6" height="20" rx="1" fill="#1E2333"/>
  <rect x="49" y="20" width="6" height="20" rx="1" fill="#1E2333"/>
</svg>
```

## Qué NO hacer

- Formas orgánicas o curvas complejas tipo "blob"
- Gradientes, sombras o efectos 3D
- Más de 5 colores por ícono
- Texturas o patterns complejos
- Proporciones exageradas o distorsionadas
- Contornos gruesos en todo (usar selectivamente)
- Íconos muy pequeños con demasiado detalle
- Mezclar estilos (flat con realista)

## Contexto del Proyecto

El proyecto **Entrenamiento Auditivo (ea)** es una app para enseñar teoría musical latina:
- **Géneros:** Salsa, Rock en español, Cumbia, Vallenato, Bambuco
- **Ejercicios:** Progresiones de acordes, patrones rítmicos, dictado melódico
- **Tono visual:** Cálido, vibrante, latino pero moderno y limpio

Los íconos deben reflejar esta identidad musical y cultural mientras mantienen la simplicidad del estilo flat geométrico.
