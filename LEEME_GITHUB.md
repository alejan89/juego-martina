# Aventuras Mágicas — Alicia Felicia y la Princesa Martina

**Sitio infantil con lector de cuentos y dos juegos interactivos, listo para publicar en GitHub Pages.**

Esta es la versión ampliada del proyecto anterior: conserva el juego de colorear y el rescate de la ardillita, e incorpora una tercera pestaña para leer el cuento original.

## Las tres pestañas

1. **📖 Leé el cuento.** Lector interactivo con las **21 ilustraciones originales** del PDF: portada y veinte láminas a doble página. En computadora se muestra cada lámina completa, y en celulares se divide en dos páginas sucesivas para que las letras se puedan leer con mayor comodidad (40 páginas interiores). Las hojas cambian con un toque o clic y una animación de página. Incluye botones Anterior/Siguiente, flechas del teclado, navegación por capítulos, indicador de lectura, opción de pantalla completa y recuerdo del punto donde se dejó el libro en ese navegador.
2. **🎨 Coloreá el cuento.** Cuatro personajes para pintar (Alicia, Martina, dragón y ardillita); 18 colores; pintar tocando zonas, deshacer, recomenzar, colores mágicos y guardar en PNG. El avance se guarda localmente.
3. **🐉 ¡Salvá a la ardillita!** Mové a Alicia, recogé tres estrellas, evitá las llamas del dragón y llegá a la ardillita. Incluye tres vidas, reinicio, pausa, controles de teclado y controles táctiles.

## Música y sonidos

- El **lector** incluye **cinco pistas instrumentales originales**, compuestas por computadora para este proyecto: bosque mágico, cueva misteriosa, dragón, castillo y final feliz.
- La música cambia automáticamente según el momento de la historia, se repite suavemente dentro de cada tramo y se detiene al salir de la pestaña de lectura.
- En el lector hay un botón para pausar/reanudar la música. También se respeta el interruptor general de sonido del sitio.
- Los minijuegos tienen sus propios efectos sonoros sintetizados mediante Web Audio.
- **Importante:** por seguridad, los navegadores bloquean el audio automático hasta que el visitante haga un clic o toque. Por eso la música comienza al entrar a «Leé el cuento» (o al tocar «Música activada» si el navegador la bloquea inicialmente).
- La música es instrumental, **no** es la narración del audiolibro MP3.

## Subir la versión a GitHub Pages

**No subas directamente el ZIP a GitHub:** primero descomprimilo. La raíz del repositorio debe contener `index.html`.

### Si ya publicaste el juego anterior

1. Descargá y descomprimí `Aventuras_Magicas_Alicia_Martina_CON_LIBRO_GitHub.zip`.
2. Abrí el repositorio en GitHub, con tu cuenta habitual.
3. Entrá en **Add file → Upload files** y arrastrá **todo el contenido** de la carpeta descomprimida: `index.html`, `styles.css`, `app.js`, `LEEME_GITHUB.md` y la carpeta `assets` con **todas sus subcarpetas**. Si GitHub indica que ya existen archivos con esos nombres, el nuevo envío debe reemplazarlos con la versión actualizada.
4. Confirmá con **Commit changes**.
5. Esperá a que termine la publicación en **Actions** o consultá el sitio en **Settings → Pages**. Si ves la página vieja, hacé una recarga forzada (Ctrl+F5) o probá una pestaña de incógnito.

**¡Importante!** Las nuevas carpetas `assets/libro/` y `assets/musica/` son necesarias para que funcionen las ilustraciones y las pistas musicales. Si se omiten, el lector no funcionará correctamente.

### Si es un repositorio nuevo

1. Creá un repositorio público en https://github.com.
2. Subí todos los archivos descomprimidos preservando la estructura y confirmá los cambios.
3. En **Settings → Pages**, seleccioná **Deploy from a branch** > rama `main` > carpeta `/(root)` y guardá.
4. GitHub Pages publicará la web en una dirección similar a `https://USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Estructura de la entrega

```text
index.html
styles.css
app.js
LEEME_GITHUB.md
assets/
  favicon.svg
  portada.webp
  bosque.webp
  alicia.webp
  martina.webp
  dragon.webp
  ardilla.webp
  castillo.webp
  libro/
    pagina_01.webp
    ...
    pagina_21.webp
  musica/
    bosque.mp3
    cueva.mp3
    dragon.mp3
    castillo.mp3
    final.mp3
```

## Requisitos y derechos

- Funciona como web estática: **no necesita servidor de aplicaciones ni base de datos**. Compatible con navegadores actuales y GitHub Pages.
- Sin anuncios, sin seguimiento; el progreso y las preferencias se guardan solo en el navegador de cada familia.
- Puede usarse desde dispositivos móviles y computadoras. La conexión a Internet es necesaria para abrir el sitio alojado en GitHub Pages.
- Las ilustraciones se extrajeron del cuento PDF aportado para la producción de esta versión. Antes de publicarlas, verificá que contás con los derechos o permisos de difusión pública.
- Las pistas musicales son **originales, generadas especialmente** para el proyecto y se incluyen como archivos locales. No dependen de Spotify, YouTube u otros servicios externos.
