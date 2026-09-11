/**
 * Advanced Speech Recognition & Audio Recording Service
 * Provides:
 * 1. Real MediaRecorder audio recording with playable Blob URL generation
 * 2. Real Web Audio API frequency analysis for true microphone waveform response
 * 3. Multilingual Web Speech API (Speech-to-Text) with live interim & final dictation
 * 4. Comprehensive disaster response simulated scripts across all 7 supported languages
 */

export const LANG_LOCALE_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  ml: "ml-IN",
  mr: "mr-IN"
};

export const MULTILINGUAL_DISTRESS_SCRIPTS = {
  en: [
    "Water has risen past our ground floor windows! There are 4 of us trapped on the terrace, including an elderly person who needs medical attention. Please send a rescue boat right away!",
    "A massive tree and electric pole fell across the main bypass road. Vehicles are completely blocked and water is rising. Send clearing machinery and road assistance!",
    "Structural collapse near the central market crossroad. We can hear people shouting for help from beneath the debris. Send search and rescue teams immediately!",
    "Heavy flood current broke our boundary wall! 12 residents are stranded without drinking water or power. Mobile battery is critically low!",
    "Electrical transformer sparking and partially submerged in floodwater outside our house. Water is charged, nobody can step outside!"
  ],
  hi: [
    "बाढ़ का पानी हमारे घर के पहले माले तक पहुंच गया है! हम 4 लोग छत पर फंसे हैं, एक बुजुर्ग मरीज को दवा और ऑक्सीजन की जरूरत है। तुरंत बचाव नाव भेजें!",
    "मुख्य सड़क पर भारी पेड़ और बिजली का खंभा गिर गया है। रास्ता दोनों तरफ से बंद है और पानी भर रहा है। कृपया तुरंत क्रेन और बचाव दल भेजें!",
    "बाजार के पास एक पुराना भवन ढह गया है। मलबे के नीचे से लोगों के चिल्लाने की आवाज आ रही है। कृपया एनडीआरएफ और एम्बुलेंस तुरंत भेजें!",
    "तेज बहाव में सुरक्षा दीवार टूट गई है। 12 लोग बिना पीने के पानी और भोजन के फंसे हैं। फोन की बैटरी केवल 5 प्रतिशत बची है!",
    "हमारे घर के बाहर बिजली का ट्रांसफार्मर पानी में डूब गया है और चिंगारी निकल रही है। पानी में करंट का खतरा है, कोई बाहर नहीं निकल पा रहा है!"
  ],
  bn: [
    "আমাদের বাড়ির নিচতলা সম্পূর্ণ জলে ডুবে গেছে! আমরা ৪ জন ছাদে আটকে আছি, অবিলম্বে উদ্ধারকারী নৌকা ও সাহায্য পাঠান!",
    "ঝড়ে বড় গাছ ও বিদ্যুতের খুঁটি ভেঙে প্রধান রাস্তা সম্পূর্ণ বন্ধ হয়ে গেছে। জল ক্রমশ বাড়ছে, জরুরি দল পাঠান!",
    "মার্কেটের কাছে একটি পুরনো বাড়ি ভেঙে পড়েছে। ধ্বংসস্তূপের নিচে মানুষ আটকে আছে, অবিলম্বে অ্যাম্বুলেন্স পাঠান!"
  ],
  ta: [
    "எங்கள் வீட்டின் தரைத்தளம் வரை வெள்ள நீர் சூழ்ந்துள்ளது! 4 பேர் மொட்டை மாடியில் சிக்கியுள்ளோம், உடனடியாக மீட்புப் படகை அனுப்பவும்!",
    "பிரதான சாலையில் பெரிய மரம் மற்றும் மின்கம்பம் சாய்ந்து பாதை அடைக்கப்பட்டுள்ளது. உடனடியாக மீட்புக் குழுவை அனுப்பவும்!",
    "கட்டட இடிபாடுகளுக்குள் சிலர் சிக்கியுள்ளனர், அவசர முதலுதவி மற்றும் ஆம்புலன்ஸ் தேவைப்படுகிறது!"
  ],
  te: [
    "వరద నీరు మా ఇంటి మొదటి అంతస్తు వరకు చేరింది! మేము నలుగురం మేడపై చిక్కుకున్నాము, దయచేసి వెంటనే రెస్క్యూ బోట్ పంపండి!",
    "ప్రధాన రహదారిపై చెట్లు మరియు విద్యుత్ స్తంభాలు కూలిపోయాయి. రాకపోకలు పూర్తిగా నిలిచిపోయాయి, సహాయం పంపండి!",
    "భవనం కూలిపోయి శిథిలాల కింద ప్రజలు చిక్కుకున్నారు. వెంటనే అంబులెన్స్ మరియు సహాయక బృందాలను పంపించండి!"
  ],
  ml: [
    "വെള്ളം ഞങ്ങളുടെ വീടിന്റെ താഴത്തെ നിലയിലേക്ക് കയറി! ഞങ്ങൾ 4 പേർ മുകളിൽ കുടുങ്ങിക്കിടക്കുകയാണ്, ഉടൻ രക്ഷാ ബോട്ട് അയക്കുക!",
    "പ്രധാന റോഡിൽ വലിയ മരം വീണ് ഗതാഗതം പൂർണ്ണമായി തടസ്സപ്പെട്ടു. വെള്ളം ഉയർന്നുകൊണ്ടിരിക്കുന്നു, ഉടൻ സഹായം എത്തിക്കുക!",
    "കെട്ടിടം തകർന്ന് അവശിഷ്ടങ്ങൾക്കടിയിൽ ആളുകൾ കുടുങ്ങിക്കിടക്കുന്നു. ഉടൻ ആംബുലൻസും രക്ഷാപ്രവർത്തകരെയും അയക്കുക!"
  ],
  mr: [
    "पूर परिस्थिती गंभीर असून पाणी घरात शिरले आहे! आम्ही ४ जण छतावर अडकलो आहोत, कृपया तातडीने बचाव बोट पाठवा!",
    "मुख्य रस्त्यावर झाड आणि विजेचा खांब पडल्याने रस्ता पूर्णपणे बंद झाला आहे. त्वरित मदत पथक पाठवा!",
    "इमारत कोसळून ढिगाऱ्याखाली लोक अडकले आहेत, कृपया तातडीने रुग्णवाहिका आणि बचाव दल पाठवा!"
  ]
};

