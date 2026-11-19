import type { Action } from './types';

/**
 * Evidence-backed action catalog for air quality improvement.
 * Each action includes exposure reduction ranges based on published research.
 * See docs/IMPACT_MODEL.md for full citations and methodology.
 */
export const ACTION_CATALOG: readonly Action[] = [
  // ── Indoor Actions ──
  {
    id: 'seal-gaps',
    category: 'indoor',
    title: { en: 'Seal window & door gaps', hi: 'खिड़की और दरवाज़ों की दरारें बंद करें' },
    description: {
      en: 'Use weather stripping or wet towels to seal gaps around windows and doors. Reduces outdoor pollution infiltration by 20-50%.',
      hi: 'खिड़कियों और दरवाज़ों के आसपास की दरारों को वेदर स्ट्रिपिंग या गीले तौलिये से बंद करें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { homeTypes: ['leaky', 'moderate'], minAqi: 100 },
    exposureReduction: { min: 15, max: 40 },
    emissionsReduction: null,
    evidenceNote:
      'EPA guidance on weatherization; building envelope studies show 20-50% PM2.5 infiltration reduction',
    evidenceStrength: 'strong',
  },
  {
    id: 'run-purifier',
    category: 'indoor',
    title: { en: 'Run air purifier in occupied rooms', hi: 'कमरे में एयर प्यूरीफायर चलाएं' },
    description: {
      en: 'Run HEPA air purifier in the room where you spend the most time. Match CADR to room size.',
      hi: 'जिस कमरे में सबसे ज़्यादा समय बिताते हैं वहां HEPA एयर प्यूरीफायर चलाएं।',
    },
    costTier: 'investment',
    effort: 'minimal',
    applicability: { minAqi: 50 },
    exposureReduction: { min: 30, max: 60 },
    emissionsReduction: null,
    evidenceNote:
      'EPA and WHO guidance; HEPA purifiers reduce indoor PM2.5 by 50-80% in controlled studies',
    evidenceStrength: 'strong',
  },
  {
    id: 'avoid-incense',
    category: 'indoor',
    title: {
      en: 'Avoid incense, candles & indoor burning',
      hi: 'अगरबत्ती, मोमबत्ती और घर के अंदर जलाना बंद करें',
    },
    description: {
      en: 'Incense and candles release PM2.5 and VOCs. Avoid during high pollution days.',
      hi: 'अगरबत्ती और मोमबत्ती से PM2.5 और VOC निकलते हैं। प्रदूषण के दिनों में इनसे बचें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { minAqi: 100 },
    exposureReduction: { min: 5, max: 15 },
    emissionsReduction: null,
    evidenceNote:
      'WHO indoor air quality guidelines; incense can raise indoor PM2.5 by 50-200 µg/m³',
    evidenceStrength: 'strong',
  },
  {
    id: 'wet-mop',
    category: 'indoor',
    title: { en: 'Wet mop instead of dry sweeping', hi: 'सूखे झाड़ू की जगह गीले पोछे का उपयोग करें' },
    description: {
      en: 'Dry sweeping resuspends settled dust particles. Wet mopping captures them instead.',
      hi: 'सूखा झाड़ू लगाने से धूल फिर से हवा में उड़ती है। गीला पोछा बेहतर है।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: {},
    exposureReduction: { min: 5, max: 15 },
    emissionsReduction: null,
    evidenceNote: 'EPA guidance on reducing indoor particulate resuspension',
    evidenceStrength: 'moderate',
  },
  {
    id: 'diy-filter',
    category: 'indoor',
    title: { en: 'DIY box fan air filter (Corsi-Rosenthal box)', hi: 'DIY बॉक्स फैन एयर फिल्टर बनाएं' },
    description: {
      en: 'Tape a MERV-13 furnace filter to a box fan. Low-cost alternative to commercial purifiers.',
      hi: 'एक बॉक्स फैन पर MERV-13 फिल्टर लगाएं। सस्ता प्यूरीफायर विकल्प।',
    },
    costTier: 'low',
    effort: 'moderate',
    applicability: { minAqi: 100 },
    exposureReduction: { min: 20, max: 45 },
    emissionsReduction: null,
    evidenceNote:
      'Peer-reviewed studies on CR boxes show 30-60% PM2.5 reduction; conservative estimate used',
    evidenceStrength: 'moderate',
  },

  // ── Transport Actions ──
  {
    id: 'public-transit',
    category: 'transport',
    title: { en: 'Switch to public transit', hi: 'सार्वजनिक परिवहन अपनाएं' },
    description: {
      en: 'Public transit reduces per-person emissions by 45-80% compared to private cars.',
      hi: 'सार्वजनिक परिवहन से प्रति व्यक्ति उत्सर्जन 45-80% कम होता है।',
    },
    costTier: 'low',
    effort: 'moderate',
    applicability: { commuteModes: ['car'] },
    exposureReduction: { min: 10, max: 25 },
    emissionsReduction: { min: 45, max: 80 },
    evidenceNote:
      'IPCC transport sector reports; EPA emissions factors for transit vs personal vehicles',
    evidenceStrength: 'strong',
  },
  {
    id: 'carpool',
    category: 'transport',
    title: { en: 'Carpool with neighbors', hi: 'पड़ोसियों के साथ कारपूल करें' },
    description: {
      en: 'Sharing rides reduces the number of vehicles and per-person emissions.',
      hi: 'साथ मिलकर यात्रा करने से वाहनों की संख्या और प्रति व्यक्ति उत्सर्जन कम होता है।',
    },
    costTier: 'free',
    effort: 'moderate',
    applicability: { commuteModes: ['car'] },
    exposureReduction: { min: 5, max: 15 },
    emissionsReduction: { min: 30, max: 50 },
    evidenceNote: 'EPA carpooling emissions studies; 2-person carpool halves per-person emissions',
    evidenceStrength: 'moderate',
  },
  {
    id: 'wfh-option',
    category: 'transport',
    title: { en: 'Work from home on bad AQI days', hi: 'खराब AQI वाले दिन घर से काम करें' },
    description: {
      en: 'Eliminate commute exposure entirely on days when air quality is unhealthy.',
      hi: 'जब हवा की गुणवत्ता खराब हो तो यात्रा का जोखिम पूरी तरह से समाप्त करें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { commuteModes: ['car', 'walk', 'cycle', 'publicTransport'], minAqi: 150 },
    exposureReduction: { min: 15, max: 35 },
    emissionsReduction: { min: 50, max: 90 },
    evidenceNote:
      'Commute time exposure studies; 1-2 hour daily commute in polluted air significantly increases dose',
    evidenceStrength: 'moderate',
  },

  // ── Cooking Actions ──
  {
    id: 'switch-fuel',
    category: 'cooking',
    title: { en: 'Switch from biomass to clean fuel', hi: 'बायोमास से स्वच्छ ईंधन पर स्विच करें' },
    description: {
      en: 'Biomass cooking releases high PM2.5 indoors. LPG or electric reduces indoor pollution dramatically.',
      hi: 'बायोमास खाना पकाने से घर में PM2.5 बढ़ता है। LPG या बिजली से इनडोर प्रदूषण बहुत कम होता है।',
    },
    costTier: 'investment',
    effort: 'significant',
    applicability: { cookingFuels: ['biomass'] },
    exposureReduction: { min: 40, max: 70 },
    emissionsReduction: { min: 50, max: 80 },
    evidenceNote: 'WHO household energy guidelines; Pradhan Mantri Ujjwala Yojana impact studies',
    evidenceStrength: 'strong',
  },
  {
    id: 'exhaust-hood',
    category: 'cooking',
    title: { en: 'Use kitchen exhaust while cooking', hi: 'खाना बनाते समय किचन एग्ज़ॉस्ट चलाएं' },
    description: {
      en: 'Exhaust hoods vented outside remove 60-90% of cooking emissions before they spread.',
      hi: 'बाहर की तरफ वेंटेड एग्ज़ॉस्ट हुड 60-90% खाना पकाने के उत्सर्जन को हटा देता है।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { cookingFuels: ['lpg', 'biomass', 'mixed'] },
    exposureReduction: { min: 15, max: 35 },
    emissionsReduction: null,
    evidenceNote: 'EPA guidelines on residential cooking emissions; range hood efficacy studies',
    evidenceStrength: 'strong',
  },

  // ── Ventilation Actions ──
  {
    id: 'ventilate-cleanest',
    category: 'ventilation',
    title: { en: 'Ventilate at the cleanest hour', hi: 'सबसे साफ़ समय में हवा आने दें' },
    description: {
      en: 'Open windows briefly during the best outdoor window to flush indoor CO₂ and pollutants.',
      hi: 'सबसे अच्छी हवा वाले समय में खिड़कियां खोलकर अंदर की CO₂ और प्रदूषण बाहर निकालें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: {},
    exposureReduction: { min: 5, max: 15 },
    emissionsReduction: null,
    evidenceNote:
      'Building ventilation studies; strategic ventilation reduces overall indoor pollution exposure',
    evidenceStrength: 'moderate',
  },
  {
    id: 'close-windows-bad',
    category: 'ventilation',
    title: { en: 'Close windows during peak pollution', hi: 'अधिक प्रदूषण के समय खिड़कियां बंद रखें' },
    description: {
      en: 'Keep windows and doors shut when outdoor AQI exceeds 150. Reduces infiltration.',
      hi: 'जब बाहर AQI 150 से अधिक हो तो खिड़कियां और दरवाज़े बंद रखें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { minAqi: 150 },
    exposureReduction: { min: 10, max: 30 },
    emissionsReduction: null,
    evidenceNote:
      'EPA guidance on protecting indoor air during wildfire smoke and high pollution events',
    evidenceStrength: 'strong',
  },

  // ── Community Actions ──
  {
    id: 'no-waste-burning',
    category: 'community',
    title: { en: 'Stop open waste burning', hi: 'खुले में कूड़ा जलाना बंद करें' },
    description: {
      en: 'Waste burning is a major PM2.5 source. Coordinate with neighbors for proper disposal.',
      hi: 'कूड़ा जलाना PM2.5 का प्रमुख स्रोत है। पड़ोसियों के साथ उचित निपटान की व्यवस्था करें।',
    },
    costTier: 'free',
    effort: 'moderate',
    applicability: { minAqi: 50 },
    exposureReduction: { min: 5, max: 20 },
    emissionsReduction: { min: 20, max: 50 },
    evidenceNote: 'CPCB data on contribution of waste burning to urban PM2.5 levels',
    evidenceStrength: 'moderate',
  },
  {
    id: 'community-awareness',
    category: 'community',
    title: {
      en: 'Share air quality advisory with community',
      hi: 'समुदाय के साथ वायु गुणवत्ता सलाह साझा करें',
    },
    description: {
      en: 'Distribute printable advisory to schools, RWAs, and workplaces. Collective action amplifies impact.',
      hi: 'स्कूलों, RWA और कार्यस्थलों में प्रिंट करने योग्य सलाह वितरित करें।',
    },
    costTier: 'free',
    effort: 'moderate',
    applicability: {},
    exposureReduction: { min: 2, max: 10 },
    emissionsReduction: { min: 5, max: 15 },
    evidenceNote:
      'Community health intervention studies show awareness increases protective behavior adoption',
    evidenceStrength: 'limited',
  },

  // ── Exercise Actions ──
  {
    id: 'indoor-exercise',
    category: 'exercise',
    title: { en: 'Exercise indoors when AQI > 100', hi: 'AQI > 100 होने पर घर के अंदर व्यायाम करें' },
    description: {
      en: 'During exercise, breathing rate increases 10-20x, multiplying pollutant intake. Move workouts indoors.',
      hi: 'व्यायाम के दौरान सांस की दर 10-20 गुना बढ़ जाती है। कसरत घर के अंदर करें।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: { minAqi: 100 },
    exposureReduction: { min: 20, max: 40 },
    emissionsReduction: null,
    evidenceNote: 'Exercise physiology studies; EPA guidance on physical activity during poor AQI',
    evidenceStrength: 'strong',
  },
  {
    id: 'morning-exercise',
    category: 'exercise',
    title: { en: 'Exercise during best AQI window', hi: 'सबसे अच्छे AQI वाले समय में व्यायाम करें' },
    description: {
      en: 'Time outdoor exercise during the lowest AQI hours, typically early morning.',
      hi: 'सबसे कम AQI वाले समय में बाहर व्यायाम करें, आमतौर पर सुबह जल्दी।',
    },
    costTier: 'free',
    effort: 'minimal',
    applicability: {},
    exposureReduction: { min: 10, max: 25 },
    emissionsReduction: null,
    evidenceNote:
      'Diurnal AQI variation studies; early morning typically has lower PM2.5 concentrations',
    evidenceStrength: 'moderate',
  },
] as const;
