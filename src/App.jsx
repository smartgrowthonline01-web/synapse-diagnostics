import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { 
  Stethoscope, Target, MessageCircle, Play, Zap, Globe, Brain, 
  ChevronRight, ChevronDown, AlertTriangle, CheckCircle, XCircle,
  Loader2, Sparkles, Shield, Rocket, Crown, Activity, Eye,
  Users, DollarSign, Filter, Video, Layers, ArrowRight,
  RefreshCw, Lock, TrendingUp, TrendingDown, AlertCircle, Mail, Phone
} from 'lucide-react';
import { saveDiagnostic } from './lib/saveDiagnostic'
export default function SynapseDiagnostics() {
  // ==================== STATE ====================
  const [currentScreen, setCurrentScreen] = useState('inicio');
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosticoResult, setDiagnosticoResult] = useState(null);
  
  // Datos del prospecto (se llenan desde PantallaInicio)
  const [nombreProspecto, setNombreProspecto] = useState('');
  const [emailProspecto, setEmailProspecto] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [facturacion, setFacturacion] = useState('');

  // Datos de captura estratégica (7 dimensiones)
  const [captura, setCaptura] = useState({
    // GLAS - Tráfico y Publicidad
    glas: {
      correAnuncios: null, // si/no
      tiposCampana: [], // awareness, trafico, conversiones, advantage+
      claridadPerfil: 3, // 1-5
      excluyeNoAplica: null, // si/no
      calidadLead: 3, // 1-5
      // Métricas de Ads
      inversionMensual: '', // USD
      cpm: '', // Costo por mil
      ctr: '', // % click-through rate
      cpc: '', // Costo por clic
      cpl: '', // Costo por lead
      cpa: '', // Costo por adquisición
      ticketPromedio: '', // Valor promedio de venta
    },
    // Nexus - Mensaje y Creativos
    nexus: {
      usaVideoAds: null,
      mencionaRequisitos: null,
      mencionaPrecio: null,
      identificaClienteIdeal: 3,
      rechazaNoAplicante: null,
    },
    // Filter - Conversación y Calificación
    filter: {
      tieneBot: null,
      preguntaPresupuesto: null,
      preguntaNecesidad: null,
      preguntaUrgencia: null,
      frecuenciaNoCalificados: '', // frecuente/ocasional/nunca
    },
    // Flow - Nurturing
    flow: {
      tieneVSL: null,
      tieneSecuenciaSeguimiento: null,
      seguimientoTipo: '', // manual/automatico/mixto
      gestionLeadsFrios: '', // nada/basico/estructurado
      porcentajeEnfriamiento: 3, // 1-5 (1=bajo, 5=alto)
    },
    // Close - Cierre y Conversión
    close: {
      llamadasAgendadas: '', // número mensual
      llamadasRealizadas: '', // asistieron
      ventasCerradas: '', // ventas efectivas
    },
    // GEM - Contenido Orgánico
    gem: {
      publicaOrganico: null,
      frecuenciaPublicacion: '', // nunca/esporadico/semanal/diario
      coherenciaPaidOrganico: 3,
      preparaParaVenta: null,
      refuerzoAutoridad: 3,
    },
    // Escalabilidad
    escalabilidad: {
      facturacionMensual: '', // <5k/5-10k/10-20k/>20k
      capacidadInversion: '', // <1k/1-3k/3-5k/>5k
      capacidadOperativa: 3,
      dependenciaDueno: null,
      aperturaASistemas: 3,
    },
  });

  // Secciones expandidas
  const [expanded, setExpanded] = useState({
    glas: true,
    nexus: false,
    filter: false,
    flow: false,
    close: false,
    gem: false,
    escalabilidad: false,
  });

  // ==================== ESTILOS ====================
  const glass = {
    background: 'rgba(15, 15, 35, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const neon = (color, intensity = 0.5) => ({
    boxShadow: `0 0 20px rgba(${color}, ${intensity}), 0 0 40px rgba(${color}, ${intensity * 0.4}), inset 0 0 15px rgba(${color}, 0.08)`,
  });

  const neonText = (color) => ({
    textShadow: `0 0 10px rgba(${color}, 0.8), 0 0 20px rgba(${color}, 0.4)`,
  });

  // ==================== HELPERS ====================
  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateCaptura = (dimension, field, value) => {
    setCaptura(prev => ({
      ...prev,
      [dimension]: { ...prev[dimension], [field]: value },
    }));
  };

  const calcularProgreso = (dimension) => {
    const data = captura[dimension];
    const campos = Object.values(data);
    const completados = campos.filter(v => v !== null && v !== '' && v !== 3).length;
    return Math.round((completados / campos.length) * 100);
  };

  const calcularProgresoTotal = () => {
    const dimensiones = ['glas', 'nexus', 'filter', 'flow', 'close', 'gem', 'escalabilidad'];
    const progresos = dimensiones.map(d => calcularProgreso(d));
    return Math.round(progresos.reduce((a, b) => a + b, 0) / dimensiones.length);
  };

  // ==================== SCORING ====================
  const calcularScoring = () => {
    const scores = {
      glas: 0,
      nexus: 0,
      filter: 0,
      flow: 0,
      close: 0,
      gem: 0,
      escalabilidad: 0,
    };

    // GLAS Scoring
    const g = captura.glas;
    if (g.correAnuncios === 'si') scores.glas += 0.5;
    if (g.tiposCampana.includes('conversiones') || g.tiposCampana.includes('advantage+')) scores.glas += 0.5;
    if (g.claridadPerfil >= 4) scores.glas += 0.5;
    if (g.excluyeNoAplica === 'si') scores.glas += 0.5;
    
    // Métricas de Ads
    if (g.ctr && parseFloat(g.ctr) >= 1.5) scores.glas += 0.5; // CTR saludable
    if (g.ticketPromedio && g.cpa) {
      const roas = parseFloat(g.ticketPromedio) / parseFloat(g.cpa);
      if (roas >= 3) scores.glas += 1; // ROAS excelente
      else if (roas >= 2) scores.glas += 0.5; // ROAS aceptable
    }
    if (g.cpl && parseFloat(g.cpl) <= 10) scores.glas += 0.5; // CPL eficiente

    // Nexus Scoring
    const n = captura.nexus;
    if (n.usaVideoAds === 'si') scores.nexus += 1;
    if (n.mencionaRequisitos === 'si') scores.nexus += 1;
    if (n.mencionaPrecio === 'si') scores.nexus += 0.5;
    if (n.identificaClienteIdeal >= 4) scores.nexus += 1;
    if (n.rechazaNoAplicante === 'si') scores.nexus += 1;

    // Filter Scoring
    const f = captura.filter;
    if (f.tieneBot === 'si') scores.filter += 1;
    if (f.preguntaPresupuesto === 'si') scores.filter += 1;
    if (f.preguntaNecesidad === 'si') scores.filter += 1;
    if (f.preguntaUrgencia === 'si') scores.filter += 0.5;
    if (f.frecuenciaNoCalificados === 'nunca') scores.filter += 0.5;

    // Flow Scoring
    const fl = captura.flow;
    if (fl.tieneVSL === 'si') scores.flow += 1.5;
    if (fl.tieneSecuenciaSeguimiento === 'si') scores.flow += 1;
    if (fl.seguimientoTipo === 'automatico') scores.flow += 1;
    if (fl.gestionLeadsFrios === 'estructurado') scores.flow += 0.5;

    // Close Scoring
    const cl = captura.close;
    if (cl.llamadasAgendadas && cl.llamadasRealizadas) {
      const tasaAsistencia = (parseFloat(cl.llamadasRealizadas) / parseFloat(cl.llamadasAgendadas)) * 100;
      if (tasaAsistencia >= 70) scores.close += 1.5;
      else if (tasaAsistencia >= 50) scores.close += 1;
      else scores.close += 0.5;
    }
    if (cl.llamadasRealizadas && cl.ventasCerradas) {
      const tasaCierre = (parseFloat(cl.ventasCerradas) / parseFloat(cl.llamadasRealizadas)) * 100;
      if (tasaCierre >= 30) scores.close += 2;
      else if (tasaCierre >= 20) scores.close += 1.5;
      else if (tasaCierre >= 10) scores.close += 1;
      else scores.close += 0.5;
    }

    // GEM Scoring
    const ge = captura.gem;
    if (ge.publicaOrganico === 'si') scores.gem += 1;
    if (ge.frecuenciaPublicacion === 'diario' || ge.frecuenciaPublicacion === 'semanal') scores.gem += 1;
    if (ge.coherenciaPaidOrganico >= 4) scores.gem += 1;
    if (ge.preparaParaVenta === 'si') scores.gem += 0.5;
    if (ge.refuerzoAutoridad >= 4) scores.gem += 0.5;

    // Escalabilidad Scoring
    const e = captura.escalabilidad;
    if (e.facturacionMensual === '10-20k' || e.facturacionMensual === '>20k') scores.escalabilidad += 1.5;
    else if (e.facturacionMensual === '5-10k') scores.escalabilidad += 1;
    if (e.capacidadInversion === '3-5k' || e.capacidadInversion === '>5k') scores.escalabilidad += 1;
    if (e.capacidadOperativa >= 4) scores.escalabilidad += 0.5;
    if (e.dependenciaDueno === 'no') scores.escalabilidad += 0.5;
    if (e.aperturaASistemas >= 4) scores.escalabilidad += 0.5;

    // Normalizar a escala 0-4
    return {
      glas: Math.min(4, scores.glas),
      nexus: Math.min(4, scores.nexus),
      filter: Math.min(4, scores.filter),
      flow: Math.min(4, scores.flow),
      close: Math.min(4, scores.close),
      gem: Math.min(4, scores.gem),
      escalabilidad: Math.min(4, scores.escalabilidad),
    };
  };

  const determinarNivel = (scores) => {
    const min = Math.min(...Object.values(scores));
    const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 7;

    // Reglas de bloqueo
    if (scores.glas === 0 || scores.nexus === 0 || scores.filter === 0) {
      return 'no_apto';
    }

    // Reglas de clasificación
    if (avg >= 3.2 && min >= 2.5 && 
        (facturacion === '>20k' || facturacion === '10-20k')) {
      return 'scale';
    }

    if (avg >= 2.2 && min >= 1.5 && 
        (facturacion !== '<5k')) {
      return 'growth';
    }

    if (avg >= 1 && min >= 0.5) {
      return 'launch';
    }

    return 'no_apto';
  };

  const identificarCuelloBotella = (scores) => {
    const labels = {
      glas: 'Estructura de Campañas',
      nexus: 'Mensaje y Filtrado',
      filter: 'Calificación de Leads',
      flow: 'Nurturing y Seguimiento',
      close: 'Proceso de Cierre',
      gem: 'Contenido Orgánico',
      escalabilidad: 'Capacidad de Escalar',
    };

    const min = Math.min(...Object.values(scores));
    const dimension = Object.keys(scores).find(k => scores[k] === min);
    return { dimension, label: labels[dimension], score: min };
  };

  const identificarRiesgos = (scores, cuello) => {
    const riesgos = [];
    const g = captura.glas;

    // Riesgos basados en métricas de ads
    if (g.ticketPromedio && g.cpa) {
      const roas = parseFloat(g.ticketPromedio) / parseFloat(g.cpa);
      if (roas < 2) {
        riesgos.push({
          nivel: 'alto',
          texto: `ROAS de ${roas.toFixed(1)}x es insostenible. Por cada $1 invertido se recuperan $${roas.toFixed(2)}`,
        });
      }
    }

    if (g.ctr && parseFloat(g.ctr) < 1) {
      riesgos.push({
        nivel: 'medio',
        texto: `CTR de ${g.ctr}% indica que los creativos no captan atención. El benchmark mínimo es 1.5%`,
      });
    }

    if (g.cpl && g.cpa) {
      const leadsParaVenta = parseFloat(g.cpa) / parseFloat(g.cpl);
      if (leadsParaVenta > 50) {
        riesgos.push({
          nivel: 'alto',
          texto: `Se necesitan ${Math.round(leadsParaVenta)} leads para una venta. El embudo tiene fugas críticas`,
        });
      }
    }

    if (scores.filter < 2) {
      riesgos.push({
        nivel: 'alto',
        texto: 'Leads no calificados consumen tiempo valioso de cierre',
      });
    }

    if (scores.nexus < 2) {
      riesgos.push({
        nivel: 'alto',
        texto: 'El anuncio atrae curiosos en lugar de prospectos reales',
      });
    }

    if (scores.glas < 2 && g.correAnuncios === 'si') {
      riesgos.push({
        nivel: 'medio',
        texto: 'La inversión publicitaria no está optimizada para la IA de Meta',
      });
    }

    if (scores.flow < 2 && captura.flow.tieneVSL === 'no') {
      riesgos.push({
        nivel: 'medio',
        texto: 'Sin VSL, el lead llega frío a la llamada',
      });
    }

    // Riesgos de Close
    const cl = captura.close;
    if (cl.llamadasAgendadas && cl.llamadasRealizadas) {
      const tasaAsistencia = (parseFloat(cl.llamadasRealizadas) / parseFloat(cl.llamadasAgendadas)) * 100;
      if (tasaAsistencia < 50) {
        riesgos.push({
          nivel: 'alto',
          texto: `Tasa de asistencia de ${tasaAsistencia.toFixed(0)}% indica problema grave de no-shows`,
        });
      }
    }
    if (cl.llamadasRealizadas && cl.ventasCerradas) {
      const tasaCierre = (parseFloat(cl.ventasCerradas) / parseFloat(cl.llamadasRealizadas)) * 100;
      if (tasaCierre < 15) {
        riesgos.push({
          nivel: 'alto',
          texto: `Tasa de cierre de ${tasaCierre.toFixed(0)}% sugiere desalineación entre lead y oferta`,
        });
      }
    }

    if (scores.gem < 1.5 && captura.gem.publicaOrganico === 'si') {
      riesgos.push({
        nivel: 'bajo',
        texto: 'Desalineación entre contenido orgánico y pagado confunde al prospecto',
      });
    }

    if (captura.escalabilidad.dependenciaDueno === 'si' && scores.escalabilidad < 2) {
      riesgos.push({
        nivel: 'medio',
        texto: 'Dependencia del dueño limita capacidad de crecimiento',
      });
    }

    return riesgos.slice(0, 4);
  };

  // ==================== CONFIGURACIÓN WEBHOOK ====================
  // Cambiar esta URL por tu webhook de N8N
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || '';

  const enviarDatosWebhook = async (resultado) => {
    if (!WEBHOOK_URL) {
      console.log('Webhook no configurado - datos del diagnóstico:', resultado);
      return;
    }

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        prospecto: {
          nombre: nombreProspecto,
          email: emailProspecto,
          tipoNegocio: tipoNegocio,
          facturacion: facturacion,
        },
        captura: captura,
        resultado: {
          nivel: resultado.nivel,
          cuelloBotella: resultado.cuello,
          scores: resultado.scores,
          riesgos: resultado.riesgos,
          diagnosticoCentral: resultado.diagnosticoCentral,
          advertencia: resultado.advertencia,
        },
        metricas: {
          // Métricas de Ads
          inversionMensual: captura.glas.inversionMensual,
          cpl: captura.glas.cpl,
          cpa: captura.glas.cpa,
          ticketPromedio: captura.glas.ticketPromedio,
          roas: captura.glas.ticketPromedio && captura.glas.cpa 
            ? (parseFloat(captura.glas.ticketPromedio) / parseFloat(captura.glas.cpa)).toFixed(2) 
            : null,
          // Métricas de Cierre
          llamadasAgendadas: captura.close.llamadasAgendadas,
          llamadasRealizadas: captura.close.llamadasRealizadas,
          ventasCerradas: captura.close.ventasCerradas,
          tasaCierre: captura.close.llamadasRealizadas && captura.close.ventasCerradas
            ? ((parseFloat(captura.close.ventasCerradas) / parseFloat(captura.close.llamadasRealizadas)) * 100).toFixed(1)
            : null,
        },
      };

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Datos enviados al webhook correctamente');
    } catch (error) {
      console.error('Error enviando datos al webhook:', error);
    }
  };

  // ==================== PROCESAMIENTO ====================
  const procesarDiagnostico = async () => {
    setIsProcessing(true);
    setCurrentScreen('procesando');

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 3500));

    const scores = calcularScoring();
    const nivel = determinarNivel(scores);
    const cuello = identificarCuelloBotella(scores);
    const riesgos = identificarRiesgos(scores, cuello);

    // Generar diagnóstico central basado en el cuello de botella
    let diagnosticoCentral = '';
    let advertencia = '';

    switch (cuello.dimension) {
      case 'glas':
        diagnosticoCentral = 'El sistema de adquisición no está alineado con la inteligencia artificial de Meta. La inversión publicitaria genera volumen, no calidad.';
        advertencia = 'Escalar presupuesto en este momento multiplicaría el desperdicio, no los resultados.';
        break;
      case 'nexus':
        diagnosticoCentral = 'El mensaje publicitario no filtra. El anuncio atrae a cualquiera que tenga curiosidad, no a quien tiene el problema y los recursos para resolverlo.';
        advertencia = 'Más creativos con el mismo enfoque solo traerán más leads basura.';
        break;
      case 'filter':
        diagnosticoCentral = 'No existe calificación antes de la llamada. El tiempo de cierre se invierte en prospectos que nunca comprarán.';
        advertencia = 'Agregar más llamadas sin filtrar primero solo aumentará frustración y costos.';
        break;
      case 'flow':
        diagnosticoCentral = 'El lead llega frío a la conversación de venta. Sin nurturing, el closer debe educar y vender al mismo tiempo.';
        advertencia = 'Aumentar volumen de agendamientos sin calentar primero reducirá la tasa de cierre.';
        break;
      case 'close':
        diagnosticoCentral = 'El proceso de cierre tiene fugas significativas. Demasiados prospectos se pierden entre el agendamiento y la venta.';
        advertencia = 'Generar más agendamientos sin mejorar el proceso de cierre solo aumentará la frustración del equipo comercial.';
        break;
      case 'gem':
        diagnosticoCentral = 'Existe desconexión entre lo que el prospecto ve en orgánico y lo que recibe en paid. Esto genera confusión y reduce confianza.';
        advertencia = 'Publicar más contenido sin alineación estratégica diluye la autoridad percibida.';
        break;
      case 'escalabilidad':
        diagnosticoCentral = 'La operación actual no soportaría un aumento significativo de demanda. El sistema depende demasiado de intervención manual.';
        advertencia = 'Escalar antes de sistematizar generaría cuellos de botella operativos.';
        break;
      default:
        diagnosticoCentral = 'El sistema presenta múltiples puntos de fricción que impiden un crecimiento predecible.';
        advertencia = 'Es necesario corregir la base antes de escalar.';
    }

    const resultadoFinal = {
      scores,
      nivel,
      cuello,
      riesgos,
      diagnosticoCentral,
      advertencia,
      radarData: [
        { dimension: 'GLAS', value: scores.glas, fullMark: 4 },
        { dimension: 'Nexus', value: scores.nexus, fullMark: 4 },
        { dimension: 'Filter', value: scores.filter, fullMark: 4 },
        { dimension: 'Flow', value: scores.flow, fullMark: 4 },
        { dimension: 'Close', value: scores.close, fullMark: 4 },
        { dimension: 'GEM', value: scores.gem, fullMark: 4 },
        { dimension: 'Escala', value: scores.escalabilidad, fullMark: 4 },
      ],
    };

    // Enviar datos al webhook para nurturing
    // Enviar datos al webhook para nurturing
    await enviarDatosWebhook(resultadoFinal);

    // Guardar en Supabase
    try {
      const diagnosticoGuardado = await saveDiagnostic({
        prospecto: {
          nombre: nombreProspecto,
          email: emailProspecto,
          tipoNegocio: tipoNegocio,
          facturacion: facturacion,
        },
        captura: captura,
        resultado: resultadoFinal
      });
      console.log('Diagnóstico guardado con ID:', diagnosticoGuardado.id);
    } catch (error) {
      console.error('Error guardando en Supabase:', error);
    }

    setDiagnosticoResult(resultadoFinal);
    setCurrentScreen('resultado');
    setIsProcessing(false);
  };

  // ==================== COMPONENTES UI ====================
  
  // Botón Si/No
  const BtnSiNo = ({ value, onChange, disabled = false }) => (
    <div className="flex gap-2">
      {['si', 'no'].map(opt => (
        <button
          key={opt}
          onClick={() => !disabled && onChange(opt)}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === opt
              ? opt === 'si'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          {opt === 'si' ? 'Sí' : 'No'}
        </button>
      ))}
    </div>
  );

  // Slider visual
  const SliderVisual = ({ value, onChange, labels = ['Bajo', 'Alto'] }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-3 rounded-full transition-all ${
              n <= value
                ? n <= 2 ? 'bg-red-500' : n <= 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-gray-400">{value}/5</p>
    </div>
  );

  // Select estilizado
  const SelectStyled = ({ value, onChange, options, placeholder }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
    >
      <option value="" className="bg-gray-900">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
      ))}
    </select>
  );

  // Multi-select chips
  const ChipsMulti = ({ values, onChange, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => {
            const newValues = values.includes(opt.value)
              ? values.filter(v => v !== opt.value)
              : [...values, opt.value];
            onChange(newValues);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            values.includes(opt.value)
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Componente para métricas de ads con estado local (evita re-renders)
  const MetricasAdsInput = ({ valores, onUpdate }) => {
    const [local, setLocal] = useState({
      inversionMensual: valores.inversionMensual || '',
      ticketPromedio: valores.ticketPromedio || '',
      cpm: valores.cpm || '',
      ctr: valores.ctr || '',
      cpc: valores.cpc || '',
      cpl: valores.cpl || '',
      cpa: valores.cpa || '',
    });

    const handleChange = (campo, valor) => {
      setLocal(prev => ({ ...prev, [campo]: valor }));
    };

    const handleBlur = (campo) => {
      onUpdate(campo, local[campo]);
    };

    const inputClass = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50";

    // Calcular métricas en tiempo real con estado local
    const roas = local.ticketPromedio && local.cpa ? (parseFloat(local.ticketPromedio) / parseFloat(local.cpa)) : null;
    const leadsParaVenta = local.cpa && local.cpl ? Math.round(parseFloat(local.cpa) / parseFloat(local.cpl)) : null;
    const ventasMes = local.inversionMensual && local.cpa ? Math.round(parseFloat(local.inversionMensual) / parseFloat(local.cpa)) : null;
    const ingresoMes = ventasMes && local.ticketPromedio ? ventasMes * parseFloat(local.ticketPromedio) : null;

    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Inversión Mensual (USD)</label>
            <input
              type="number"
              value={local.inversionMensual}
              onChange={(e) => handleChange('inversionMensual', e.target.value)}
              onBlur={() => handleBlur('inversionMensual')}
              placeholder="Ej: 2000"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ticket Promedio (USD)</label>
            <input
              type="number"
              value={local.ticketPromedio}
              onChange={(e) => handleChange('ticketPromedio', e.target.value)}
              onBlur={() => handleBlur('ticketPromedio')}
              placeholder="Ej: 2500"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CPM ($)</label>
            <input
              type="number"
              step="0.01"
              value={local.cpm}
              onChange={(e) => handleChange('cpm', e.target.value)}
              onBlur={() => handleBlur('cpm')}
              placeholder="Ej: 12.50"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CTR (%)</label>
            <input
              type="number"
              step="0.01"
              value={local.ctr}
              onChange={(e) => handleChange('ctr', e.target.value)}
              onBlur={() => handleBlur('ctr')}
              placeholder="Ej: 1.8"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CPC ($)</label>
            <input
              type="number"
              step="0.01"
              value={local.cpc}
              onChange={(e) => handleChange('cpc', e.target.value)}
              onBlur={() => handleBlur('cpc')}
              placeholder="Ej: 0.85"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">CPL ($)</label>
            <input
              type="number"
              step="0.01"
              value={local.cpl}
              onChange={(e) => handleChange('cpl', e.target.value)}
              onBlur={() => handleBlur('cpl')}
              placeholder="Ej: 5.20"
              className={inputClass}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">CPA - Costo por Venta ($)</label>
            <input
              type="number"
              step="0.01"
              value={local.cpa}
              onChange={(e) => handleChange('cpa', e.target.value)}
              onBlur={() => handleBlur('cpa')}
              placeholder="Ej: 150"
              className={inputClass}
            />
          </div>
        </div>

        {/* Métricas Calculadas en Tiempo Real */}
        {roas && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 mb-2">Métricas Calculadas</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">ROAS</p>
                <p className={`text-lg font-bold ${roas >= 3 ? 'text-emerald-400' : roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {roas.toFixed(1)}x
                </p>
              </div>
              {leadsParaVenta && (
                <div>
                  <p className="text-xs text-gray-400">Leads por Venta</p>
                  <p className="text-lg font-bold text-purple-400">{leadsParaVenta}</p>
                </div>
              )}
              {ventasMes && (
                <div>
                  <p className="text-xs text-gray-400">Ventas/Mes Est.</p>
                  <p className="text-lg font-bold text-blue-400">{ventasMes}</p>
                </div>
              )}
              {ingresoMes && (
                <div>
                  <p className="text-xs text-gray-400">Ingreso Est./Mes</p>
                  <p className="text-lg font-bold text-emerald-400">${ingresoMes.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  // Componente para métricas de cierre con estado local
  const CloseInput = ({ valores, onUpdate }) => {
    const [local, setLocal] = useState({
      llamadasAgendadas: valores.llamadasAgendadas || '',
      llamadasRealizadas: valores.llamadasRealizadas || '',
      ventasCerradas: valores.ventasCerradas || '',
    });

    const handleChange = (campo, valor) => {
      setLocal(prev => ({ ...prev, [campo]: valor }));
    };

    const handleBlur = (campo) => {
      onUpdate(campo, local[campo]);
    };

    const inputClass = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50";

    // Calcular métricas en tiempo real
    const tasaAsistencia = local.llamadasAgendadas && local.llamadasRealizadas 
      ? ((parseFloat(local.llamadasRealizadas) / parseFloat(local.llamadasAgendadas)) * 100) 
      : null;
    const tasaCierre = local.llamadasRealizadas && local.ventasCerradas 
      ? ((parseFloat(local.ventasCerradas) / parseFloat(local.llamadasRealizadas)) * 100) 
      : null;
    const tasaConversionTotal = local.llamadasAgendadas && local.ventasCerradas 
      ? ((parseFloat(local.ventasCerradas) / parseFloat(local.llamadasAgendadas)) * 100) 
      : null;
    const noShows = local.llamadasAgendadas && local.llamadasRealizadas
      ? parseFloat(local.llamadasAgendadas) - parseFloat(local.llamadasRealizadas)
      : null;

    return (
      <>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Agendadas/Mes</label>
            <input
              type="number"
              value={local.llamadasAgendadas}
              onChange={(e) => handleChange('llamadasAgendadas', e.target.value)}
              onBlur={() => handleBlur('llamadasAgendadas')}
              placeholder="Ej: 40"
              className={inputClass}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Asistieron</label>
            <input
              type="number"
              value={local.llamadasRealizadas}
              onChange={(e) => handleChange('llamadasRealizadas', e.target.value)}
              onBlur={() => handleBlur('llamadasRealizadas')}
              placeholder="Ej: 28"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Ventas</label>
            <input
              type="number"
              value={local.ventasCerradas}
              onChange={(e) => handleChange('ventasCerradas', e.target.value)}
              onBlur={() => handleBlur('ventasCerradas')}
              placeholder="Ej: 8"
              className={inputClass}
            />
          </div>
        </div>

        {/* Métricas Calculadas */}
        {(tasaAsistencia || tasaCierre) && (
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 mb-2">Métricas de Cierre</p>
            <div className="grid grid-cols-2 gap-3">
              {tasaAsistencia && (
                <div>
                  <p className="text-xs text-gray-400">Tasa de Asistencia</p>
                  <p className={`text-lg font-bold ${tasaAsistencia >= 70 ? 'text-emerald-400' : tasaAsistencia >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {tasaAsistencia.toFixed(0)}%
                  </p>
                  {noShows > 0 && (
                    <p className="text-xs text-red-400">{noShows} no-shows</p>
                  )}
                </div>
              )}
              {tasaCierre && (
                <div>
                  <p className="text-xs text-gray-400">Tasa de Cierre</p>
                  <p className={`text-lg font-bold ${tasaCierre >= 30 ? 'text-emerald-400' : tasaCierre >= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {tasaCierre.toFixed(0)}%
                  </p>
                </div>
              )}
              {tasaConversionTotal && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Conversión Total (Agendada → Venta)</p>
                  <p className={`text-lg font-bold ${tasaConversionTotal >= 20 ? 'text-emerald-400' : tasaConversionTotal >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {tasaConversionTotal.toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  // Sección colapsable
  const SeccionCaptura = ({ id, icon: Icon, titulo, children, color }) => {
    const progreso = calcularProgreso(id);
    const isExpanded = expanded[id];

    return (
      <div 
        className="rounded-2xl overflow-hidden transition-all"
        style={{ 
          ...glass,
          ...(isExpanded ? neon(color, 0.3) : {}),
        }}
      >
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `rgba(${color}, 0.2)` }}
            >
              <Icon className="w-5 h-5" style={{ color: `rgb(${color})` }} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">{titulo}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${progreso}%`,
                      background: `rgb(${color})`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progreso}%</span>
              </div>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-5">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Indicador de nivel
  const NivelIndicador = ({ nivel }) => {
    const config = {
      no_apto: { color: '239, 68, 68', label: 'No Apto', icon: XCircle, desc: 'El sistema no cumple requisitos mínimos' },
      launch: { color: '59, 130, 246', label: 'Synapse Launch™', icon: Rocket, desc: 'Implementación inicial del sistema' },
      growth: { color: '139, 92, 246', label: 'Synapse Growth™', icon: TrendingUp, desc: 'Optimización y gestión activa' },
      scale: { color: '245, 158, 11', label: 'Synapse Scale™', icon: Crown, desc: 'Expansión y multiplicación' },
    };

    const c = config[nivel];
    const IconComponent = c.icon;

    return (
      <div 
        className="rounded-2xl p-6 text-center"
        style={{ 
          ...glass,
          ...neon(c.color, 0.4),
        }}
      >
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `rgba(${c.color}, 0.2)` }}
        >
          <IconComponent className="w-8 h-8" style={{ color: `rgb(${c.color})` }} />
        </div>
        <h3 
          className="text-2xl font-bold mb-2"
          style={{ color: `rgb(${c.color})`, ...neonText(c.color) }}
        >
          {c.label}
        </h3>
        <p className="text-sm text-gray-400">{c.desc}</p>
      </div>
    );
  };

  // ==================== PANTALLAS ====================

  // Pantalla 1: Inicio - Componente con estado local para evitar re-renders
  const PantallaInicio = () => {
    const [localNombre, setLocalNombre] = useState('');
    const [localEmail, setLocalEmail] = useState('');
    const [localTipo, setLocalTipo] = useState('');
    const [localFacturacion, setLocalFacturacion] = useState('');

    const handleIniciar = () => {
      setNombreProspecto(localNombre);
      setEmailProspecto(localEmail);
      setTipoNegocio(localTipo);
      setFacturacion(localFacturacion);
      setCurrentScreen('captura');
    };

    const isFormValid = localNombre.trim() && localEmail.trim() && localTipo && localFacturacion;

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              ...neon('139, 92, 246', 0.6),
            }}
          >
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            style={neonText('139, 92, 246')}
          >
            Synapse Diagnostics
          </h1>
          <p className="text-gray-400">Auditoría Estratégica en Vivo</p>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={glass}>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre del Prospecto</label>
            <input
              type="text"
              value={localNombre}
              onChange={(e) => setLocalNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              placeholder="Ej: juan@empresa.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
            <p className="text-xs text-gray-500 mt-1">Enviaremos el resultado de la auditoría a este correo</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Tipo de Negocio</label>
            <select
              value={localTipo}
              onChange={(e) => setLocalTipo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="" className="bg-gray-900">Seleccionar...</option>
              <option value="coach" className="bg-gray-900">Coach</option>
              <option value="consultor" className="bg-gray-900">Consultor</option>
              <option value="infoproductor" className="bg-gray-900">Infoproductor</option>
              <option value="agencia" className="bg-gray-900">Agencia</option>
              <option value="otro" className="bg-gray-900">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Facturación Aproximada</label>
            <select
              value={localFacturacion}
              onChange={(e) => setLocalFacturacion(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="" className="bg-gray-900">Seleccionar rango...</option>
              <option value="<5k" className="bg-gray-900">Menos de $5,000/mes</option>
              <option value="5-10k" className="bg-gray-900">$5,000 - $10,000/mes</option>
              <option value="10-20k" className="bg-gray-900">$10,000 - $20,000/mes</option>
              <option value=">20k" className="bg-gray-900">Más de $20,000/mes</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleIniciar}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
            isFormValid
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90'
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          }`}
          style={isFormValid ? neon('139, 92, 246', 0.4) : {}}
        >
          Iniciar Auditoría
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Pantalla 2: Captura Estratégica
  const PantallaCaptura = () => (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Captura Estratégica</h2>
          <p className="text-sm text-gray-400">Prospecto: {nombreProspecto}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">{calcularProgresoTotal()}%</p>
            <p className="text-xs text-gray-500">Completado</p>
          </div>
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ ...glass, ...neon('139, 92, 246', 0.3) }}
          >
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Secciones */}
      <SeccionCaptura id="glas" icon={Target} titulo="Tráfico y Publicidad" color="99, 102, 241">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Corre anuncios en Meta?</label>
            <BtnSiNo 
              value={captura.glas.correAnuncios} 
              onChange={(v) => updateCaptura('glas', 'correAnuncios', v)} 
            />
          </div>

          {captura.glas.correAnuncios === 'si' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipos de campaña activos</label>
                <ChipsMulti
                  values={captura.glas.tiposCampana}
                  onChange={(v) => updateCaptura('glas', 'tiposCampana', v)}
                  options={[
                    { value: 'awareness', label: 'Awareness' },
                    { value: 'trafico', label: 'Tráfico' },
                    { value: 'conversiones', label: 'Conversiones' },
                    { value: 'advantage+', label: 'Advantage+' },
                  ]}
                />
              </div>

              {/* Métricas de Ads - Componente con estado local */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-purple-400 font-medium mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Métricas de Publicidad
                </p>
                
                <MetricasAdsInput 
                  valores={captura.glas}
                  onUpdate={(campo, valor) => updateCaptura('glas', campo, valor)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Claridad del perfil objetivo</label>
                <SliderVisual
                  value={captura.glas.claridadPerfil}
                  onChange={(v) => updateCaptura('glas', 'claridadPerfil', v)}
                  labels={['Muy vago', 'Muy claro']}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">¿Excluye activamente a quien no aplica?</label>
                <BtnSiNo 
                  value={captura.glas.excluyeNoAplica} 
                  onChange={(v) => updateCaptura('glas', 'excluyeNoAplica', v)} 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Calidad percibida del lead</label>
                <SliderVisual
                  value={captura.glas.calidadLead}
                  onChange={(v) => updateCaptura('glas', 'calidadLead', v)}
                  labels={['Muy baja', 'Muy alta']}
                />
              </div>
            </>
          )}
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="nexus" icon={MessageCircle} titulo="Mensaje y Creativos" color="236, 72, 153">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Usa video ads?</label>
            <BtnSiNo 
              value={captura.nexus.usaVideoAds} 
              onChange={(v) => updateCaptura('nexus', 'usaVideoAds', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿El anuncio menciona requisitos o esfuerzo?</label>
            <BtnSiNo 
              value={captura.nexus.mencionaRequisitos} 
              onChange={(v) => updateCaptura('nexus', 'mencionaRequisitos', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Menciona inversión o precio?</label>
            <BtnSiNo 
              value={captura.nexus.mencionaPrecio} 
              onChange={(v) => updateCaptura('nexus', 'mencionaPrecio', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Identificación del cliente ideal</label>
            <SliderVisual
              value={captura.nexus.identificaClienteIdeal}
              onChange={(v) => updateCaptura('nexus', 'identificaClienteIdeal', v)}
              labels={['Genérico', 'Muy específico']}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿El anuncio rechaza activamente al no aplicante?</label>
            <BtnSiNo 
              value={captura.nexus.rechazaNoAplicante} 
              onChange={(v) => updateCaptura('nexus', 'rechazaNoAplicante', v)} 
            />
          </div>
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="filter" icon={Filter} titulo="Conversación y Calificación" color="16, 185, 129">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Tiene bot conversacional?</label>
            <BtnSiNo 
              value={captura.filter.tieneBot} 
              onChange={(v) => updateCaptura('filter', 'tieneBot', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Pregunta sobre presupuesto/capacidad de inversión?</label>
            <BtnSiNo 
              value={captura.filter.preguntaPresupuesto} 
              onChange={(v) => updateCaptura('filter', 'preguntaPresupuesto', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Pregunta sobre necesidad real?</label>
            <BtnSiNo 
              value={captura.filter.preguntaNecesidad} 
              onChange={(v) => updateCaptura('filter', 'preguntaNecesidad', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Pregunta sobre urgencia/timing?</label>
            <BtnSiNo 
              value={captura.filter.preguntaUrgencia} 
              onChange={(v) => updateCaptura('filter', 'preguntaUrgencia', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Con qué frecuencia llegan leads no calificados?</label>
            <SelectStyled
              value={captura.filter.frecuenciaNoCalificados}
              onChange={(v) => updateCaptura('filter', 'frecuenciaNoCalificados', v)}
              placeholder="Seleccionar..."
              options={[
                { value: 'frecuente', label: 'Frecuentemente' },
                { value: 'ocasional', label: 'Ocasionalmente' },
                { value: 'nunca', label: 'Casi nunca' },
              ]}
            />
          </div>
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="flow" icon={Play} titulo="Nurturing y Automatización" color="245, 158, 11">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Tiene VSL (Video de Ventas)?</label>
            <BtnSiNo 
              value={captura.flow.tieneVSL} 
              onChange={(v) => updateCaptura('flow', 'tieneVSL', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Tiene secuencia de seguimiento?</label>
            <BtnSiNo 
              value={captura.flow.tieneSecuenciaSeguimiento} 
              onChange={(v) => updateCaptura('flow', 'tieneSecuenciaSeguimiento', v)} 
            />
          </div>

          {captura.flow.tieneSecuenciaSeguimiento === 'si' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tipo de seguimiento</label>
              <SelectStyled
                value={captura.flow.seguimientoTipo}
                onChange={(v) => updateCaptura('flow', 'seguimientoTipo', v)}
                placeholder="Seleccionar..."
                options={[
                  { value: 'manual', label: 'Manual' },
                  { value: 'automatico', label: 'Automático' },
                  { value: 'mixto', label: 'Mixto' },
                ]}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Gestión de leads fríos</label>
            <SelectStyled
              value={captura.flow.gestionLeadsFrios}
              onChange={(v) => updateCaptura('flow', 'gestionLeadsFrios', v)}
              placeholder="Seleccionar..."
              options={[
                { value: 'nada', label: 'No hay gestión' },
                { value: 'basico', label: 'Seguimiento básico' },
                { value: 'estructurado', label: 'Sistema estructurado' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">¿Qué porcentaje de leads se "enfría"?</label>
            <SliderVisual
              value={captura.flow.porcentajeEnfriamiento}
              onChange={(v) => updateCaptura('flow', 'porcentajeEnfriamiento', v)}
              labels={['Muy pocos', 'La mayoría']}
            />
          </div>
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="close" icon={Phone} titulo="Cierre y Conversión" color="34, 197, 94">
        <div className="space-y-4">
          <p className="text-xs text-gray-500 mb-2">Ingresa los datos promedio mensuales de tu proceso de cierre</p>
          <CloseInput 
            valores={captura.close}
            onUpdate={(campo, valor) => updateCaptura('close', campo, valor)}
          />
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="gem" icon={Globe} titulo="Contenido Orgánico" color="6, 182, 212">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">¿Publica contenido orgánico?</label>
            <BtnSiNo 
              value={captura.gem.publicaOrganico} 
              onChange={(v) => updateCaptura('gem', 'publicaOrganico', v)} 
            />
          </div>

          {captura.gem.publicaOrganico === 'si' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Frecuencia de publicación</label>
                <SelectStyled
                  value={captura.gem.frecuenciaPublicacion}
                  onChange={(v) => updateCaptura('gem', 'frecuenciaPublicacion', v)}
                  placeholder="Seleccionar..."
                  options={[
                    { value: 'esporadico', label: 'Esporádico' },
                    { value: 'semanal', label: '1-3 veces por semana' },
                    { value: 'diario', label: 'Diario o casi diario' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Coherencia entre orgánico y paid</label>
                <SliderVisual
                  value={captura.gem.coherenciaPaidOrganico}
                  onChange={(v) => updateCaptura('gem', 'coherenciaPaidOrganico', v)}
                  labels={['Desconectados', 'Muy alineados']}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">¿El contenido prepara para la venta?</label>
                <BtnSiNo 
                  value={captura.gem.preparaParaVenta} 
                  onChange={(v) => updateCaptura('gem', 'preparaParaVenta', v)} 
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Refuerzo de autoridad</label>
                <SliderVisual
                  value={captura.gem.refuerzoAutoridad}
                  onChange={(v) => updateCaptura('gem', 'refuerzoAutoridad', v)}
                  labels={['Solo tips', 'Posicionamiento fuerte']}
                />
              </div>
            </>
          )}
        </div>
      </SeccionCaptura>

      <SeccionCaptura id="escalabilidad" icon={Rocket} titulo="Escalabilidad del Negocio" color="168, 85, 247">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Facturación mensual</label>
            <SelectStyled
              value={captura.escalabilidad.facturacionMensual}
              onChange={(v) => updateCaptura('escalabilidad', 'facturacionMensual', v)}
              placeholder="Seleccionar..."
              options={[
                { value: '<5k', label: 'Menos de $5,000' },
                { value: '5-10k', label: '$5,000 - $10,000' },
                { value: '10-20k', label: '$10,000 - $20,000' },
                { value: '>20k', label: 'Más de $20,000' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Capacidad de inversión en marketing</label>
            <SelectStyled
              value={captura.escalabilidad.capacidadInversion}
              onChange={(v) => updateCaptura('escalabilidad', 'capacidadInversion', v)}
              placeholder="Seleccionar..."
              options={[
                { value: '<1k', label: 'Menos de $1,000/mes' },
                { value: '1-3k', label: '$1,000 - $3,000/mes' },
                { value: '3-5k', label: '$3,000 - $5,000/mes' },
                { value: '>5k', label: 'Más de $5,000/mes' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Capacidad operativa</label>
            <SliderVisual
              value={captura.escalabilidad.capacidadOperativa}
              onChange={(v) => updateCaptura('escalabilidad', 'capacidadOperativa', v)}
              labels={['Saturado', 'Mucha capacidad']}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">¿El negocio depende del dueño para operar?</label>
            <BtnSiNo 
              value={captura.escalabilidad.dependenciaDueno} 
              onChange={(v) => updateCaptura('escalabilidad', 'dependenciaDueno', v)} 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">Apertura a implementar sistemas</label>
            <SliderVisual
              value={captura.escalabilidad.aperturaASistemas}
              onChange={(v) => updateCaptura('escalabilidad', 'aperturaASistemas', v)}
              labels={['Resistente', 'Muy abierto']}
            />
          </div>
        </div>
      </SeccionCaptura>

      {/* Botón Procesar */}
      <button
        onClick={procesarDiagnostico}
        disabled={calcularProgresoTotal() < 50}
        className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all mt-6 ${
          calcularProgresoTotal() >= 50
            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90'
            : 'bg-white/10 text-gray-500 cursor-not-allowed'
        }`}
        style={calcularProgresoTotal() >= 50 ? neon('139, 92, 246', 0.4) : {}}
      >
        <Brain className="w-5 h-5" />
        Procesar Diagnóstico
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Pantalla 3: Procesando
  const PantallaProcesando = () => (
    <div className="max-w-md mx-auto text-center py-20">
      <div 
        className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 relative"
        style={{ 
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
          ...neon('139, 92, 246', 0.6),
        }}
      >
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <div className="absolute inset-0 rounded-3xl animate-ping opacity-20 bg-purple-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Analizando Sistema</h2>
      <p className="text-gray-400 mb-8">Procesando coherencia del sistema de {nombreProspecto}...</p>

      <div className="space-y-3">
        {[
          'Evaluando estructura de campañas...',
          'Analizando filtrado de mensaje...',
          'Verificando calificación de leads...',
          'Calculando riesgos sistémicos...',
        ].map((text, i) => (
          <div 
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl mx-auto max-w-xs"
            style={{ 
              ...glass,
              opacity: 0,
              animation: `fadeIn 0.5s ease ${i * 0.8}s forwards`,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-sm text-gray-300">{text}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  // Pantalla 4 y 5: Resultado
  const PantallaResultado = () => {
    if (!diagnosticoResult) return null;

    const { scores, nivel, cuello, riesgos, diagnosticoCentral, advertencia, radarData } = diagnosticoResult;

    const getColorByScore = (score) => {
      if (score >= 3) return '#10b981';
      if (score >= 2) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-2">Diagnóstico de</p>
          <h1 className="text-2xl font-bold text-white">{nombreProspecto}</h1>
          <p className="text-gray-500 text-sm capitalize">{tipoNegocio} • {facturacion}/mes</p>
          <p className="text-gray-600 text-xs mt-1 flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" /> {emailProspecto}
          </p>
        </div>

        {/* Diagnóstico Central */}
        <div 
          className="rounded-2xl p-6"
          style={{ ...glass, ...neon('239, 68, 68', 0.3) }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Diagnóstico Central</h3>
              <p className="text-gray-300 leading-relaxed">{diagnosticoCentral}</p>
            </div>
          </div>
        </div>

        {/* Grid: Radar + Nivel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="rounded-2xl p-6" style={glass}>
            <h3 className="text-sm text-gray-400 mb-4 text-center">Radar del Sistema</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 4]} 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Sistema"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nivel */}
          <NivelIndicador nivel={nivel} />
        </div>

        {/* Métricas de Ads (si hay datos) */}
        {captura.glas.correAnuncios === 'si' && (captura.glas.cpa || captura.glas.cpl || captura.glas.ctr) && (
          <div className="rounded-2xl p-6" style={glass}>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <h3 className="font-semibold text-white">Análisis de Métricas Publicitarias</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {captura.glas.inversionMensual && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">Inversión/Mes</p>
                  <p className="text-xl font-bold text-white">${parseFloat(captura.glas.inversionMensual).toLocaleString()}</p>
                </div>
              )}
              
              {captura.glas.ctr && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">CTR</p>
                  <p className={`text-xl font-bold ${parseFloat(captura.glas.ctr) >= 1.5 ? 'text-emerald-400' : parseFloat(captura.glas.ctr) >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {captura.glas.ctr}%
                  </p>
                  <p className="text-xs text-gray-600">Meta: ≥1.5%</p>
                </div>
              )}
              
              {captura.glas.cpl && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">CPL</p>
                  <p className={`text-xl font-bold ${parseFloat(captura.glas.cpl) <= 10 ? 'text-emerald-400' : parseFloat(captura.glas.cpl) <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                    ${captura.glas.cpl}
                  </p>
                </div>
              )}
              
              {captura.glas.cpa && (
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-500">CPA</p>
                  <p className="text-xl font-bold text-purple-400">${captura.glas.cpa}</p>
                </div>
              )}
            </div>

            {/* Métricas Calculadas */}
            {captura.glas.ticketPromedio && captura.glas.cpa && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-gray-400 mb-1">ROAS</p>
                  {(() => {
                    const roas = parseFloat(captura.glas.ticketPromedio) / parseFloat(captura.glas.cpa);
                    return (
                      <>
                        <p className={`text-3xl font-bold ${roas >= 3 ? 'text-emerald-400' : roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {roas.toFixed(1)}x
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {roas >= 3 ? '✓ Saludable' : roas >= 2 ? '⚠ Ajustado' : '✗ Crítico'}
                        </p>
                      </>
                    );
                  })()}
                </div>

                {captura.glas.cpl && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <p className="text-xs text-gray-400 mb-1">Leads por Venta</p>
                    {(() => {
                      const lpv = parseFloat(captura.glas.cpa) / parseFloat(captura.glas.cpl);
                      return (
                        <>
                          <p className={`text-3xl font-bold ${lpv <= 20 ? 'text-emerald-400' : lpv <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {Math.round(lpv)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lpv <= 20 ? '✓ Eficiente' : lpv <= 40 ? '⚠ Mejorable' : '✗ Fugas críticas'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                {captura.glas.inversionMensual && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <p className="text-xs text-gray-400 mb-1">Retorno Mensual Est.</p>
                    {(() => {
                      const ventas = parseFloat(captura.glas.inversionMensual) / parseFloat(captura.glas.cpa);
                      const retorno = ventas * parseFloat(captura.glas.ticketPromedio);
                      const ganancia = retorno - parseFloat(captura.glas.inversionMensual);
                      return (
                        <>
                          <p className="text-3xl font-bold text-blue-400">
                            ${Math.round(retorno).toLocaleString()}
                          </p>
                          <p className={`text-xs mt-1 ${ganancia > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {ganancia > 0 ? '+' : ''}{Math.round(ganancia).toLocaleString()} neto
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cuello de Botella */}
        <div 
          className="rounded-2xl p-6"
          style={{ ...glass, ...neon('245, 158, 11', 0.3) }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-amber-400" />
            <h3 className="font-semibold text-white">Cuello de Botella Dominante</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-400">{cuello.label}</p>
              <p className="text-sm text-gray-400 mt-1">Score: {cuello.score.toFixed(1)}/4</p>
            </div>
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.2)' }}
            >
              <span className="text-3xl font-bold text-amber-400">{cuello.score.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Riesgos */}
        <div className="rounded-2xl p-6" style={glass}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="font-semibold text-white">Riesgos Actuales del Sistema</h3>
          </div>
          <div className="space-y-3">
            {riesgos.map((riesgo, i) => (
              <div 
                key={i}
                className={`flex items-start gap-3 p-4 rounded-xl ${
                  riesgo.nivel === 'alto' ? 'bg-red-500/10 border border-red-500/30' :
                  riesgo.nivel === 'medio' ? 'bg-amber-500/10 border border-amber-500/30' :
                  'bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  riesgo.nivel === 'alto' ? 'bg-red-500' :
                  riesgo.nivel === 'medio' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`} />
                <p className="text-gray-300 text-sm">{riesgo.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Semáforo por Dimensión */}
        <div className="rounded-2xl p-6" style={glass}>
          <h3 className="font-semibold text-white mb-4">Estado por Dimensión</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(scores).map(([key, score]) => {
              const labels = {
                glas: 'GLAS',
                nexus: 'Nexus',
                filter: 'Filter',
                flow: 'Flow',
                close: 'Close',
                gem: 'GEM',
                escalabilidad: 'Escala',
              };
              const color = getColorByScore(score);
              return (
                <div 
                  key={key}
                  className="p-4 rounded-xl text-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <p className="text-xs text-gray-400 mb-1">{labels[key]}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{score.toFixed(1)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advertencia */}
        <div 
          className="rounded-2xl p-6"
          style={{ ...glass, borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Advertencia Estratégica</h3>
              <p className="text-gray-400 text-sm">{advertencia}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => {
              setCurrentScreen('inicio');
              setNombreProspecto('');
              setEmailProspecto('');
              setTipoNegocio('');
              setFacturacion('');
              setDiagnosticoResult(null);
              setExpanded({ glas: true, nexus: false, filter: false, flow: false, gem: false, escalabilidad: false });
            }}
            className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-white/10 text-gray-300 hover:bg-white/15 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Nueva Auditoría
          </button>
          <button
            onClick={() => setCurrentScreen('captura')}
            className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <Eye className="w-4 h-4" />
            Ver Datos
          </button>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div 
      className="min-h-screen text-white p-4 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0f0f2f 100%)',
      }}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {currentScreen === 'inicio' && <PantallaInicio />}
        {currentScreen === 'captura' && <PantallaCaptura />}
        {currentScreen === 'procesando' && <PantallaProcesando />}
        {currentScreen === 'resultado' && <PantallaResultado />}
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 pt-6 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }}
          >
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-semibold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Synapse Diagnostics
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Smart Growth Online • Sistema Synapse™ • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
