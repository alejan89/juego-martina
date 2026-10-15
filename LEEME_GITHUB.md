# Aventuras Mágicas — Alicia Felicia y la Princesa Martina

Juego web infantil basado en el cuento original **Alicia Felicia y la Princesa Martina: Las niñas del bosque y el dragón de fuego**.

## ¿Qué incluye?

- **Coloreá el cuento:** cuatro personajes (Alicia, Martina, dragón, ardillita); 18 pinturas; pintura tocando zonas, deshacer, borrar, coloración mágica y descarga PNG; progreso guardado en este navegador.
- **¡Salvá a la ardillita!:** Alicia se mueve para recoger 3 estrellas, esquivar llamas y llegar a rescatar a su amiga; 3 vidas, reinicio, pausa, controles de teclado y controles táctiles.
- Sonidos y melodías generados localmente, con interruptor para silenciarlos.
- Ilustraciones originales del PDF utilizadas como imágenes de referencia y fondo. Los dibujos interactivos y el minijuego son gráficos vectoriales hechos especialmente para esta web.
- Sin anuncios, sin registro, sin enviar datos a terceros. Los avances se guardan de forma local en el dispositivo (localStorage).
- No utiliza servidor, base de datos ni servicios de pago: compatible con **GitHub Pages**.

## Cómo subirlo a GitHub Pages

**IMPORTANTE:** GitHub no descomprime automáticamente un ZIP que subís al repositorio. Primero descomprimilo en tu computadora.

1. Descargá `Aventuras_Magicas_Alicia_Martina_GitHub.zip` y extraé el contenido.
2. Abrí https://github.com e ingresá a tu cuenta.
3. Creá un repositorio público, por ejemplo `aventuras-alicia-martina` (o abrí uno existente).
4. Dentro del repositorio, elegí **Add file > Upload files**.
5. Arrastrá **`index.html`, `styles.css`, `app.js`, `LEEME_GITHUB.md` y la carpeta `assets` completa**, manteniendo esa estructura. Usá el explorador de archivos para arrastrar los contenidos de la carpeta extraída; algunas interfaces no permiten subir una carpeta de una sola vez, pero sí arrastrar todos los archivos de su interior conservando sus rutas. Debe quedar `index.html` en la raíz y las imágenes en `assets/`.
6. Confirmá con **Commit changes**.
7. Andá a **Settings > Pages**; en **Build and deployment**, elegí **Deploy from a branch**, rama `main`, carpeta **/(root)** y guardá.
8. Esperá a que GitHub publique. Tu sitio quedará, normalmente, en una dirección como `https://TU-USUARIO.github.io/aventuras-alicia-martina/`.

## Estructura de archivos

```
index.html
styles.css
app.js
LEEME_GITHUB.md
assets/
  portada.webp
  bosque.webp
  alicia.webp
  martina.webp
  dragon.webp
  ardilla.webp
  castillo.webp
  favicon.svg
```

## Cómo jugar

**Colorear:** seleccioná un personaje, después un color de la paleta y tocá las zonas blancas. `Colores mágicos` completa el personaje automáticamente. `Deshacer` revierte la última operación; `Guardar mi dibujo` descarga una imagen PNG.

**Rescate:** usá las flechas del teclado o W/A/S/D; en celular, mantené presionados los botones en forma de cruz. Primero juntá tres estrellas; después alcanzá a la ardillita, ubicada en el extremo derecho. Si una llama te toca, perdés una vida temporalmente y tenés un breve período de protección.

## Notas técnicas

- Optimizado para navegadores modernos Chrome, Edge, Firefox y Safari. La descarga PNG requiere funciones modernas del navegador. En algunos dispositivos móviles la descarga puede abrir la imagen para guardarla manualmente.
- El sonido se activa únicamente después de una interacción del usuario, respetando las restricciones de los navegadores.
- Las fuentes pueden descargarse desde Google Fonts; si no hay conexión, se usan fuentes del equipo y el juego sigue funcionando.
- Las imágenes son derivadas del PDF aportado por el autor para este proyecto. Antes de compartir públicamente, asegurate de tener los derechos para publicar dichas imágenes.
- Para probar sin GitHub, abrí `index.html` en Chrome/Edge; en algunos navegadores la apertura desde archivos locales puede limitar ciertas funciones. GitHub Pages evita esas restricciones.
