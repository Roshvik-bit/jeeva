/**
 * Speech Recognition and Voice Dictation Service
 * Supports native Web Speech API with fallback simulation
 */

export const SIMULATED_VOICE_SCRIPTS = [
  "Water has risen past our ground floor windows! There are 4 of us trapped, including a 70-year-old grandfather who needs oxygen. Please send a rescue boat right away!",
  "A massive tree and electric pole fell onto our car on Hill Link Road. Road is blocked both sides, we cannot get out due to mud. Send clearing machinery!",
  "Two buildings collapsed near the market cross. We can hear shouting from beneath the concrete slabs. Send search dogs and ambulance immediately!",
  "Heavy water current broke the gate! We have 12 people on the terrace with no drinking water or food. Battery is at 5 percent!",
  "Transformer exploded with sparks in front of our house, standing water is charged with current, nobody can step outside!"
];

export const speechService = {
  isSupported: () => {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  },

  createRecognitionInstance: (onResult, onError, onEnd) => {
    if (!speechService.isSupported()) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Default to Indian English, can switch to regional

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript && onResult) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return recognition;
  },

  /**
   * Generates a realistic distress dictation for simulation/testing
   */
  getRandomDistressScript: () => {
    const idx = Math.floor(Math.random() * SIMULATED_VOICE_SCRIPTS.length);
    return SIMULATED_VOICE_SCRIPTS[idx];
  }
};
