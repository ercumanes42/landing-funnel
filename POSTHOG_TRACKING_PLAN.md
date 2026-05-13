# PostHog Tracking Plan - Funnel Absentismo

Proyecto PostHog: https://eu.posthog.com/project/122772/home

Landing principal: https://landing-funnel-nuevo.vercel.app/

## Regla principal

Todos los eventos vivos del funnel de absentismo empiezan por `abs_`.

Esto permite separar este funnel de versiones antiguas como Talento+IA, Radar 2026 u otros experimentos previos.

## Configuracion esperada en Vercel

- `VITE_POSTHOG_KEY`: clave publica del proyecto PostHog correcto.
- `VITE_POSTHOG_HOST`: `https://eu.i.posthog.com`.

El codigo registra propiedades comunes en todos los eventos:

- `funnel_id`: `absentismo_laboral`
- `funnel_version`: `2026_05_absentismo_v1`
- `app_host`
- `route`
- `safe_url` sin parametro `email`
- `utms`

## Eventos vivos

| Evento | Cuando se dispara | Uso principal |
|---|---|---|
| `abs_page_view` | Cambio de ruta | Trafico por pantalla |
| `abs_identified_from_email_link` | La URL trae parametro `email` valido | Identificacion desde email frio |
| `abs_landing_cta_clicked` | Click en CTA principal de landing | Intencion inicial |
| `abs_diagnostic_started` | Entrada real al cuestionario | Inicio del diagnostico |
| `abs_diagnostic_step_viewed` | Cada paso del cuestionario visible | Abandono por paso |
| `abs_diagnostic_question_answered` | Respuesta a una pregunta del diagnostico | Calidad y patrones de respuestas |
| `abs_diagnostic_section_completed` | Bloques clave completados | Progreso del funnel |
| `abs_mini_result_viewed` | Vista del primer patron tras Q3 | Impacto del microresultado |
| `abs_lead_form_viewed` | Pantalla de nombre/email visible | Conversion previa al lead |
| `abs_lead_submitted` | Formulario minimo enviado | Lead capturado |
| `abs_diagnostic_completed` | Diagnostico completado | Conversion principal |
| `abs_result_viewed` | Pantalla de resultado vista | Consumo de valor |
| `abs_report_downloaded` | Click para imprimir/guardar PDF | Rama B |
| `abs_booking_cta_clicked` | Click en CTA de agenda | Intencion de reunion |
| `abs_booking_confirmed` | Calendly confirma evento | Conversion Rama A |
| `abs_booking_skipped` | Usuario vuelve al informe desde agenda | No agenda, pero sigue cualificado |
| `abs_webhook_error` | Error al enviar payload a Make | Salud tecnica |

## Eventos antiguos a no usar

Estos nombres pueden seguir existiendo en PostHog por historico, pero no deberian aparecer en nuevos despliegues:

- `view_landing`
- `click_start_survey`
- `start_survey`
- `complete_survey`
- `email_captured`
- `pdf_clicked`
- `book_call_clicked`
- `skip_booking`
- `survey_step_viewed`
- `diagnostic_start`
- `block_1_complete`
- `block_2_complete`
- `block_3_complete`
- `block_4_complete`
- `diagnostic_complete`
- `report_view`
- `report_download`
- `book_call_click`
- `book_call_complete`
- `error_shown`
- `diagnostic_question_1_answered`
- `diagnostic_question_2_answered`
- `diagnostic_question_3_answered`
- `diagnostic_question_4_answered`
- `diagnostic_question_5_answered`
- `diagnostic_question_6_answered`
- `diagnostic_question_7_answered`
- `diagnostic_question_8_answered`
- `mini_result_view`
- `lead_form_view`
- `lead_submitted`
- `final_result_view`
- `click_request_review`
- `calendly_opened`
- `calendly_booked`
- `auto_identified_from_email`

## Embudo recomendado en PostHog

1. `abs_page_view` con `route = /`
2. `abs_landing_cta_clicked`
3. `abs_diagnostic_started`
4. `abs_mini_result_viewed`
5. `abs_lead_form_viewed`
6. `abs_lead_submitted`
7. `abs_result_viewed`
8. Rama A: `abs_booking_cta_clicked` -> `abs_booking_confirmed`
9. Rama B: `abs_report_downloaded`

## Limpieza manual recomendada en PostHog

PostHog no permite borrar el historico sin borrar datos, pero si conviene:

1. Crear un dashboard nuevo llamado `Funnel Absentismo 2026`.
2. Filtrar todos los insights por `funnel_id = absentismo_laboral`.
3. Archivar dashboards antiguos de Talento+IA o Radar 2026.
4. En la lista de eventos, marcar como ocultos o no favoritos los eventos antiguos de la seccion anterior.
5. Usar solo eventos `abs_` para nuevos funnels, cohortes y conversiones.

## Privacidad operativa

El webhook/Make puede recibir el payload completo del lead.

PostHog debe recibir comportamiento y scoring, no todo el payload comercial. Por eso `abs_diagnostic_completed`, `abs_result_viewed`, `abs_report_downloaded` y eventos de agenda envian scores, riesgo principal y estado, pero no duplican todos los datos del contacto en cada evento.
