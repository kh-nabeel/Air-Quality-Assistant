import type {
  AqiData,
  ChatMessage,
  Language,
  RankedAction,
  RiskAssessment,
  UserLocation,
} from '@/domain/types';
import { GEMINI_TEMPERATURE, MAX_CHAT_HISTORY, MAX_OUTPUT_TOKENS } from '@/config/constants';
import { sanitizeForPrompt } from '@/utils/sanitize';
import { getGeminiModel } from './client';
import { buildContextBlock, SYSTEM_INSTRUCTION_CHAT } from './prompts';

interface ChatContext {
  readonly location: UserLocation;
  readonly aqi: AqiData;
  readonly risk: RiskAssessment;
  readonly actions: readonly RankedAction[];
  readonly language: Language;
}

/**
 * Intelligent deterministic answer generator grounded on current AQI and household context.
 * Used whenever Gemini API is unavailable or rate-limited, guaranteeing the chat is always helpful.
 */
function getGroundedLocalAnswer(query: string, context: ChatContext): string {
  const q = query.toLowerCase();
  const { aqi, risk, actions, location, language } = context;
  const isHi = language === 'hi';

  if (q.includes('mask') || q.includes('मास्क') || q.includes('n95')) {
    if (isHi) {
      return `वर्तमान में ${location.name} का AQI ${aqi.usAqi} है। इस स्तर पर सामान्य कपड़े या सर्जिकल मास्क PM2.5 कणों को रोकने में केवल 10-20% प्रभावी होते हैं।\n\n- **सुझाव**: केवल प्रमाणित N95 या FFP2 रेस्पिरेटर का उपयोग करें।\n- **फिट जांचें**: मास्क नाक और मुंह पर पूरी तरह सील होना चाहिए ताकि किनारों से गंदी हवा अंदर न आए।`;
    }
    return `The current US AQI in ${location.name} is ${aqi.usAqi} (PM2.5: ${Math.round(aqi.pm25)} µg/m³).\n\n- **Mask recommendation**: At this pollution level, cloth or simple surgical masks provide minimal protection (10–20% PM2.5 filtration). Use a well-fitted certified **N95 or FFP2 respirator**.\n- **Fit check**: Ensure a tight seal along the bridge of the nose and cheeks without visible air leaks.`;
  }

  if (
    q.includes('walk') ||
    q.includes('exercise') ||
    q.includes('gym') ||
    q.includes('टहल') ||
    q.includes('व्यायाम') ||
    q.includes('दौड़')
  ) {
    const isUnsafe = aqi.usAqi > 100;
    if (isHi) {
      return `आज ${location.name} में AQI ${aqi.usAqi} है। ${isUnsafe ? 'बाहरी व्यायाम से बचें' : 'हल्की चहलकदमी की जा सकती है'}।\n\n- भारी व्यायाम के दौरान हम मुंह से सांस लेते हैं और 5–10 गुना अधिक दूषित हवा फेफड़ों में जाती है।\n- व्यायाम घर के अंदर, खिड़कियां बंद करके या एयर प्यूरीफायर चलाकर करें।`;
    }
    return `Today's AQI in ${location.name} is ${aqi.usAqi}.\n\n- **Outdoor activity advisory**: ${isUnsafe ? 'Intense outdoor exercise is NOT recommended today.' : 'Light outdoor walks may be acceptable.'}\n- **Physiology note**: During cardio, breathing shifts from nasal to mouth-breathing, drawing 5–10x more ultrafine PM2.5 directly into lung alveoli.\n- **Safer alternative**: Exercise indoors with closed windows or in rooms with active air filtration.`;
  }

  if (
    q.includes('child') ||
    q.includes('kid') ||
    q.includes('baby') ||
    q.includes('बच्चे') ||
    q.includes('स्कूल')
  ) {
    if (isHi) {
      return `बच्चों के फेफड़े अभी विकसित हो रहे होते हैं और वे प्रति मिनट वयस्कों से अधिक बार सांस लेते हैं।\n\n- **सावधानी**: जब AQI 100 से अधिक हो, तो बच्चों को बाहर खेलने से रोकें।\n- **स्कूल आवागमन**: सुबह के समय जब स्मॉग जमीन के सबसे करीब होता है, खिड़कियां बंद रखें और मास्क का प्रयोग कराएं।`;
    }
    return `Children have narrower airways and a higher respiratory rate per body weight, making them particularly vulnerable at AQI ${aqi.usAqi}.\n\n- **Action**: Restrict vigorous outdoor play when AQI exceeds 100.\n- **School commute**: Early mornings frequently have thermal inversion trapping peak particulate matter. Keep school transport windows sealed and ensure your child wears an appropriately sized N95.`;
  }

  if (q.includes('plant') || q.includes('पौधे') || q.includes('पौधों')) {
    if (isHi) {
      return `इनडोर पौधे (जैसे स्नेक प्लांट या एरिका पाम) कमरे को सुंदर बनाते हैं, लेकिन वैज्ञानिक शोध के अनुसार वे गंभीर स्मॉग के दौरान PM2.5 को प्रभावी ढंग से नहीं हटा सकते।\n\n- उच्च प्रदूषण में HEPA एयर प्यूरीफायर या DIY MERV-13 फिल्टर ही सिद्ध समाधान हैं।`;
    }
    return `While indoor plants (snake plant, areca palm) offer aesthetic and psychological benefits, real-world atmospheric studies show they have negligible capacity to filter microscopic PM2.5 during severe smog.\n\n- **Evidence note**: Mechanical filtration (certified HEPA or MERV-13 filters) is the only proven method for removing particulate matter indoors.`;
  }

  if (
    q.includes('ventilate') ||
    q.includes('window') ||
    q.includes('खिड़की') ||
    q.includes('हवा बदलें')
  ) {
    if (isHi) {
      return `खिड़कियां तभी खोलें जब बाहर की हवा सबसे साफ हो (आमतौर पर दोपहर 12 से 3 बजे के बीच धूप खिलने पर)।\n\n- सुबह और देर शाम स्मॉग सबसे अधिक घना होता है, उस समय खिड़कियां और दरवाजें बिल्कुल बंद रखें।`;
    }
    return `Natural ventilation rules during smog season:\n\n- **Cleanest window**: Only ventilate briefly during peak sunlight (typically 12:00 PM – 3:00 PM) when atmospheric mixing height is highest.\n- **Peak hazard**: Keep windows tightly shut between 6:00 AM – 10:00 AM and 6:00 PM – 10:00 PM when thermal inversion traps ground-level pollution.`;
  }

  if (
    q.includes('purifier') ||
    q.includes('filter') ||
    q.includes('hepa') ||
    q.includes('फिल्टर') ||
    q.includes('प्यूरीफायर')
  ) {
    if (isHi) {
      return `कमरे के अंदर PM2.5 को कम करने के लिए एयर प्यूरीफायर सबसे प्रभावी उपाय है:\n\n- **सस्ता DIY विकल्प**: एक बॉक्स फैन के पीछे MERV-13 या HEPA फिल्टर टेप करके आप ₹1,500–₹2,500 में 60–80% तक PM2.5 घटा सकते हैं।\n- **व्यावसायिक प्यूरीफायर**: यदि खरीद रहे हैं, तो सुनिश्चित करें कि उसमें 'True HEPA' H13 फिल्टर हो और कमरे के क्षेत्रफल के अनुसार पर्याप्त CADR रेटिंग हो।\n- **आयनलाइज़र से बचें**: ओजोन (Ozone) पैदा करने वाले आयनलाइज़र फेफड़ों के लिए हानिकारक होते हैं।`;
    }
    return `Indoor air purification guidance for ${location.name}:\n\n- **Affordable DIY Corsi-Rosenthal style box**: Taping a MERV-13 or HEPA furnace filter to a standard box fan provides 60–80% particulate filtration for under ₹2,000.\n- **Commercial Purifiers**: Look for certified True HEPA (H13) mechanical filters with appropriate CADR (Clean Air Delivery Rate) for your room size.\n- **Avoid Ozone generators**: Steer clear of ionizers or electronic precipitators that emit secondary ozone, which irritates bronchial pathways.`;
  }

  if (
    q.includes('cook') ||
    q.includes('kitchen') ||
    q.includes('gas') ||
    q.includes('रसोई') ||
    q.includes('खाना') ||
    q.includes('धुआं')
  ) {
    if (isHi) {
      return `रसोई में खाना पकाने से घर के अंदर PM2.5 और NO2 का स्तर 3–5 गुना तक बढ़ सकता है:\n\n- **एग्जॉस्ट फैन**: खाना पकाते समय एग्जॉस्ट फैन या चिमनी अनिवार्य रूप से चलाएं।\n- **कमरे अलग रखें**: खाना बनाते समय रसोई का दरवाजा बंद रखें ताकि धुआं बेडरूम और लिविंग रूम में न फैले।\n- **तड़का व डीप-फ्राइंग**: स्मॉग वाले दिनों में अत्यधिक तेल में तलने से बचें क्योंकि यह अत्यधिक अल्ट्राफाइन कण उत्पन्न करता है।`;
    }
    return `Indoor cooking contributes significantly to spike indoor PM2.5 and NO2 levels:\n\n- **Exhaust ventilation**: Always run an exhaust chimney or kitchen fan at full power during stove use.\n- **Isolate living areas**: Close the kitchen door to prevent cooking fumes from spreading to sleeping areas.\n- **Cooking technique**: Minimize high-heat deep-frying or intense tempering (tadka) during peak smog days, as these generate massive concentrations of ultrafine aerosols.`;
  }

  if (
    q.includes('commute') ||
    q.includes('travel') ||
    q.includes('metro') ||
    q.includes('traffic') ||
    q.includes('सफर') ||
    q.includes('यात्रा') ||
    q.includes('मेट्रो')
  ) {
    if (isHi) {
      return `स्मॉग के दौरान यात्रा संबंधी सावधानियां:\n\n- **मेट्रो या एसी बसें**: दोपहिया वाहन या ऑटो की तुलना में मेट्रो और बंद एसी बसों में 50–70% कम प्रदूषण का सामना करना पड़ता है।\n- **कार में रीसर्क्युलेशन**: कार चलाते समय एसी को 'Recirculation Mode' (अंदरूनी हवा) पर रखें ताकि बाहरी जहरीली हवा अंदर न खिंचे।\n- **मास्क**: सड़क पर या प्लेटफॉर्म पर हमेशा N95 मास्क पहने रहें।`;
    }
    return `Commute exposure reduction tactics:\n\n- **Mode selection**: Metro rails and closed AC electric buses cut in-transit PM2.5 exposure by 50–70% compared to open two-wheelers, cycling, or autos.\n- **Cabin air circulation**: When driving, switch car HVAC to **Recirculation mode** so ambient exhaust fumes aren't sucked into the cabin.\n- **Respirator**: Wear an N95 at transit platforms and during open street walking.`;
  }

  if (
    q.includes('hi') ||
    q.includes('hello') ||
    q.includes('hey') ||
    q.includes('namaste') ||
    q.includes('नमस्ते') ||
    q.includes('help') ||
    q.includes('मदद')
  ) {
    if (isHi) {
      return `नमस्ते! मैं 'सांस' (Saans) हूं, आपका वायु गुणवत्ता सहायक।\n\nवर्तमान में ${location.name} में AQI **${aqi.usAqi}** है। मैं आपको बता सकता हूं कि:\n1. आज कौन सा मास्क पहनना चाहिए?\n2. खिड़कियां कब खोलनी चाहिए?\n3. बच्चों और बुजुर्गों की सुरक्षा कैसे करें?\n4. कम बजट में इनडोर हवा कैसे साफ करें?\n\nआप क्या जानना चाहते हैं?`;
    }
    return `Hello! I am **Saans**, your urban air quality and respiratory health advisor.\n\nThe current AQI in ${location.name} is **${aqi.usAqi}** (Risk level: **${risk.tier}**).\n\nYou can ask me about:\n- **Masks & Respirators**: Best types, fit guidance, and N95 durability\n- **Ventilation Windows**: Cleanest hours to air out your home\n- **Vulnerable Groups**: Safety guidelines for children, elderly, and asthma patients\n- **Affordable Indoor Hacks**: Low-cost DIY filtration and cooking tips\n\nWhat would you like assistance with today?`;
  }

  // Default personalized overview
  const topTips = actions
    .slice(0, 3)
    .map((a, i) => `${i + 1}. **${a.action.title[language]}**: ${a.action.description[language]}`)
    .join('\n');
  if (isHi) {
    return `वर्तमान में ${location.name} का AQI ${aqi.usAqi} है और आपके परिवार का जोखिम स्तर "${risk.tier}" है।\n\nआपके लिए शीर्ष सुझाव:\n${topTips}\n\nआप किसी भी विशिष्ट उपाय या स्वास्थ्य संबंधी सवाल पूछ सकते हैं!`;
  }

  return `Currently in ${location.name}, the AQI is **${aqi.usAqi}** (risk level: **${risk.tier}**).\n\nKey actions for your household right now:\n${topTips}\n\nFeel free to ask about masks, ventilation windows, indoor filtration, or commute safety!`;
}

