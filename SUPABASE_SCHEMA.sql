-- 1. CREAR TABLA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREAR TABLA DE FOTOS
CREATE TABLE IF NOT EXISTS public.photos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    description text,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    storage_key text NOT NULL,
    thumbnail_key text,
    url text NOT NULL,
    thumbnail_url text,
    width integer,
    height integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACTIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS PARA QUE EL PÚBLICO PUEDA VER LA GALERÍA
CREATE POLICY "Permitir lectura publica a categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica a fotos" ON public.photos FOR SELECT USING (true);

-- 5. CREAR POLÍTICAS PARA QUE EL ADMIN PUEDA EDITAR/SUBIR (Solo Usuarios Autenticados)
CREATE POLICY "Admin todo categorias" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin todo fotos" ON public.photos FOR ALL USING (auth.role() = 'authenticated');

-- 6. CREAR EL STORAGE BUCKET (Si no existe) Y HACERLO PÚBLICO
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

-- 7. PERMISOS DEL BUCKET (Storage)
CREATE POLICY "Lectura publica al bucket" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Modificacion admin al bucket" ON storage.objects FOR ALL USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
