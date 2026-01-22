// Groq AI Service untuk konsultasi stress
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

/**
 * Generate AI solution untuk masalah stress
 * @param {Array<string>} problems - Daftar masalah yang dipilih user
 * @param {string} story - Cerita detail dari user
 * @returns {Promise<string>} - Solusi dari AI dalam format markdown
 */
export async function getAISolution(problems, story) {
  try {
    // Validasi input
    if (!problems || problems.length === 0) {
      throw new Error("Masalah harus dipilih minimal 1");
    }

    // Jika cerita kosong, gunakan teks default
    const userStory =
      story && story.trim().length > 0
        ? story.trim()
        : "Saya tidak ingin menceritakan detail lebih lanjut, tolong berikan solusi umum yang bisa membantu.";

    // Buat prompt yang efisien dan terstruktur
    const prompt = buildPrompt(problems, userStory);

    // Request ke Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah seorang psikolog profesional yang sangat empatis dan pengertian. Kamu berbicara dengan hangat, mendukung, dan memahami perasaan orang lain. Berikan solusi yang praktis, logis, dan mudah diterapkan dalam kehidupan sehari-hari. Gunakan bahasa yang natural seperti berbicara dengan teman dekat yang peduli.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200, // Dinaikkan untuk output yang lebih lengkap
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle rate limit error
      if (response.status === 429) {
        throw new Error(
          "Limit penggunaan AI tercapai. Silakan coba lagi dalam beberapa saat.",
        );
      }

      throw new Error(
        errorData.error?.message || `Groq API error: ${response.status}`,
      );
    }

    const data = await response.json();

    // Validasi response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Response AI tidak valid");
    }

    const solution = data.choices[0].message.content.trim();

    if (!solution) {
      throw new Error("AI tidak memberikan solusi");
    }

    return solution;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}

/**
 * Build prompt yang efisien untuk menghemat token
 */
function buildPrompt(problems, story) {
  const problemList = problems.join(", ");

  return `Saya sedang mengalami stress yang cukup berat terkait: ${problemList}

Cerita saya:
${story}

Tolong bantu saya dengan memberikan respon yang hangat dan solutif. Gunakan format berikut:

## Analisis Singkat
[Mulai dengan kalimat penenang dan empati, tunjukkan bahwa kamu memahami perasaannya. Lalu berikan analisis situasi dengan bahasa yang hangat dan supportif, 3-4 kalimat]

## Solusi Praktis
[Berikan 4-5 solusi konkret yang logis, spesifik, dan mudah diterapkan. Gunakan penjelasan yang cukup detail agar mudah dipahami dan langsung bisa dipraktikkan]

## Tips Tambahan
[Berikan 2-3 tips praktis yang supportif dan encouraging. Akhiri dengan kata-kata penyemangat]

Penting: Gunakan bahasa yang natural, hangat, dan relatable. Berbicara seperti teman yang sangat peduli dan pengertian, bukan formal seperti textbook. Maksimal 300 kata total.`;
}

/**
 * Simpan hasil AI ke localStorage
 */
export function saveAISolution(sessionId, data) {
  const key = `ai_solution_${sessionId}`;
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Ambil hasil AI dari localStorage
 */
export function getAISolutionFromStorage(sessionId) {
  const key = `ai_solution_${sessionId}`;
  const data = localStorage.getItem(key);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error parsing AI solution from localStorage:", error);
    return null;
  }
}

/**
 * Cek apakah session memiliki AI solution
 */
export function hasAISolution(sessionId) {
  if (!sessionId) return false;
  const key = `ai_solution_${sessionId}`;
  return localStorage.getItem(key) !== null;
}
