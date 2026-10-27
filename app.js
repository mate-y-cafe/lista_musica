document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica para mostrar/ocultar los campos de Link o Manual
  document.querySelectorAll('.select-tipo').forEach((select, index) => {
    select.addEventListener('change', (e) => {
      const num = index + 1; 
      const grupoLink = document.getElementById(`grupo-link-${num}`);
      const grupoManual = document.getElementById(`grupo-manual-${num}`);
      
      if (e.target.value === 'link') {
        grupoLink.classList.remove('oculto');
        grupoManual.classList.add('oculto');
        document.getElementById(`link${num}`).required = true;
        document.getElementById(`titulo${num}`).required = false;
        document.getElementById(`artista${num}`).required = false;
      } else {
        grupoLink.classList.add('oculto');
        grupoManual.classList.remove('oculto');
        document.getElementById(`link${num}`).required = false;
        document.getElementById(`titulo${num}`).required = true;
        document.getElementById(`artista${num}`).required = true;
      }
    });
  });

  // 2. Lógica para enviar los datos a Supabase
  const form = document.getElementById('formPedido');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página recargue

    const btn = document.getElementById('btnEnviar');
    const errorDiv = document.getElementById('mensajeError');
    
    // Estado de carga
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    errorDiv.classList.add('oculto');

    // Recolectar Código y Nombre
    const codigo = document.getElementById('codigo').value;
    const nombre = document.getElementById('nombre').value;

    // Recolectar Canción 1
    const tipo1 = document.getElementById('tipo1').value;
    let cancion1 = "";
    if (tipo1 === 'link') {
        cancion1 = document.getElementById('link1').value;
    } else {
        cancion1 = document.getElementById('titulo1').value + ' - ' + document.getElementById('artista1').value;
    }

    // Recolectar Canción 2
    const tipo2 = document.getElementById('tipo2').value;
    let cancion2 = "";
    if (tipo2 === 'link') {
        cancion2 = document.getElementById('link2').value;
    } else {
        cancion2 = document.getElementById('titulo2').value + ' - ' + document.getElementById('artista2').value;
    }

    // Armar el paquete de datos exacto que espera tu api.php
    const payload = {
        codigo: codigo,
        nombre: nombre,
        canciones: [cancion1, cancion2]
    };

    try {
        // Enviar al backend
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            // Éxito: Ocultar formulario y mostrar cartel de confirmación
            document.getElementById('pantallaFormulario').classList.add('oculto');
            document.getElementById('pantallaExito').classList.remove('oculto');
        } else {
            // Error de Supabase (ej: código inválido o ya usado)
            errorDiv.textContent = result.error || result.message || 'Error al enviar los temas.';
            errorDiv.classList.remove('oculto');
        }
    } catch (error) {
        // Error de red
        errorDiv.textContent = 'Error de conexión. Verificá tu internet e intentá de nuevo.';
        errorDiv.classList.remove('oculto');
    } finally {
        // Restaurar el botón
        btn.textContent = 'Enviar mis temas';
        btn.disabled = false;
    }
  });
});