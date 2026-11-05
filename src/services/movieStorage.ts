import type { Movie, CommunityReview, CommunityMember } from '../types';

const STORAGE_KEY_MOVIES = 'cinetrack_movies_v3';
const STORAGE_KEY_REVIEWS = 'cinetrack_reviews_v3';
const STORAGE_KEY_USER_PROFILE = 'cinetrack_user_profile_v3';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'dune-2',
    title: 'Dune: Parte Dos',
    originalTitle: 'Dune: Part Two',
    director: 'Denis Villeneuve',
    year: 2024,
    runtime: '166 min',
    genre: 'Sci-Fi',
    subgenres: ['Aventura', 'Drama', 'Estreno'],
    rating: 9.4,
    synopsis: 'Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Ante la elección entre el amor de su vida y el destino del universo, intenta evitar un futuro terrible que solo él puede prever.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    isFavorite: true,
    status: 'porver',
    rankPosition: 1,
    userRating: 9.5,
    userNotes: 'Ver en sala IMAX con sonido envolvente. Obra cumbre de la ciencia ficción contemporánea.',
    referenceUrl: 'https://www.imdb.com/title/tt15239678/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'robot-salvaje',
    title: 'Robot Salvaje',
    originalTitle: 'The Wild Robot',
    director: 'Chris Sanders',
    year: 2024,
    runtime: '102 min',
    genre: 'Animación',
    subgenres: ['Sci-Fi', 'Aventura', 'Estreno'],
    rating: 9.3,
    synopsis: 'Tras naufragar en una isla desierta, un robot inteligente llamado Roz debe aprender a adaptarse al duro entorno, entablando gradualmente amistad con los animales nativos y convirtiéndose en padre adoptivo de un gansito huérfano.',
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 2,
    userRating: 9.3,
    userNotes: 'Animación con sensibilidad artesanal sublime. Lloré en el tercer acto.',
    referenceUrl: 'https://www.imdb.com/title/tt29623480/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'el-jockey',
    title: 'El Jockey',
    originalTitle: 'El Jockey / Kill the Jockey',
    director: 'Luis Ortega',
    year: 2024,
    runtime: '96 min',
    genre: 'Noir',
    subgenres: ['Cine Argentino', 'Drama', 'Estreno'],
    rating: 8.9,
    synopsis: 'Remo Manfredini es una leyenda del turf cuya conducta errática ensombrece su talento. Tras sufrir un grave accidente huye y deambula por las calles porteñas, liberado de su propia identidad mientras una mafia lo persigue.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 3,
    userRating: 8.8,
    userNotes: 'Estreno en el Cine Gaumont. Nahuel Pérez Biscayart y Úrsula Corberó extraordinarios.',
    referenceUrl: 'https://www.imdb.com/title/tt27715764/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gladiador-2',
    title: 'Gladiador II',
    originalTitle: 'Gladiator II',
    director: 'Ridley Scott',
    year: 2024,
    runtime: '148 min',
    genre: 'Acción',
    subgenres: ['Drama', 'Épica', 'Estreno'],
    rating: 8.8,
    synopsis: 'Años después de presenciar la muerte del admirado héroe Máximo a manos de su tío, Lucio debe ingresar en el Coliseo tras ser conquistado su hogar por los tiránicos emperadores que ahora dirigen Roma con mano de hierro.',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    isFavorite: false,
    status: 'porver',
    rankPosition: 4,
    userRating: 8.5,
    referenceUrl: 'https://www.imdb.com/title/tt9660502/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    director: 'Christopher Nolan',
    year: 2023,
    runtime: '180 min',
    genre: 'Drama',
    subgenres: ['Histórico', 'Biografía', 'Suspenso'],
    rating: 8.9,
    synopsis: 'La historia del físico estadounidense J. Robert Oppenheimer, al frente del Laboratorio de Los Álamos durante el Proyecto Manhattan que culminó con el desarrollo de la primera bomba atómica.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 5,
    userRating: 9.0,
    userNotes: 'Edición de sonido milimétrica y fotografía en 70mm monumental.',
    referenceUrl: 'https://www.imdb.com/title/tt15398776/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    originalTitle: 'Blade Runner 2049',
    director: 'Denis Villeneuve',
    year: 2017,
    runtime: '164 min',
    genre: 'Sci-Fi',
    subgenres: ['Noir', 'Misterio', 'Clásicas'],
    rating: 9.1,
    synopsis: 'Treinta años después de los eventos del primer film, un nuevo blade runner, el oficial K del departamento de policía de Los Ángeles, desentierra un secreto oculto que tiene el potencial de sumir a la sociedad en el caos.',
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 6,
    userRating: 9.7,
    userNotes: 'Roger Deakins en su máxima cumbre visual. El palacio de Wallace y Las Vegas amarilla.',
    referenceUrl: 'https://www.imdb.com/title/tt1856101/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'el-secreto-de-sus-ojos',
    title: 'El Secreto de sus Ojos',
    originalTitle: 'El secreto de sus ojos',
    director: 'Juan José Campanella',
    year: 2009,
    runtime: '129 min',
    genre: 'Clásicas',
    subgenres: ['Cine Argentino', 'Crimen', 'Drama', 'Suspenso'],
    rating: 9.2,
    synopsis: 'Benjamín Espósito es oficial de un Juzgado de Instrucción de Buenos Aires recién retirado. Obsesionado por un brutal asesinato ocurrido treinta años antes, decide escribir una novela sobre el caso.',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 7,
    userRating: 9.6,
    userNotes: 'Plano secuencia en la cancha de Huracán irrepetible.',
    referenceUrl: 'https://www.imdb.com/title/tt1305806/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'nueve-reinas',
    title: 'Nueve Reinas',
    originalTitle: 'Nueve Reinas',
    director: 'Fabián Bielinsky',
    year: 2000,
    runtime: '114 min',
    genre: 'Clásicas',
    subgenres: ['Cine Argentino', 'Crimen', 'Suspenso', 'Noir'],
    rating: 9.0,
    synopsis: 'Dos estafadores de poca monta se conocen por casualidad una madrugada y se ven envueltos en un negocio millonario: la venta de unas falsificaciones de unos sellos valiosísimos llamados "Las nueve reinas".',
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 8,
    userRating: 9.3,
    referenceUrl: 'https://www.imdb.com/title/tt0247586/',
    createdAt: new Date().toISOString()
  },
  {
    id: '2001-odisea',
    title: '2001: Odisea del Espacio',
    originalTitle: '2001: A Space Odyssey',
    director: 'Stanley Kubrick',
    year: 1968,
    runtime: '149 min',
    genre: 'Clásicas',
    subgenres: ['Sci-Fi', 'Misterio'],
    rating: 9.5,
    synopsis: 'La película de ciencia ficción por excelencia de la historia del cine. Narra los diversos periodos de la historia de la humanidad, desde el amanecer del hombre hasta el viaje de la nave Discovery a Júpiter.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 9,
    userRating: 9.9,
    referenceUrl: 'https://www.imdb.com/title/tt0062622/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'taxi-driver',
    title: 'Taxi Driver',
    originalTitle: 'Taxi Driver',
    director: 'Martin Scorsese',
    year: 1976,
    runtime: '114 min',
    genre: 'Clásicas',
    subgenres: ['Noir', 'Crimen', 'Drama'],
    rating: 9.1,
    synopsis: 'Travis Bickle es un exmarine que trabaja como taxista nocturno en Nueva York para sobrellevar su insomnio. La soledad y la alienación lo llevan a un espiral de paranoia y violencia purificadora.',
    posterUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=600&auto=format&fit=crop',
    isFavorite: false,
    status: 'porver',
    rankPosition: 10,
    referenceUrl: 'https://www.imdb.com/title/tt0075314/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'spider-man-spider-verse',
    title: 'Spider-Man: A Través del Spider-Verso',
    originalTitle: 'Spider-Man: Across the Spider-Verse',
    director: 'Joaquim Dos Santos, Kemp Powers',
    year: 2023,
    runtime: '140 min',
    genre: 'Animación',
    subgenres: ['Acción', 'Sci-Fi'],
    rating: 9.0,
    synopsis: 'Miles Morales se catapulta a través del Multiverso, donde se encuentra con un equipo de Spider-Personas encargadas de proteger su propia existencia ante una nueva amenaza colosal.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 11,
    referenceUrl: 'https://www.imdb.com/title/tt9362722/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'relatos-salvajes',
    title: 'Relatos Salvajes',
    originalTitle: 'Relatos Salvajes',
    director: 'Damián Szifron',
    year: 2014,
    runtime: '122 min',
    genre: 'Clásicas',
    subgenres: ['Cine Argentino', 'Comedia', 'Drama', 'Suspenso'],
    rating: 9.1,
    synopsis: 'Seis episodios independientes que alternan entre la intriga, la comedia y la violencia. Sus personajes se ven empujados hacia el abismo y hacia el innegable placer de perder el control.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    rankPosition: 12,
    referenceUrl: 'https://www.imdb.com/title/tt3011894/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'poor-things',
    title: 'Pobres Criaturas',
    originalTitle: 'Poor Things',
    director: 'Yorgos Lanthimos',
    year: 2023,
    runtime: '141 min',
    genre: 'Drama',
    subgenres: ['Sci-Fi', 'Comedia', 'Romance'],
    rating: 8.6,
    synopsis: 'Bella Baxter es una joven revivida por el brillante y poco ortodoxo científico Dr. Godwin Baxter. Ansiosa por aprender y hambrienta de la mundanalidad que le falta, escapa en una vertiginosa aventura a través de los continentes.',
    posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600&auto=format&fit=crop',
    isFavorite: false,
    status: 'porver',
    referenceUrl: 'https://www.imdb.com/title/tt14230458/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'killers-flower-moon',
    title: 'Los Asesinos de la Luna',
    originalTitle: 'Killers of the Flower Moon',
    director: 'Martin Scorsese',
    year: 2023,
    runtime: '206 min',
    genre: 'Crimen',
    subgenres: ['Drama', 'Histórico', 'Western'],
    rating: 8.7,
    synopsis: 'Cuando se descubre petróleo en la tierra de la nación Osage en Oklahoma en los años 1920, sus habitantes son asesinados uno a uno hasta que el FBI interviene para resolver los misteriosos crímenes.',
    posterUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop',
    isFavorite: false,
    status: 'porver',
    referenceUrl: 'https://www.imdb.com/title/tt5537002/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'anatomie-d-une-chute',
    title: 'Anatomía de una Caída',
    originalTitle: 'Anatomie d\'une chute',
    director: 'Justine Triet',
    year: 2023,
    runtime: '151 min',
    genre: 'Drama',
    subgenres: ['Suspenso', 'Crimen'],
    rating: 8.6,
    synopsis: 'Sandra, Samuel y su hijo con discapacidad visual, Daniel, viven en un remoto chalet en los Alpes franceses. Cuando Samuel es hallado muerto en la nieve, la policía investiga si fue suicidio o asesinato, y Sandra se convierte en la principal sospechosa.',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    isFavorite: true,
    status: 'vistas',
    referenceUrl: 'https://www.imdb.com/title/tt17009710/',
    createdAt: new Date().toISOString()
  },
  {
    id: 'the-zone-of-interest',
    title: 'Zona de Interés',
    originalTitle: 'The Zone of Interest',
    director: 'Jonathan Glazer',
    year: 2023,
    runtime: '105 min',
    genre: 'Drama',
    subgenres: ['Guerra', 'Histórico'],
    rating: 8.7,
    synopsis: 'El comandante de Auschwitz Rudolf Höss y su esposa Hedwig se esfuerzan por construir una vida idílica para su familia en una casa con un frondoso jardín justo al lado del campo de concentración.',
    posterUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
    isFavorite: false,
    status: 'porver',
    referenceUrl: 'https://www.imdb.com/title/tt7160372/',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS: CommunityReview[] = [
  {
    id: 'rev-1',
    userName: 'Mateo Vasconcelos',
    userHandle: '@mateo_critique',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    userRole: 'Crítico Acreditado',
    movieTitle: 'Dune: Parte Dos',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop',
    rating: 9.8,
    reviewText: 'Denis Villeneuve no filmó una secuela, construyó un monumento de celuloide. La escena del gusano de arena gigante con el diseño sonoro de Mark Mangini te hace vibrar el pecho. Una experiencia cinematográfica irrepetible en salas.',
    likes: 38,
    hasLiked: false,
    commentsCount: 14,
    timeAgo: 'Hace 2 horas',
    tags: ['IMAX 70mm', 'Diseño Sonoro', 'Obra Maestra']
  },
  {
    id: 'rev-2',
    userName: 'Camila Rossi',
    userHandle: '@cami_35mm',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    userRole: 'Curadora Festival',
    movieTitle: 'El Jockey',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop',
    rating: 9.0,
    reviewText: 'Luis Ortega consolida su estética onírica y decadente. La Buenos Aires que retrata parece suspendida entre un tango fúnebre y un cómic de ciencia ficción europea. Nahuel Pérez Biscayart actúa con cada milímetro de su cuerpo.',
    likes: 27,
    hasLiked: false,
    commentsCount: 9,
    timeAgo: 'Hace 5 horas',
    tags: ['Cine Argentino', 'Venecia 2024', 'Fotografía']
  },
  {
    id: 'rev-3',
    userName: 'Lucas Benítez',
    userHandle: '@lucas_filmreel',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    userRole: 'Archivero Fílmico',
    movieTitle: 'Robot Salvaje',
    moviePoster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=300&auto=format&fit=crop',
    rating: 9.3,
    reviewText: 'Es un triunfo absoluto de la textura pictórica sobre la hiper-realidad genérica del CGI. Recuerda al mejor Miyazaki cruzado con El Gigante de Hierro. Emotiva sin caer en golpes bajos.',
    likes: 45,
    hasLiked: true,
    commentsCount: 18,
    timeAgo: 'Ayer',
    tags: ['Animación Pura', 'Dirección de Arte']
  }
];

export const INITIAL_MEMBERS: CommunityMember[] = [
  {
    id: 'm-1',
    name: 'Mateo V.',
    currentMovie: 'Dune: Parte Dos',
    ratingText: '9.8 • Puntuó',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    status: 'online',
    role: 'Crítico'
  },
  {
    id: 'm-2',
    name: 'Camila R.',
    currentMovie: 'El Jockey',
    ratingText: 'Reseñando',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    status: 'watching',
    role: 'Curadora'
  },
  {
    id: 'm-3',
    name: 'Lucas B.',
    currentMovie: 'Canon 2024',
    ratingText: 'Tier List',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    status: 'online',
    role: 'Archivero'
  },
  {
    id: 'm-4',
    name: 'Elena G.',
    currentMovie: 'Blade Runner 2049',
    ratingText: '9.5 • Rewatch',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    status: 'reviewing',
    role: 'Cinéfila'
  },
  {
    id: 'm-5',
    name: 'Julián P.',
    currentMovie: '2001: Odisea',
    ratingText: '10 • Sala 35mm',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    status: 'watching',
    role: 'Proyeccionista'
  },
  {
    id: 'm-6',
    name: 'Clara Z.',
    currentMovie: 'Zona de Interés',
    ratingText: '8.7 • En Sala',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    status: 'online',
    role: 'Programadora'
  }
];

// LocalStorage helpers
export function getStoredMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVIES);
    if (!raw) {
      saveStoredMovies(INITIAL_MOVIES);
      return INITIAL_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredMovies(INITIAL_MOVIES);
      return INITIAL_MOVIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error al leer películas desde LocalStorage:', err);
    return INITIAL_MOVIES;
  }
}

