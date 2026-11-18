# Impact Model

This document describes the methodology, assumptions, evidence sources, and limitations for all exposure-reduction and emissions-reduction estimates shown in Saans.

> **All numbers are ranges, not point estimates.** Individual results will vary based on many factors not modelled here.

---

## Methodology

### Exposure Score

The "exposure score" is the user's AQI value. This is a simplified proxy for personal exposure; actual dose depends on breathing rate, time outdoors, activity level, and home infiltration rate — none of which are individually measured.

### Reduction Estimates

Each action in `src/domain/actionCatalog.ts` has an `exposureReduction` range `{ min, max }` in percentage points. These are drawn from the sources below and are **conservative estimates** where studies show wide variation.

The `estimateExposure` function applies diminishing returns when multiple actions are combined (each subsequent action applies to the already-reduced exposure, not the baseline), capped at 70% total reduction maximum.

### Community Impact

The community projection multiplies the individual reduction by 30 households, representing a typical Indian residential society (RWA). This is a **linear approximation** that ignores neighbourhood-level airflow dynamics and assumes independent adoption.

---

## Action Evidence Sources

### Indoor Air

| Action | Exposure Reduction | Evidence Basis | Strength |
|---|---|---|---|
| Seal window/door gaps | 15–40% | EPA weatherization guidance; building envelope studies show 20–50% PM2.5 infiltration reduction | Strong |
| Run HEPA air purifier | 30–60% | EPA and WHO guidance; HEPA purifiers reduce indoor PM2.5 by 50–80% in controlled studies | Strong |
| Avoid incense/candles | 5–15% | WHO indoor air quality guidelines; incense can raise indoor PM2.5 by 50–200 µg/m³ | Strong |
| Wet mop vs dry sweep | 5–15% | EPA guidance on reducing indoor particulate resuspension | Moderate |
| DIY box fan filter (CR box) | 20–45% | Peer-reviewed studies on Corsi-Rosenthal boxes; conservative estimate | Moderate |

### Transport

| Action | Exposure Reduction | Emissions Reduction | Evidence Basis | Strength |
|---|---|---|---|---|
| Switch to public transit | 10–25% | 45–80% | IPCC transport reports; EPA emissions factors | Strong |
| Carpool | 5–15% | 30–50% | EPA carpooling emissions studies | Moderate |
| Work from home | 15–35% | 50–90% | Commute-time exposure studies | Moderate |

### Cooking

| Action | Exposure Reduction | Emissions Reduction | Evidence Basis | Strength |
|---|---|---|---|---|
| Switch biomass → clean fuel | 40–70% | 50–80% | WHO household energy guidelines; Pradhan Mantri Ujjwala Yojana impact studies | Strong |
| Use kitchen exhaust hood | 15–35% | — | EPA residential cooking emissions; range hood efficacy studies | Strong |

### Ventilation

| Action | Exposure Reduction | Evidence Basis | Strength |
|---|---|---|---|
| Ventilate at cleanest hour | 5–15% | Building ventilation studies; strategic ventilation reduces overall indoor pollution exposure | Moderate |
| Close windows during peak | 10–30% | EPA guidance on protecting indoor air during high pollution events | Strong |

### Community

| Action | Exposure Reduction | Emissions Reduction | Evidence Basis | Strength |
|---|---|---|---|---|
| Stop open waste burning | 5–20% | 20–50% | CPCB data on urban PM2.5 contribution from waste burning | Moderate |
| Community awareness | 2–10% | 5–15% | Community health intervention studies; adoption rate uncertain | Limited |

### Exercise

| Action | Exposure Reduction | Evidence Basis | Strength |
|---|---|---|---|
| Exercise indoors (AQI > 100) | 20–40% | Exercise physiology; EPA guidance on physical activity during poor AQI | Strong |
| Exercise during best window | 10–25% | Diurnal AQI variation studies; early morning typically lower PM2.5 | Moderate |

---

## Key References

1. WHO (2021). *WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide.* World Health Organization. ISBN 978-92-4-003422-8.

2. US EPA (2024). *Air Quality Index (AQI) Basics.* https://www.airnow.gov/aqi/aqi-basics/

3. US EPA (2022). *Residential Air Cleaners: A Technical Summary (3rd Ed).* EPA 402/F-20/004.

4. US EPA (2023). *Strategies to Reduce the Risk of Indoor Air Quality Problems in Homes During and After Hurricanes.* (Weatherization guidance)

5. CPCB (2022). *Air Quality Trend Report.* Central Pollution Control Board, India.

6. Corsi, R.L. & Rosenthal, J. (2021). *DIY Air Cleaners for Wildfire Smoke.* Published studies validating CR box performance.

7. IPCC (2022). *Mitigation of Climate Change: Chapter 10 — Transport.* Sixth Assessment Report.

8. WHO (2016). *Burning Opportunity: Clean Household Energy for Health, Sustainable Development, and Wellbeing of Women and Children.* WHO/HIS/FWC/EPE/16.001.

---

## Limitations

- **Individual variation**: Breathing rate, age, activity level, and time indoors vary widely and are not modelled.
- **Spatial variation**: Indoor AQI is not measured; it is inferred from outdoor AQI and home type (sealed/moderate/leaky).
- **Time-averaging**: The model uses a single current AQI reading, not a 24-hour average dose.
- **Stacking cap**: The 70% maximum reduction cap is a conservative engineering assumption, not a validated physiological model.
- **Community projection**: The 30-household linear projection ignores neighbourhood-level airflow effects and social adoption dynamics.
- **Evidence gaps**: Several interventions (e.g., community awareness) have limited RCT evidence; this is disclosed per action.

---

*Last updated: 2024. This document should be updated whenever the action catalog is revised.*