/**
 * Send a message in the Saans chat and stream the response.
 * Returns an async generator that yields text chunks.
 *
 * @param userMessage - The user's message (will be sanitized)
 * @param history - Previous chat messages (trimmed to MAX_CHAT_HISTORY)
 * @param context - Current AQI and profile context for grounding
 * @param signal - AbortSignal for cancellation
 */
export async function* sendChatMessage(
  userMessage: string,
  history: readonly ChatMessage[],
  context: ChatContext,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const sanitized = sanitizeForPrompt(userMessage);
  if (!sanitized) return;

  const contextBlock = buildContextBlock(context);
  const trimmedHistory = history.slice(-MAX_CHAT_HISTORY);

  // Build conversation history for Gemini
  const contents = [
    ...trimmedHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [
        {
          type: 'text' as const,
          text: msg.role === 'user' ? `<user_data>${msg.content}</user_data>` : msg.content,
        },
      ],
    })),
    {
      role: 'user' as const,
      parts: [
        { type: 'text' as const, text: `${contextBlock}\n\n<user_data>${sanitized}</user_data>` },
      ],
    },
  ];

  let streamedAny = false;

  // Attempt live Gemini streaming with primary model first, then fallback model
  for (const useFallback of [false, true]) {
    try {
      const model = getGeminiModel(useFallback);
      const result = await model.generateContentStream({
        contents,
        systemInstruction: {
          role: 'system',
          parts: [{ type: 'text' as const, text: SYSTEM_INSTRUCTION_CHAT }],
        },
        generationConfig: {
          temperature: GEMINI_TEMPERATURE,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      });

      for await (const chunk of result.stream) {
        if (signal?.aborted) return;
        const text = chunk.text();
        if (text) {
          streamedAny = true;
          yield text;
        }
      }

      if (streamedAny) return;
    } catch (err) {
      console.warn(`[Saans] Gemini streaming attempt (fallback=${useFallback}) failed:`, err);
      if (signal?.aborted) return;
    }
  }

  // If live streaming failed, stream the grounded deterministic domain answer!
  if (!streamedAny) {
    const grounded = getGroundedLocalAnswer(sanitized, context);
    const words = grounded.split(' ');
    for (const word of words) {
      if (signal?.aborted) return;
      yield word + ' ';
      // Small tick to provide smooth, natural streaming
      await new Promise((r) => setTimeout(r, 20));
    }
  }
}

/** Get suggested questions based on current context */
export function getSuggestedQuestions(language: Language): readonly string[] {
  if (language === 'hi') {
    return [
      'क्या आज बाहर व्यायाम करना सुरक्षित है?',
      'मैं अपने बच्चों को कैसे बचा सकता/सकती हूं?',
      'घर की हवा साफ करने का सबसे सस्ता तरीका क्या है?',
      'मास्क कब पहनना चाहिए?',
      'हमारा समुदाय प्रदूषण कम करने के लिए क्या कर सकता है?',
    ];
  }

  return [
    'Is it safe to exercise outside today?',
    'How can I protect my children from smog?',
    'What is the cheapest way to improve indoor air?',
    'When should I wear a mask outside?',
    'What can our community do to reduce pollution?',
  ];
}