export function saveStoredMovies(movies: Movie[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(movies));
  } catch (err) {
    console.error('Error al guardar películas en LocalStorage:', err);
  }
}

export function getStoredReviews(): CommunityReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      saveStoredReviews(INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REVIEWS;
  } catch (err) {
    console.error('Error al leer reseñas de LocalStorage:', err);
    return INITIAL_REVIEWS;
  }
}

export function saveStoredReviews(reviews: CommunityReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (err) {
    console.error('Error al guardar reseñas en LocalStorage:', err);
  }
}

export function resetToInitialStorage(): void {
  saveStoredMovies(INITIAL_MOVIES);
  saveStoredReviews(INITIAL_REVIEWS);
}

// Public API fetcher using free public TVMaze API with comprehensive error handling
export async function fetchPublicAPIShows(query: string = 'cinema'): Promise<Movie[]> {
  const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en el servidor de la API pública: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la API no contiene el formato de lista esperado.');
    }

    const transformed: Movie[] = data
      .filter((item: any) => item?.show?.name)
      .map((item: any) => {
        const show = item.show;
        const genres = show.genres && show.genres.length > 0 ? show.genres : ['Drama'];
        const premieredYear = show.premiered ? parseInt(show.premiered.substring(0, 4), 10) : 2023;
        const ratingVal = show.rating?.average ? Number(show.rating.average) : 8.2;
        const cleanSummary = show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'Obra cinematográfica catalogada para análisis crítico en CineTrack Noir.';
        
        return {
          id: `api-${show.id}`,
          title: show.name,
          originalTitle: show.name,
          director: show.network?.name || 'Dirección de Autor',
          year: isNaN(premieredYear) ? 2024 : premieredYear,
          runtime: show.averageRuntime ? `${show.averageRuntime} min` : '120 min',
          genre: genres[0] || 'Drama',
          subgenres: genres,
          rating: ratingVal,
          synopsis: cleanSummary,
          posterUrl: show.image?.original || show.image?.medium || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
          isFavorite: false,
          status: 'porver',
          referenceUrl: show.url || show.officialSite || '',
          createdAt: new Date().toISOString()
        };
      });

    return transformed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado al conectar con la API pública de cine.');
    }
    throw error;
  }
}