export const speechService = {
  /**
   * Check if the browser supports the Web Speech API
   */
  isSpeechSupported: () => {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  },

  /**
   * Check if the browser supports MediaRecorder for real audio recording
   */
  isMediaRecorderSupported: () => {
    return (
      typeof window !== "undefined" &&
      navigator?.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== "undefined"
    );
  },

  /**
   * Determine best supported audio mime type
   */
  getSupportedMimeType: () => {
    if (typeof window === "undefined" || !window.MediaRecorder) return "";
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/wav"
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  },

  /**
   * Create a Web Speech Recognition instance
   */
  createRecognitionInstance: ({ language = "en", onResult, onError, onEnd, onStart }) => {
    if (!speechService.isSpeechSupported()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = LANG_LOCALE_MAP[language] || "en-IN";

    let accumulatedFinal = "";

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const transcriptPart = item[0]?.transcript || "";
        if (item.isFinal) {
          accumulatedFinal += (accumulatedFinal ? " " : "") + transcriptPart.trim();
        } else {
          currentInterim += transcriptPart;
        }
      }

      const fullCombined = [accumulatedFinal, currentInterim].filter(Boolean).join(" ").trim();

      if (onResult) {
        onResult({
          transcript: fullCombined,
          isFinal: !currentInterim && Boolean(accumulatedFinal),
          interim: currentInterim,
          final: accumulatedFinal
        });
      }
    };

    recognition.onerror = (event) => {
      console.warn("Web Speech Recognition event error:", event.error);
      let userFriendlyMessage = "Speech recognition error occurred.";

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        userFriendlyMessage = "Microphone permission was denied. Please allow microphone access in your browser.";
      } else if (event.error === "network") {
        userFriendlyMessage = "Network connectivity issue with speech recognition service.";
      } else if (event.error === "no-speech") {
        userFriendlyMessage = "No speech detected. Please speak clearly near your microphone.";
      } else if (event.error === "audio-capture") {
        userFriendlyMessage = "No microphone hardware detected or audio input is busy.";
      }

      if (onError) {
        onError({
          code: event.error,
          message: userFriendlyMessage
        });
      }
    };

    recognition.onend = () => {
      if (onEnd) onEnd({ finalTranscript: accumulatedFinal });
    };

    return recognition;
  },

  /**
   * Start a real MediaRecorder audio recording session with live Web Audio frequency analysis
   */
  startMediaRecording: async ({ onWaveformLevels, onTimerTick }) => {
    if (!speechService.isMediaRecorderSupported()) {
      throw new Error("MediaRecorder or Microphone access is not supported in this browser environment.");
    }

    // 1. Request microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // 2. Set up AudioContext & Analyser for real live waveform visualization
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationInterval = null;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Periodically sample frequency data to produce 10 responsive bar heights
        animationInterval = setInterval(() => {
          if (!analyser || !dataArray) return;
          analyser.getByteFrequencyData(dataArray);

          // Sample 10 representative buckets
          const levels = [];
          const step = Math.max(1, Math.floor(bufferLength / 10));
          for (let i = 0; i < 10; i++) {
            const val = dataArray[i * step] || 0;
            // Map 0-255 to 10px-48px height with smooth base
            const mappedHeight = Math.min(48, Math.max(10, Math.floor((val / 255) * 44) + 10));
            levels.push(mappedHeight);
          }

          if (onWaveformLevels) {
            onWaveformLevels(levels);
          }
        }, 90);
      }
    } catch (err) {
      console.warn("Web Audio API visualizer initialization failed:", err);
    }

    // 3. Set up MediaRecorder
    const mimeType = speechService.getSupportedMimeType();
    const options = mimeType ? { mimeType } : undefined;
    const mediaRecorder = new MediaRecorder(stream, options);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    // 4. Elapsed time timer
    let secondsElapsed = 0;
    const timerInterval = setInterval(() => {
      secondsElapsed += 1;
      if (onTimerTick) {
        onTimerTick(secondsElapsed);
      }
    }, 1000);

    mediaRecorder.start(150); // Collect slices every 150ms

    return {
      stream,
      mediaRecorder,
      audioChunks,
      audioContext,
      animationInterval,
      timerInterval,
      getDuration: () => secondsElapsed
    };
  },

  /**
   * Stop a real MediaRecorder audio recording session and return Blob + playable URL
   */
  stopMediaRecording: (session) => {
    return new Promise((resolve) => {
      if (!session || !session.mediaRecorder) {
        resolve(null);
        return;
      }

      const {
        stream,
        mediaRecorder,
        audioChunks,
        audioContext,
        animationInterval,
        timerInterval,
        getDuration
      } = session;

      // Clear timers
      if (animationInterval) clearInterval(animationInterval);
      if (timerInterval) clearInterval(timerInterval);

      // Stop audio tracks so browser recording indicator turns off
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Close audio context
      if (audioContext && audioContext.state !== "closed") {
        try {
          audioContext.close();
        } catch (e) {}
      }

      mediaRecorder.onstop = () => {
        const mimeType = speechService.getSupportedMimeType() || "audio/webm";
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = getDuration ? getDuration() : 0;

        resolve({
          blob: audioBlob,
          url: audioUrl,
          duration,
          mimeType,
          sizeBytes: audioBlob.size
        });
      };

      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      } else {
        const mimeType = speechService.getSupportedMimeType() || "audio/webm";
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve({
          blob: audioBlob,
          url: audioUrl,
          duration: getDuration ? getDuration() : 0,
          mimeType,
          sizeBytes: audioBlob.size
        });
      }
    });
  },

  /**
   * Format seconds to mm:ss
   */
  formatDuration: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * Generates a realistic distress dictation for simulation/testing in active language
   */
  getRandomDistressScript: (language = "en") => {
    const scripts = MULTILINGUAL_DISTRESS_SCRIPTS[language] || MULTILINGUAL_DISTRESS_SCRIPTS.en;
    const idx = Math.floor(Math.random() * scripts.length);
    return scripts[idx];
  }
};
