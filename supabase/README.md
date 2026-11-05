# Configuración de Supabase para CineTrack Noir

Este directorio contiene el esquema SQL completo y optimizado para **Supabase** (PostgreSQL) para gestionar:
1. **Usuarios y Perfiles**: Integrado con `auth.users` mediante triggers automáticos (`profiles`).
2. **Persistencia de Películas**: Catálogo central con metadatos técnicos, pósters y géneros (`movies`).
3. **Rankings Propios por Usuario**: Cada cinéfilo tiene su propio orden jerárquico (1, 2, 3...), estado (`porver`, `vistas`, `archivada`), notas y puntaje personal (`user_movies`).
4. **Sistema Social de Seguidos**: Relaciones de seguimiento entre usuarios (`user_follows`).
5. **Comentarios e Interacciones en Películas**: Reseñas en películas con visibilidad para seguidos (`movie_comments`), me gusta (`comment_likes`) y respuestas anidadas (`comment_replies`).
6. **Políticas RLS (Row Level Security)**: Seguridad estricta a nivel de fila y vista optimizada `v_followed_feed`.

---

## 🚀 Pasos para ejecutar en tu proyecto Supabase

1. Abre tu panel de control en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** en el menú lateral izquierdo.
3. Haz clic en **+ New Query**.
4. Copia el contenido de `supabase/schema.sql` y pégalo en el editor.
5. Presiona **Run** (o `Ctrl + Enter` / `Cmd + Enter`).
6. Obtén tu URL y clave anónima en **Project Settings > API**:
   - `Project URL`
   - `anon public` key
7. Agrégalos en tu entorno o directamente en la interfaz de la aplicación en la pestaña **Supabase SQL & Conexión**.

---

## 📊 Estructura de Tablas y Relaciones

- `public.profiles`: Datos públicos de usuarios, niveles y roles cinéfilos.
- `public.movies`: Catálogo maestro de películas.
- `public.user_movies`: Ranking individual de cada usuario con restricción única por usuario y película.
- `public.user_follows`: Relación N:M de seguimiento entre cinéfilos (seguidores y seguidos).
- `public.movie_comments`: Reseñas de películas que nutren el feed de seguidos.
- `public.comment_likes`: Registros de likes por usuario y comentario.
- `public.comment_replies`: Hilo de respuestas para interactuar con los seguidos.
