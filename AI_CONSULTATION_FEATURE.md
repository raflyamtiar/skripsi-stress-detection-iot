# AI Consultation Feature

## Overview

Fitur konsultasi AI menggunakan Groq API (model llama-3.3-70b-versatile) untuk memberikan rekomendasi penanganan stress kepada user yang terdeteksi mengalami high stress.

## Flow

1. **Stress Warning Modal** - Muncul ketika user terdeteksi high stress
2. **Problem Selection Modal** - User memilih masalah yang dialami (checkbox)
3. **Story Modal** - User menceritakan masalah secara singkat
4. **AI Processing** - Request ke Groq API untuk generate solusi
5. **Solution Page** - Menampilkan solusi dari AI dengan UI yang menarik

## Technical Details

### Environment Variables

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Files Created/Modified

- `src/components/StressWarningModal.jsx` - Added "Konsultasikan" button
- `src/components/ProblemSelectionModal.jsx` - NEW: Modal untuk pilih masalah
- `src/components/StoryModal.jsx` - NEW: Modal untuk cerita masalah
- `src/lib/groqService.js` - NEW: Service untuk Groq API
- `src/pages/AISolution.jsx` - NEW: Halaman hasil solusi
- `src/pages/Dashboard.jsx` - Integrated AI consultation flow
- `src/App.jsx` - Added route `/session/:sessionId/solution`
- `src/index.css` - Added fadeIn animation

### Token Optimization

- Prompt dirancang ringkas namun efektif (maksimal 150 kata output)
- Max tokens: 800 untuk menghemat quota
- Error handling untuk rate limit (status 429)

### Data Storage

Solutions disimpan di localStorage dengan key pattern:

```javascript
`ai_solution_${sessionId}`;
```

Data structure:

```javascript
{
  problems: ["Masalah 1", "Masalah 2"],
  story: "Cerita user...",
  solution: "Solusi dari AI...",
  timestamp: "2026-01-22T..."
}
```

## Features

- ✅ Multi-step modal flow
- ✅ Problem selection dengan custom input
- ✅ Word count validation (15 kata untuk custom, 100 kata untuk cerita)
- ✅ Loading state saat request AI
- ✅ Error handling untuk rate limit & network errors
- ✅ Responsive design (mobile-friendly)
- ✅ Print & share functionality
- ✅ Beautiful UI with gradients & animations

## Testing Checklist

- [ ] Modal flow (Warning → Problem → Story)
- [ ] Back navigation works correctly
- [ ] Validation for word counts
- [ ] AI request & response
- [ ] LocalStorage save & retrieve
- [ ] Redirect to solution page
- [ ] Solution page displays correctly
- [ ] Responsive on mobile
- [ ] Print functionality
- [ ] Share functionality
- [ ] Error handling (rate limit, no API key, network error)
