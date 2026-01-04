import { supabase } from './supabase'

// Mapeo de nombres del frontend a nombres de Supabase
const mapScoresToSupabase = (scores) => ({
  score_nexus: Math.round(scores.nexus) || 0,
  score_ads: Math.round(scores.glas) || 0,
  score_leads: Math.round(scores.filter) || 0,
  score_nurturing: Math.round(scores.flow) || 0,
  score_close: Math.round(scores.close) || 0,
  score_content: Math.round(scores.gem) || 0,
  score_operations: Math.round(scores.escalabilidad) || 0,
})

// Calcular score total
const calculateOverallScore = (scores) => {
  const values = Object.values(scores)
  return Math.round(values.reduce((a, b) => a + b, 0))
}

// Mapear nivel Synapse
const mapSynapseLevel = (nivel) => {
  const niveles = {
    'no_apto': 'No Apto',
    'launch': 'Synapse Launch',
    'growth': 'Synapse Growth',
    'scale': 'Synapse Scale'
  }
  return niveles[nivel] || nivel
}

// Función principal para guardar diagnóstico
export const saveDiagnostic = async ({
  prospecto,
  captura,
  resultado
}) => {
  try {
    const mappedScores = mapScoresToSupabase(resultado.scores)
    
    const diagnosticData = {
      // Lead Info
      lead_name: prospecto.nombre,
      lead_email: prospecto.email,
      business_type: prospecto.tipoNegocio,
      monthly_revenue: prospecto.facturacion,
      
      // Scores
      ...mappedScores,
      overall_score: calculateOverallScore(mappedScores),
      synapse_level: mapSynapseLevel(resultado.nivel),
      
      // Diagnóstico
      dominant_bottleneck: resultado.cuello?.label || '',
      main_diagnosis: resultado.diagnosticoCentral || '',
      
      // Riesgos
      risk_1: resultado.riesgos?.[0]?.texto || null,
      risk_2: resultado.riesgos?.[1]?.texto || null,
      risk_3: resultado.riesgos?.[2]?.texto || null,
      
      // Recomendación
      recommended_focus: resultado.advertencia || '',
      
      // Inputs completos
      raw_inputs: {
        captura,
        metricas: {
          inversionMensual: captura.glas?.inversionMensual,
          cpl: captura.glas?.cpl,
          cpa: captura.glas?.cpa,
          ticketPromedio: captura.glas?.ticketPromedio,
          llamadasAgendadas: captura.close?.llamadasAgendadas,
          llamadasRealizadas: captura.close?.llamadasRealizadas,
          ventasCerradas: captura.close?.ventasCerradas,
        }
      },
      
      // Flags
      sent_by_email: false,
      pdf_generated: false
    }

    const { data, error } = await supabase
      .from('synapse_diagnostics')
      .insert(diagnosticData)
      .select()
      .single()

    if (error) {
      console.error('Error guardando diagnóstico:', error)
      throw error
    }

    console.log('Diagnóstico guardado:', data.id)
    return data

  } catch (error) {
    console.error('Error en saveDiagnostic:', error)
    throw error
  }
}
