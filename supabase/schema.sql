-- ==============================================================================
-- CINETRACK NOIR - SUPABASE POSTGRESQL SCHEMA
-- Manejo de usuarios, persistencia de películas, rankings personales,
-- sistema de seguidos (follows) e interacciones sociales (comentarios, me gusta y respuestas).
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: PROFILES (Perfiles de usuario vinculados a auth.users de Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Amante del celuloide y el cine de autor.',
    role TEXT DEFAULT 'Cinéfilo' CHECK (role IN ('Cinéfilo', 'Cinéfilo Pro', 'Crítico Acreditado', 'Curadora Festival', 'Archivero Fílmico', 'Proyeccionista', 'Programadora')),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsqueda rápida de perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);

-- ==============================================================================
-- 3. TABLA: MOVIES (Catálogo maestro de películas persistido en Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY, -- Slug o identificador único (ej: 'dune-2', 'robot-salvaje')
    title TEXT NOT NULL,
    original_title TEXT,
    director TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1888),
    runtime TEXT NOT NULL,
    genre TEXT NOT NULL,
    subgenres TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 1) DEFAULT 8.0 CHECK (rating >= 0 AND rating <= 10),
    synopsis TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    banner_url TEXT,
    reference_url TEXT,
    is_suggested BOOLEAN DEFAULT FALSE,
    curator_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_movies_year ON public.movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON public.movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_title ON public.movies USING gin(to_tsvector('spanish', title));

-- ==============================================================================
-- 4. TABLA: USER_MOVIES (Ranking propio y colección individual de cada usuario)
-- Permite que cada usuario tenga su propia posición de ranking, estado (vistas/porver),
-- calificación personal y notas privadas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    rank_position INTEGER CHECK (rank_position > 0),
    status TEXT NOT NULL DEFAULT 'porver' CHECK (status IN ('porver', 'vistas', 'archivada')),
    is_favorite BOOLEAN DEFAULT FALSE,
    user_rating NUMERIC(3, 1) CHECK (user_rating IS NULL OR (user_rating >= 0 AND user_rating <= 10)),
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_movies_user ON public.user_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_rank ON public.user_movies(user_id, rank_position) WHERE rank_position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_movies_favorite ON public.user_movies(user_id) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_movies_status ON public.user_movies(user_id, status);

-- ==============================================================================
-- 5. TABLA: USER_FOLLOWS (Sistema social para seguir a otros usuarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- ==============================================================================
-- 6. TABLA: MOVIE_COMMENTS (Comentarios y reseñas en películas para la comunidad)
-- Los seguidos pueden ver estas publicaciones en su feed social.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.movie_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id TEXT NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 3),
    rating NUMERIC(3, 1) CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_movie_comments_movie ON public.movie_comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_comments_user ON public.movie_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_comments_created ON public.movie_comments(created_at DESC);

-- ==============================================================================
-- 7. TABLA: COMMENT_LIKES (Me gusta en comentarios / reseñas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.movie_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_comment_user_like UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);

-- ==============================================================================
-- 8. TABLA: COMMENT_REPLIES (Respuestas a comentarios / hilos de discusión)
-- Permite que los seguidos y otros usuarios comenten sobre las reseñas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comment_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.movie_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) >= 1),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comment_replies_comment ON public.comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_user ON public.comment_replies(user_id);

-- ==============================================================================
-- 9. TRIGGERS Y FUNCIONES: ACTUALIZACIÓN AUTOMÁTICA DE UPDATED_AT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_movies_updated_at
BEFORE UPDATE ON public.movies
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_user_movies_updated_at
BEFORE UPDATE ON public.user_movies
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER tr_movie_comments_updated_at
BEFORE UPDATE ON public.movie_comments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 10. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRARSE EN SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    user_raw_name TEXT;
    clean_handle TEXT;
BEGIN
    user_raw_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    clean_handle := '@' || lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));

    INSERT INTO public.profiles (id, username, display_name, handle, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'cinefilo_' || substr(NEW.id::text, 1, 6)),
        user_raw_name,
        clean_handle,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'),
        'Cinéfilo'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 11. VISTA: FEED SOCIAL DE SEGUIDOS (Comentarios que publicaron los seguidos)
-- Permite consultar eficientemente el muro de reseñas de la gente a quien se sigue.
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_followed_feed AS
SELECT
    c.id AS comment_id,
    c.content,
    c.rating,
    c.tags,
    c.created_at,
    m.id AS movie_id,
    m.title AS movie_title,
    m.poster_url AS movie_poster,
    m.year AS movie_year,
    p.id AS author_id,
    p.display_name AS author_name,
    p.handle AS author_handle,
    p.avatar_url AS author_avatar,
    p.role AS author_role,
    f.follower_id AS viewer_id,
    (SELECT COUNT(*) FROM public.comment_likes l WHERE l.comment_id = c.id) AS likes_count,
    (SELECT COUNT(*) FROM public.comment_replies r WHERE r.comment_id = c.id) AS replies_count
FROM public.movie_comments c
JOIN public.movies m ON m.id = c.movie_id
JOIN public.profiles p ON p.id = c.user_id
JOIN public.user_follows f ON f.following_id = c.user_id;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;

