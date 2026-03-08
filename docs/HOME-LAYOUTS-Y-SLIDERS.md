# Inventario: Sliders y layouts públicos (Home)

## Sliders actuales (2)

| # | Componente | Ubicación | Contenido |
|---|------------|-----------|-----------|
| 1 | **Carousel** | `components/ui/Carousel.tsx` | Hero principal: 3 slides estáticos (imagen + título + descripción + CTA). Auto-avance 5s, flechas, dots. |
| 2 | **DealOfTheDaySlider** | `components/home/DealOfTheDaySlider.tsx` | Ofertas del día: productos elegidos por admin. Un producto por slide (imagen 50% + texto 50%). Auto-avance 4s. |

## Layouts públicos (home)

- **Un solo layout de home:** `app/page.tsx`
  - Estructura actual: **Hero Carousel** → **Deal of the day (slider)** → **Featured (grid 2–4 columnas)** → **New Arrivals (grid 2–4 columnas)**.
  - Todo dentro de `container mx-auto`; las secciones de productos son **grids uniformes** (productos en divs/cards simples).

## Objetivo

- Aumentar el **impacto visual** y la **variedad** para que la pantalla sea moderna y creativa.
- Evitar que todo sea “producto en un div”; usar **diferentes layouts** (bento, strips, scroll horizontal, full-bleed) y **efectos** (hover, gradientes, animaciones suaves) para invitar a explorar.

## Mejoras aplicadas (resumen)

- Hero: gradiente overlay, tipografía más marcada, botón con hover claro.
- Ofertas del día: sección full-bleed con badge “Oferta”, slider más destacado.
- Featured: layout tipo **bento** (1 producto destacado grande + 3 pequeños) y cards con hover (lift + sombra).
- Strip **“Explorar” / CTA** entre secciones (envío, devoluciones, etc.) para romper la monotonía.
- New Arrivals: **scroll horizontal** con snap en móvil; grid en desktop; misma ProductCard mejorada.
- ProductCard: hover con **elevación**, **sombra** y ligero scale en imagen para llamar la atención.
