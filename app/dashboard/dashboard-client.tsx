'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

interface Property {
  id: string;
  titulo: string;
  tipo_operacion: string;
  tipo_propiedad: string;
  comuna: string;
  region: string;
  precio_pesos: number | null;
  precio_uf: number | null;
  prioridad_score: number;
  fecha_expiracion_impulso: string | null;
  fecha_publicacion: string;
}

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  plan_tipo: string;
  plan_expiracion: string | null;
}

interface DashboardClientProps {
  propiedades: Property[];
  userNombre: string;
  userProfile: UserProfile;
}

// Predefinidos chilenos
const REGIONES_Y_COMUNAS = [
  { region: 'Arica y Parinacota', comunas: ['Arica', 'Putre'] },
  { region: 'Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'] },
  { region: 'Antofagasta', comunas: ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'] },
  { region: 'Atacama', comunas: ['Copiapó', 'Vallenar', 'Caldera', 'Chañaral'] },
  { region: 'Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'] },
  { region: 'Valparaíso', comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Algarrobo', 'Casablanca', 'Concón'] },
  { region: 'Metropolitana de Santiago', comunas: ['Santiago', 'Melipilla', 'Pomaire', 'Colina', 'Lampa', 'Pirque', 'Buin', 'Paine', 'Talagante', 'Providencia', 'Las Condes'] },
  { region: 'Libertador Gral. Bernardo O\'Higgins', comunas: ['Rancagua', 'San Fernando', 'Pichilemu', 'Machalí', 'Chimbarongo'] },
  { region: 'Maule', comunas: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes'] },
  { region: 'Ñuble', comunas: ['Chillán', 'Bulnes', 'San Carlos', 'Cobquecura'] },
  { region: 'Biobío', comunas: ['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Coronel', 'Los Ángeles'] },
  { region: 'La Araucanía', comunas: ['Temuco', 'Pucón', 'Villarrica', 'Padre Las Casas', 'Angol'] },
  { region: 'Los Ríos', comunas: ['Valdivia', 'Panguipulli', 'La Unión', 'Río Bueno'] },
  { region: 'Los Lagos', comunas: ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud', 'Frutillar'] },
  { region: 'Aysén', comunas: ['Coyhaique', 'Puerto Aysén', 'Cochrane'] },
  { region: 'Magallanes', comunas: ['Punta Arenas', 'Puerto Natales', 'Porvenir'] }
];

const PLANES_INFO = {
  gratis: { nombre: 'Gratis', CLP: '$0', maxFotos: 5, maxVideos: 0, maxAvisos: 2, seo: 'Estándar', css: 'bg-slate-100 border-slate-300 text-slate-700' },
  plan_10k: { nombre: 'Plan 10K', CLP: '$10.000', maxFotos: 8, maxVideos: 1, maxAvisos: 4, seo: 'Exposición Media + Impulso SEO', css: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  plan_20k: { nombre: 'Plan 20K', CLP: '$20.000', maxFotos: 20, maxVideos: 3, maxAvisos: 10, seo: 'Exposición Alta + Impulso SEO VIP', css: 'bg-blue-50 border-blue-200 text-blue-700' },
  plan_50k: { nombre: 'Plan 50K', CLP: '$50.000', maxFotos: 30, maxVideos: 10, maxAvisos: 50, seo: 'Exposición Máxima + SEO Ultra', css: 'bg-amber-50 border-amber-200 text-amber-700' },
  admin: { nombre: 'Dueño (VIP)', CLP: 'Gratis (Admin)', maxFotos: 999999, maxVideos: 999999, maxAvisos: 999999, seo: 'Prioridad Absoluta', css: 'bg-purple-50 border-purple-200 text-purple-700' }
};

export default function DashboardClient({ propiedades, userNombre, userProfile }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'avisos' | 'publicar' | 'suscripciones'>('avisos');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos del plan del usuario actual
  const planActual = (userProfile.plan_tipo as keyof typeof PLANES_INFO) || 'gratis';
  const infoPlanActual = PLANES_INFO[planActual];

  // Estado del Formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState('venta'); // 'venta', 'compra', 'arriendo'
  const [tipoPropiedad, setTipoPropiedad] = useState('terreno'); // 'terreno', 'casa', 'local'
  const [precioPesos, setPrecioPesos] = useState('');
  const [precioUf, setPrecioUf] = useState('');
  const [region, setRegion] = useState('Región Metropolitana');
  const [comuna, setComuna] = useState('Santiago');
  const [habitaciones, setHabitaciones] = useState('0');
  const [banos, setBanos] = useState('0');
  const [superficieTotal, setSuperficieTotal] = useState('');
  const [contactoNombre, setContactoNombre] = useState(userNombre);
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoEmail, setContactoEmail] = useState(userProfile.email);
  const [observaciones, setObservaciones] = useState('');
  
  // Documentos checklist
  const [documentos, setDocumentos] = useState<string[]>([]);
  const DOCUMENTOS_OPCIONES = [
    'Rol propio', 'Escritura inscrita', 'Certificado de informaciones previas (CIP)', 
    'Plano aprobado e inscrito', 'Derechos de agua inscritos', 'Certificado de factibilidad de luz', 
    'Certificado de factibilidad de agua'
  ];

  // Fotos y Videos
  const [fotosFiles, setFotosFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [videosUrls, setVideosUrls] = useState<string[]>([]);
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  // Compresión Client-Side WebP Canvas
  const compressImageToWebp = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not available'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Image conversion failed'));
            },
            'image/webp',
            0.5
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Compresión de video client-side (canvas + MediaRecorder)
  const compressVideo = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        const maxWidth = 854;
        const scale = Math.min(maxWidth / video.videoWidth, 1);
        const outW = Math.round(video.videoWidth * scale) - (Math.round(video.videoWidth * scale) % 2);
        const outH = Math.round(video.videoHeight * scale) - (Math.round(video.videoHeight * scale) % 2);

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context not available')); return; }

        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
        const stream = canvas.captureStream(24);
        const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 500000 });
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          URL.revokeObjectURL(video.src);
          resolve(blob);
        };
        recorder.onerror = () => reject(new Error('Video compression failed'));

        video.play().then(() => {
          recorder.start(200);
          const draw = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, outW, outH);
              requestAnimationFrame(draw);
            } else {
              recorder.stop();
            }
          };
          draw();
        }).catch(reject);
      };
      video.onerror = () => reject(new Error('Failed to load video'));
    });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const totalAllowed = infoPlanActual.maxFotos;
      if (fotosFiles.length + selected.length > totalAllowed) {
        alert(`Tu plan ${infoPlanActual.nombre} solo permite hasta ${totalAllowed} fotografías.`);
        return;
      }
      setFotosFiles([...fotosFiles, ...selected]);
    }
  };

  const removeFoto = (index: number) => {
    setFotosFiles(fotosFiles.filter((_, i) => i !== index));
  };

  const addVideoUrl = () => {
    if (!videoInputUrl) return;
    const totalAllowed = infoPlanActual.maxVideos;
    if (videosUrls.length >= totalAllowed) {
      alert(`Tu plan ${infoPlanActual.nombre} solo permite hasta ${totalAllowed} videos.`);
      return;
    }
    setVideosUrls([...videosUrls, videoInputUrl]);
    setVideoInputUrl('');
  };

  const removeVideoUrl = (index: number) => {
    setVideosUrls(videosUrls.filter((_, i) => i !== index));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const totalAllowed = infoPlanActual.maxVideos;
      if (videoFiles.length + videosUrls.length + selected.length > totalAllowed) {
        alert(`Tu plan ${infoPlanActual.nombre} solo permite hasta ${totalAllowed} videos.`);
        return;
      }
      setVideoFiles([...videoFiles, ...selected]);
    }
  };

  const removeVideoFile = (index: number) => {
    setVideoFiles(videoFiles.filter((_, i) => i !== index));
  };

  const handleDocumentoToggle = (doc: string) => {
    if (documentos.includes(doc)) {
      setDocumentos(documentos.filter(d => d !== doc));
    } else {
      setDocumentos([...documentos, doc]);
    }
  };

  // Compra de plan a través de Flow
  const iniciarCompraSuscripcion = async (plan: string) => {
    try {
      setLoadingId(plan);
      setErrorMessage(null);

      const response = await fetch('/api/pagos/flow-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setErrorMessage(data.error || 'No se pudo iniciar el proceso de suscripción con Flow.');
        setLoadingId(null);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Error de red al intentar contactar a Flow.');
      setLoadingId(null);
    }
  };

  // Envío del Formulario
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (propiedades.length >= infoPlanActual.maxAvisos) {
      setErrorMessage(`Has alcanzado el límite máximo de avisos (${infoPlanActual.maxAvisos}) para el plan ${infoPlanActual.nombre}. Por favor, mejora tu plan.`);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Crear propiedad
      const propiedadResponse = await fetch('/api/propiedades/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_operacion: tipoOperacion,
          tipo_propiedad: tipoPropiedad,
          titulo,
          descripcion,
          precio_pesos: precioPesos || null,
          precio_uf: precioUf || null,
          region,
          comuna,
          habitaciones: parseInt(habitaciones) || 0,
          banos: parseInt(banos) || 0,
          superficie_total: parseInt(superficieTotal) || 0,
          contacto_nombre: contactoNombre,
          contacto_telefono: contactoTelefono,
          contacto_email: contactoEmail,
          observaciones,
          documentos,
        }),
      });

      const propiedadData = await propiedadResponse.json();

      if (!propiedadResponse.ok) {
        throw new Error(propiedadData.error || 'Ocurrió un error al crear la propiedad');
      }

      const { propiedadId } = propiedadData;

      // 2. Comprimir y subir fotos con Canvas WebP Client-side
      const failedUploads: string[] = [];
      for (let i = 0; i < fotosFiles.length; i++) {
        const file = fotosFiles[i];
        try {
          const compressedBlob = await compressImageToWebp(file);
          const uploadForm = new FormData();
          uploadForm.append('file', compressedBlob, `foto-${i}.webp`);
          uploadForm.append('propiedadId', propiedadId);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadForm,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            failedUploads.push(`Imagen ${i + 1}: ${errData.error || 'Error del servidor'}`);
          }
        } catch (err: any) {
          failedUploads.push(`Imagen ${i + 1}: ${err.message || 'Error de compresión'}`);
        }
      }

      // 3. Subir y comprimir videos (archivos)
      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        try {
          const compressedBlob = await compressVideo(file);
          const uploadForm = new FormData();
          uploadForm.append('file', compressedBlob, `video-${i}.webm`);
          uploadForm.append('propiedadId', propiedadId);
          uploadForm.append('esPrincipal', i === 0 ? '1' : '0');

          const uploadRes = await fetch('/api/upload-video', {
            method: 'POST',
            body: uploadForm,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            failedUploads.push(`Video ${i + 1}: ${errData.error || 'Error del servidor'}`);
          }
        } catch (err: any) {
          failedUploads.push(`Video ${i + 1}: ${err.message || 'Error de compresión'}`);
        }
      }

      // 4. Registrar videos externos (URLs)
      for (const videoUrl of videosUrls) {
        try {
          const res = await fetch('/api/videos/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propiedadId,
              urlExterno: videoUrl,
              esPrincipal: videoFiles.length === 0 ? 1 : 0,
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            failedUploads.push(`Video URL: ${errData.error || 'Error del servidor'}`);
          }
        } catch (err: any) {
          failedUploads.push(`Video URL: ${err.message || 'Error de red'}`);
        }
      }

      // Guardar errores de upload para mostrarlos al usuario
      if (failedUploads.length > 0) {
        setUploadErrors(failedUploads);
      }

      if (failedUploads.length === 0) {
        setSuccessMessage('¡Felicidades! Tu anuncio ha sido publicado con éxito y ya está optimizado para SEO.');
      } else {
        setSuccessMessage(`Anuncio publicado, pero ${failedUploads.length} archivo(s) no pudieron subirse. Revisa los errores abajo e intenta de nuevo.`);
      }
      
      // Limpiar Formulario
      setTitulo('');
      setDescripcion('');
      setPrecioPesos('');
      setPrecioUf('');
      setSuperficieTotal('');
      setContactoTelefono('');
      setObservaciones('');
      setDocumentos([]);
      setFotosFiles([]);
      setVideosUrls([]);
      setVideoFiles([]);

      // Redirigir a pestaña de propiedades
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setErrorMessage(err.message || 'Error general al guardar la propiedad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const comunasDisponibles = REGIONES_Y_COMUNAS.find(r => r.region === region)?.comunas || [];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header Premium */}
      <header className="bg-slate-950/80 backdrop-blur-md text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Propiedades & Parcelas
            </span>
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Dashboard Premium
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-400 hidden sm:inline">
              Hola, <span className="font-bold text-white">{userNombre}</span>
            </span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${infoPlanActual.css}`}>
              Plan: {infoPlanActual.nombre}
            </span>
            {planActual === 'admin' && (
              <a href="/admin" className="text-[11px] px-3 py-1 rounded-full border border-purple-500/50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 transform hover:scale-105">
                👑 Panel Admin
              </a>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner de bienvenida premium */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 text-white mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Gestiona tus anuncios e impulsa tus ventas</h1>
              <p className="text-indigo-200/80 mt-2 sm:text-lg leading-relaxed">
                Registra tus propiedades en Chile y destaca tus anuncios contratando un plan. Las publicaciones VIP obtienen máxima exposición y SEO Senior para motores de búsqueda como Google.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
                  Límite de Avisos: {propiedades.length} / {infoPlanActual.maxAvisos === 999999 ? 'Ilimitado' : infoPlanActual.maxAvisos}
                </span>
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
                  Imágenes permitidas: Hasta {infoPlanActual.maxFotos === 999999 ? 'Ilimitado' : infoPlanActual.maxFotos}
                </span>
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
                  Videos permitidos: Hasta {infoPlanActual.maxVideos === 999999 ? 'Ilimitado' : infoPlanActual.maxVideos}
                </span>
              </div>
            </div>
            {planActual === 'gratis' && (
              <button 
                onClick={() => setActiveTab('suscripciones')} 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-amber-500/10 shrink-0 transform hover:scale-[1.02]"
              >
                👑 Subir a Premium Flow
              </button>
            )}
          </div>
        </div>

        {/* Mensajes del Servidor */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-2xl mb-8 flex items-center justify-between animate-fadeIn">
            <div>
              <strong className="font-bold block">Error en la solicitud:</strong>
              <span className="text-sm">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-300 font-bold">&times;</button>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-4 rounded-2xl mb-8 animate-fadeIn">
            <strong className="font-bold block">¡Éxito!</strong>
            <span className="text-sm">{successMessage}</span>
          </div>
        )}
        {uploadErrors.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-2xl mb-8 animate-fadeIn">
            <strong className="font-bold block">⚠️ Problemas al subir archivos:</strong>
            <ul className="text-sm mt-2 list-disc list-inside space-y-1">
              {uploadErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <button 
              onClick={() => setUploadErrors([])} 
              className="text-amber-300 font-bold text-xs mt-2 underline"
            >
              Descartar avisos
            </button>
          </div>
        )}

        {/* Alianza con Asesoría Pública Cintillo Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-y border-indigo-900/40 py-2.5 text-center mb-8">
          <p className="text-xs text-indigo-300 font-medium">
            🤝 Plataforma de extensión de servicios de{' '}
            <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="underline hover:text-white font-bold text-indigo-200">
              www.asesoriapublica.cl
            </a>
          </p>
        </div>

        {/* Pestanas de Navegacion */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('avisos')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'avisos' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📋 Mis Publicaciones ({propiedades.length})
          </button>
          <button
            onClick={() => setActiveTab('publicar')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'publicar' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🆕 Publicar Nueva Propiedad
          </button>
          <button
            onClick={() => setActiveTab('suscripciones')}
            className={`py-4 px-6 font-extrabold text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'suscripciones' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            💎 Mi Suscripción y Planes Flow
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        
        {/* TABS 1: LISTADO DE PROPIEDADES */}
        {activeTab === 'avisos' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>Mis Publicaciones Activas</span>
              </h2>

              {propiedades.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
                  <p className="text-slate-400 text-lg font-medium">Aún no tienes propiedades publicadas.</p>
                  <p className="text-slate-500 text-sm mt-1 mb-6">Comienza hoy registrando un terreno, local o casa.</p>
                  <button 
                    onClick={() => setActiveTab('publicar')} 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
                  >
                    Publicar ahora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {propiedades.map((p) => {
                    const impulsado = p.prioridad_score > 0;
                    return (
                      <div 
                        key={p.id} 
                        className="bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
                              {p.tipo_propiedad === 'terreno' ? 'Terreno / Parcela' : p.tipo_propiedad === 'casa' ? 'Casa' : 'Local Comercial'}
                            </span>
                            {impulsado ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                                🚀 VIP Impulsado
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                                Estándar
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-white line-clamp-2 hover:text-indigo-400">
                            {p.titulo}
                          </h3>
                          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                            📍 {p.comuna}, {p.region}
                          </p>

                          <div className="mt-4 pt-4 border-t border-slate-800/60">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valor</span>
                            <p className="text-xl font-black text-white mt-0.5">
                              {p.precio_uf 
                                ? `${p.precio_uf} UF` 
                                : p.precio_pesos 
                                  ? `$${p.precio_pesos.toLocaleString('es-CL')} CLP` 
                                  : 'Consultar Precio'}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-950 border-t border-slate-850/60 flex items-center justify-between gap-3">
                          <a
                            href={`/${p.tipo_operacion}/${p.comuna}/${p.id}`}
                            target="_blank"
                            className="text-center w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all"
                          >
                            Ver Ficha
                          </a>
                          
                          {!impulsado && planActual === 'gratis' && (
                            <button
                              onClick={() => setActiveTab('suscripciones')}
                              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/5 flex items-center justify-center gap-1.5"
                            >
                              <span>Impulsar Plan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Publicitario de Asesoría Pública */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-900/40 p-6 rounded-3xl shadow-xl space-y-6">
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest block text-center">
                  Alianza Comercial
                </span>
                <div className="text-center space-y-3">
                  <h4 className="text-lg font-black text-white">¿Necesitas asesoría legal o saneamiento?</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Si estás vendiendo tu propiedad, regulariza tus títulos, herencias, planos y subdivisiones con los mejores profesionales de Chile.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Visita</span>
                  <a 
                    href="https://www.asesoriapublica.cl" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-400 hover:text-white font-extrabold text-sm underline block mt-0.5"
                  >
                    www.asesoriapublica.cl
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS 2: NUEVA PUBLICACION */}
        {activeTab === 'publicar' && (
          <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-850 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Publica tu Anuncio Comercial</h2>
            <p className="text-slate-400 text-sm mb-8">Completa el formulario premium. Tu anuncio contará con metadatos indexables automáticamente y carga optimizada de fotos.</p>

            <form onSubmit={handlePublish} className="space-y-8">
              
              {/* Sección 1: Tipo y Operación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">¿Qué tipo de propiedad publicas?</label>
                  <select 
                    value={tipoPropiedad} 
                    onChange={(e) => setTipoPropiedad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="terreno">Terreno / Parcela</option>
                    <option value="casa">Casa</option>
                    <option value="local">Local Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">¿Cuál es el tipo de transacción?</label>
                  <select 
                    value={tipoOperacion} 
                    onChange={(e) => setTipoOperacion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="venta">Venta</option>
                    <option value="compra">Compra</option>
                    <option value="arriendo">Arriendo</option>
                  </select>
                </div>
              </div>

              {/* Sección 2: Título y Descripción */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título del Anuncio (Atractivo y descriptivo)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Parcela Plana de 5.000m2 con Rol Propio en Melipilla" 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción Detallada (Incluye accesos, agua, luz)</label>
                  <textarea 
                    rows={6}
                    placeholder="Describe en detalle tu propiedad..." 
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Sección 3: Precio y Medidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Precio en Pesos (CLP)</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 45000000" 
                    value={precioPesos}
                    onChange={(e) => setPrecioPesos(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Precio en UF (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ej. 1200" 
                    value={precioUf}
                    onChange={(e) => setPrecioUf(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Superficie Total (m²)</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 5000" 
                    value={superficieTotal}
                    onChange={(e) => setSuperficieTotal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Características adicionales si no es terreno */}
              {tipoPropiedad !== 'terreno' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dormitorios / Habitaciones</label>
                    <input 
                      type="number" 
                      value={habitaciones}
                      onChange={(e) => setHabitaciones(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Baños</label>
                    <input 
                      type="number" 
                      value={banos}
                      onChange={(e) => setBanos(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Sección 4: Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Región</label>
                  <select 
                    value={region} 
                    onChange={(e) => {
                      setRegion(e.target.value);
                      const regObj = REGIONES_Y_COMUNAS.find(r => r.region === e.target.value);
                      if (regObj) setComuna(regObj.comunas[0]);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {REGIONES_Y_COMUNAS.map(r => (
                      <option key={r.region} value={r.region}>{r.region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comuna</label>
                  <select 
                    value={comuna} 
                    onChange={(e) => setComuna(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {comunasDisponibles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección 5: Datos de Contacto y Observaciones */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 space-y-6">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">Información del Vendedor (Seriedad)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Vendedor</label>
                    <input 
                      type="text" 
                      value={contactoNombre}
                      onChange={(e) => setContactoNombre(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teléfono de Contacto</label>
                    <input 
                      type="text" 
                      placeholder="Ej. +56912345678"
                      value={contactoTelefono}
                      onChange={(e) => setContactoTelefono(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email de Contacto</label>
                    <input 
                      type="email" 
                      value={contactoEmail}
                      onChange={(e) => setContactoEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones Internas / Horarios de visita</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Coordinar visitas solo fines de semana, posee factibilidad real a 5 metros"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Sección 6: Documentación legal (Rol, Escritura) */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">📂 Documentación Checklist Legal</h3>
                <p className="text-slate-400 text-xs">Selecciona los documentos que tienes disponibles físicamente. Esto aumentará la confianza del comprador e impulsará tu anuncio.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {DOCUMENTOS_OPCIONES.map(doc => (
                    <label key={doc} className="flex items-start space-x-3 text-slate-300 text-xs font-medium cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={documentos.includes(doc)}
                        onChange={() => handleDocumentoToggle(doc)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 mt-0.5"
                      />
                      <span>{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sección 7: Fotografías con canvas compression en el browser */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">📷 Fotografías del Aviso</h3>
                <p className="text-slate-400 text-xs">
                  Tu plan <strong>{infoPlanActual.nombre}</strong> permite subir hasta <strong>{infoPlanActual.maxFotos === 999999 ? 'Ilimitadas' : infoPlanActual.maxFotos} fotos</strong>.
                  <br />
                  <span className="text-indigo-300">💡 Las fotos son comprimidas localmente a WebP (~150KB) antes de subirse para una velocidad de carga instantánea.</span>
                </p>

                <div className="flex items-center justify-center w-full mt-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer bg-slate-950 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Presiona para cargar fotos</span>
                      <p className="text-slate-600 text-[10px] mt-1">Soporta PNG, JPG, JPEG (Máx {infoPlanActual.maxFotos === 999999 ? 'Ilimitadas' : infoPlanActual.maxFotos} fotos)</p>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFotoChange}
                      className="hidden" 
                      disabled={fotosFiles.length >= infoPlanActual.maxFotos}
                    />
                  </label>
                </div>

                {fotosFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {fotosFiles.map((file, idx) => (
                      <div key={idx} className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-24 object-cover" 
                        />
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button" 
                            onClick={() => removeFoto(idx)}
                            className="bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold hover:bg-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 8: Videos */}
              {infoPlanActual.maxVideos > 0 && (
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">🎥 Videos de la Propiedad</h3>
                  <p className="text-slate-400 text-xs">
                    Tu plan permite registrar hasta <strong>{infoPlanActual.maxVideos === 999999 ? 'Ilimitados' : infoPlanActual.maxVideos} videos</strong>. Puedes subir archivos de video (se comprimirán a 854px de ancho) o pegar enlaces de YouTube/Vimeo.
                  </p>

                  {/* Subida de archivos de video */}
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer bg-slate-950 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subir archivo de video</span>
                        <p className="text-slate-600 text-[10px] mt-1">MP4, WebM, MOV (se comprime automáticamente)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideoFileChange}
                        className="hidden" 
                        disabled={videoFiles.length + videosUrls.length >= infoPlanActual.maxVideos}
                      />
                    </label>
                    {videoFiles.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {videoFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                            <span className="truncate max-w-md text-slate-300">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeVideoFile(idx)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-slate-500 text-[10px] mb-2">O pega enlaces externos (YouTube, Vimeo):</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ej. https://www.youtube.com/watch?v=..."
                        value={videoInputUrl}
                        onChange={(e) => setVideoInputUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs placeholder-slate-600"
                      />
                      <button 
                        type="button"
                        onClick={addVideoUrl}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-xl transition-all"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>

                  {videosUrls.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {videosUrls.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                          <span className="truncate max-w-md">{url}</span>
                          <button 
                            type="button" 
                            onClick={() => removeVideoUrl(idx)}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Botón de Publicación */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/10 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? 'Comprimiendo fotos y subiendo aviso...' : '🚀 Publicar Aviso Optimizado para SEO'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TABS 3: MI SUSCRIPCION / PLANES FLOW */}
        {activeTab === 'suscripciones' && (
          <div className="space-y-12">
            
            {/* Estado actual de suscripción */}
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Estado de tu Cuenta</span>
                <h3 className="text-2xl font-black text-white">Suscripción actual: {infoPlanActual.nombre}</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Tienes activa la modalidad {infoPlanActual.nombre} con tarifas de {infoPlanActual.CLP} mensuales. 
                  {userProfile.plan_expiracion && (
                    <span> Expiración: <strong className="text-indigo-300">{new Date(userProfile.plan_expiracion).toLocaleDateString('es-CL')}</strong>.</span>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>Avisos Activos: <strong>{propiedades.length} de {infoPlanActual.maxAvisos === 999999 ? 'Ilimitados' : infoPlanActual.maxAvisos}</strong></span>
                  <span>Fotos por aviso: <strong>Máx {infoPlanActual.maxFotos === 999999 ? 'Ilimitadas' : infoPlanActual.maxFotos}</strong></span>
                  <span>Videos por aviso: <strong>Máx {infoPlanActual.maxVideos === 999999 ? 'Ilimitados' : infoPlanActual.maxVideos}</strong></span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center shrink-0 w-full md:w-auto">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tu tarifa</span>
                <p className="text-3xl font-black text-white mt-1">{infoPlanActual.CLP}</p>
                <span className="text-slate-500 text-[10px] mt-0.5 block">por mes</span>
              </div>
            </div>

            {/* Selector de Planes Premium */}
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-10">
                <h3 className="text-2xl font-black text-white">Llega a miles de compradores y potencia tu SEO</h3>
                <p className="text-slate-400 text-sm mt-2">
                  Actualiza tu plan con Flow vinculando cualquier tarjeta de débito o crédito en Chile. Activación y ampliación de límites al instante.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Plan 10K */}
                <div className="bg-slate-950 border border-slate-850 hover:border-indigo-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:scale-[1.02]">
                  <div className="space-y-4">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest inline-block">Plan 10K</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">$10.000</span>
                      <span className="text-slate-500 text-xs ml-1">/ mes</span>
                    </div>
                    <p className="text-slate-400 text-xs">Exposición media del aviso e impulso inicial de indexación en buscadores.</p>
                    <ul className="space-y-2 pt-4 text-xs text-slate-300 font-medium">
                      <li className="flex items-center gap-2">✅ Hasta <strong>4 Avisos Activos</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>8 Fotografías</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>1 Video</strong> (Enlace)</li>
                      <li className="flex items-center gap-2">✅ Impulso de Búsqueda Medio</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => iniciarCompraSuscripcion('plan_10k')}
                    disabled={loadingId !== null}
                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {loadingId === 'plan_10k' ? 'Procesando...' : 'Contratar Plan 10K'}
                  </button>
                </div>

                {/* Plan 20K */}
                <div className="bg-slate-950 border-2 border-indigo-500/40 relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.02]">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Recomendado 🔥
                  </span>
                  <div className="space-y-4">
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest inline-block">Plan 20K</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">$20.000</span>
                      <span className="text-slate-500 text-xs ml-1">/ mes</span>
                    </div>
                    <p className="text-slate-400 text-xs">Exposición alta de tu aviso y posicionamiento premium con microformatos inmobiliarios.</p>
                    <ul className="space-y-2 pt-4 text-xs text-slate-300 font-medium">
                      <li className="flex items-center gap-2">✅ Hasta <strong>10 Avisos Activos</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>20 Fotografías</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>3 Videos</strong> (MP4 / Enlace)</li>
                      <li className="flex items-center gap-2">✅ Impulso de Búsqueda Alto</li>
                      <li className="flex items-center gap-2 text-indigo-400">✨ Indexación Google Rich Snippets</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => iniciarCompraSuscripcion('plan_20k')}
                    disabled={loadingId !== null}
                    className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {loadingId === 'plan_20k' ? 'Procesando...' : 'Contratar Plan 20K'}
                  </button>
                </div>

                {/* Plan 50K */}
                <div className="bg-slate-950 border border-slate-850 hover:border-amber-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all hover:scale-[1.02]">
                  <div className="space-y-4">
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest inline-block">Plan 50K</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">$50.000</span>
                      <span className="text-slate-500 text-xs ml-1">/ mes</span>
                    </div>
                    <p className="text-slate-400 text-xs">Para corredores y empresas inmobiliarias que requieren máxima prioridad y volumen.</p>
                    <ul className="space-y-2 pt-4 text-xs text-slate-300 font-medium">
                      <li className="flex items-center gap-2">✅ Hasta <strong>50 Avisos Activos</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>30 Fotografías</strong></li>
                      <li className="flex items-center gap-2">✅ Hasta <strong>10 Videos</strong> (MP4 / Enlace)</li>
                      <li className="flex items-center gap-2">✅ Exposición Absoluta de Prioridad</li>
                      <li className="flex items-center gap-2 text-amber-400">✨ Campaña SEO y microdatos de Agencia</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => iniciarCompraSuscripcion('plan_50k')}
                    disabled={loadingId !== null}
                    className="w-full mt-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {loadingId === 'plan_50k' ? 'Procesando...' : 'Contratar Plan 50K'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer Alianza */}
      <footer className="bg-slate-950 border-t border-slate-850 py-10 mt-20 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p>
            © {new Date().getFullYear()} Propiedades & Parcelas Chile. Todos los derechos reservados.
          </p>
          <p>
            Alianza exclusiva con{' '}
            <a href="https://www.asesoriapublica.cl" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white font-bold underline">
              Asesoría Pública Legal (www.asesoriapublica.cl)
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
