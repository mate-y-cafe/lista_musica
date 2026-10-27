document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://jeahmnkumhuihxvliouo.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_FV3iFcEz5o0XtTBo2qohtA__WIsKkhU';
  const MENSAJES = {
    'código inválido': 'El código ingresado no existe.',
    'código ya usado': 'Este código ya fue utilizado anteriormente.'
  };
 
  // 1. Mostrar/ocultar campos de Link o Manual
  document.querySelectorAll('.select-tipo').forEach((select, index) => {
    select.addEventListener('change', (e) => {
      const num = index + 1;
      const esLink = e.target.value === 'link';
      document.getElementById(`grupo-link-${num}`).classList.toggle('oculto', !esLink);
      document.getElementById(`grupo-manual-${num}`).classList.toggle('oculto', esLink);
      document.getElementById(`link${num}`).required = esLink;
      document.getElementById(`titulo${num}`).required = !esLink;
      document.getElementById(`artista${num}`).required = !esLink;
    });
  });
 
  // 2. Leer una canción como objeto (formato que espera la base)
  function leerCancion(num) {
    const tipo = document.getElementById(`tipo${num}`).value;
    if (tipo === 'link') {
      const link = document.getElementById(`link${num}`).value.trim().split('?')[0];
      if (!/^https:\/\/open\.spotify\.com\/(intl-[a-z-]+\/)?track\/[A-Za-z0-9]+/.test(link)) {
        throw new Error(`El link de la canción ${num} no es una canción de Spotify.`);
      }
      return { titulo: 'Tema desde Spotify', artista: 'Spotify', link_spotify: link };
    }
    const titulo = document.getElementById(`titulo${num}`).value.trim();
    const artista = document.getElementById(`artista${num}`).value.trim();
    if (!titulo || !artista) {
      throw new Error(`Completá título y artista de la canción ${num}.`);
    }
    return { titulo: titulo, artista: artista, link_spotify: null };
  }
 
  // 3. Enviar a Supabase
  const form = document.getElementById('formPedido');
  const btn = document.getElementById('btnEnviar');
  const errorDiv = document.getElementById('mensajeError');
 
  function mostrarError(texto) {
    errorDiv.textContent = texto;
    errorDiv.classList.remove('oculto');
  }
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.classList.add('oculto');
 
    const codigo = document.getElementById('codigo').value.trim().toUpperCase();
    const nombre = document.getElementById('nombre').value.trim();
 
    let canciones;
    try {
      canciones = [leerCancion(1), leerCancion(2)];
    } catch (err) {
      mostrarError(err.message);
      return;
    }
 
    btn.textContent = 'Enviando...';
    btn.disabled = true;
 
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/canjear_codigo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          p_codigo: codigo,
          p_nombre: nombre || null,
          p_canciones: canciones
        })
      });
 
      if (response.ok) {
        document.getElementById('pantallaFormulario').classList.add('oculto');
        document.getElementById('pantallaExito').classList.remove('oculto');
      } else {
        let mensaje = 'No pudimos enviar tus temas. Probá de nuevo.';
        try {
          const r = await response.json();
          mensaje = MENSAJES[r.message] || r.message || mensaje;
        } catch (_) {}
        mostrarError(mensaje);
      }
    } catch (error) {
      mostrarError('Error de conexión. Verificá tu internet e intentá de nuevo.');
    } finally {
      btn.textContent = 'Enviar mis temas';
      btn.disabled = false;
    }
  });
});