-- Politicas para PROFILES
CREATE POLICY "Perfiles públicos visibles para todos"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politicas para MOVIES
CREATE POLICY "Catálogo de películas visible para todos"
ON public.movies FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden sugerir/crear películas"
ON public.movies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar películas"
ON public.movies FOR UPDATE USING (auth.role() = 'authenticated');

-- Politicas para USER_MOVIES (Rankings y colecciones)
CREATE POLICY "Rankings y colecciones son públicos para la comunidad"
ON public.user_movies FOR SELECT USING (true);

CREATE POLICY "Usuarios gestionan su propia colección y ranking"
ON public.user_movies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su propio ranking y notas"
ON public.user_movies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan películas de su colección"
ON public.user_movies FOR DELETE USING (auth.uid() = user_id);

-- Politicas para USER_FOLLOWS
CREATE POLICY "Relaciones de seguimiento visibles públicamente"
ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden seguir a otros cinéfilos"
ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Usuarios pueden dejar de seguir"
ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Politicas para MOVIE_COMMENTS
CREATE POLICY "Comentarios en películas visibles para todos"
ON public.movie_comments FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden comentar películas"
ON public.movie_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autores pueden editar sus comentarios"
ON public.movie_comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Autores pueden borrar sus comentarios"
ON public.movie_comments FOR DELETE USING (auth.uid() = user_id);

-- Politicas para COMMENT_LIKES
CREATE POLICY "Me gusta visibles públicamente"
ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden dar me gusta"
ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden retirar su me gusta"
ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Politicas para COMMENT_REPLIES
CREATE POLICY "Respuestas visibles públicamente"
ON public.comment_replies FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden responder comentarios"
ON public.comment_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autores pueden eliminar sus respuestas"
ON public.comment_replies FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 13. SEED DATA INICIAL (Catálogo maestro de películas)
-- ==============================================================================
INSERT INTO public.movies (id, title, original_title, director, year, runtime, genre, subgenres, rating, synopsis, poster_url, banner_url, reference_url)
VALUES
(
    'dune-2',
    'Dune: Parte Dos',
    'Dune: Part Two',
    'Denis Villeneuve',
    2024,
    '166 min',
    'Sci-Fi',
    ARRAY['Aventura', 'Drama', 'Estreno'],
    9.4,
    'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Ante la elección entre el amor de su vida y el destino del universo, intenta evitar un futuro terrible que solo él puede prever.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    'https://www.imdb.com/title/tt15239678/'
),
(
    'robot-salvaje',
    'Robot Salvaje',
    'The Wild Robot',
    'Chris Sanders',
    2024,
    '102 min',
    'Animación',
    ARRAY['Sci-Fi', 'Aventura', 'Estreno'],
    9.3,
    'Tras naufragar en una isla desierta, un robot inteligente llamado Roz debe aprender a adaptarse al duro entorno, entablando gradualmente amistad con los animales nativos y convirtiéndose en padre adoptivo de un gansito huérfano.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
    'https://www.imdb.com/title/tt29623480/'
),
(
    'el-jockey',
    'El Jockey',
    'El Jockey / Kill the Jockey',
    'Luis Ortega',
    2024,
    '96 min',
    'Noir',
    ARRAY['Cine Argentino', 'Drama', 'Estreno'],
    8.9,
    'Remo Manfredini es una leyenda del turf cuya conducta errática ensombrece su talento. Tras sufrir un grave accidente huye y deambula por las calles porteñas, liberado de su propia identidad mientras una mafia lo persigue.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop',
    'https://www.imdb.com/title/tt27715764/'
),
(
    'blade-runner-2049',
    'Blade Runner 2049',
    'Blade Runner 2049',
    'Denis Villeneuve',
    2017,
    '164 min',
    'Sci-Fi',
    ARRAY['Noir', 'Misterio', 'Clásicas'],
    9.1,
    'Treinta años después de los eventos del primer film, un nuevo blade runner, el oficial K del departamento de policía de Los Ángeles, desentierra un secreto oculto que tiene el potencial de sumir a la sociedad en el caos.',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    NULL,
    'https://www.imdb.com/title/tt1856101/'
),
(
    'el-secreto-de-sus-ojos',
    'El Secreto de sus Ojos',
    'El secreto de sus ojos',
    'Juan José Campanella',
    2009,
    '129 min',
    'Clásicas',
    ARRAY['Cine Argentino', 'Crimen', 'Drama'],
    9.2,
    'Benjamín Espósito es oficial de un Juzgado de Instrucción de Buenos Aires recién retirado. Obsesionado por un brutal asesinato ocurrido treinta años antes, decide escribir una novela sobre el caso.',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
    NULL,
    'https://www.imdb.com/title/tt1305806/'
),
(
    '2001-odisea',
    '2001: Odisea del Espacio',
    '2001: A Space Odyssey',
    'Stanley Kubrick',
    1968,
    '149 min',
    'Clásicas',
    ARRAY['Sci-Fi', 'Misterio'],
    9.5,
    'La película de ciencia ficción por excelencia de la historia del cine. Narra los diversos periodos de la historia de la humanidad, desde el amanecer del hombre hasta el viaje de la nave Discovery a Júpiter.',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    NULL,
    'https://www.imdb.com/title/tt0062622/'
)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de éxito al correr en SQL Editor de Supabase
SELECT 'Esquema de CineTrack Noir desplegado con éxito en Supabase' AS estado;
