// ─── Receipt Scanner — OCR with Tesseract.js (Arabic + English) ───
import { useState, useRef } from 'react';
import { THEME } from '../constants.js';
import { enrichTransaction } from '../services/merchantAI.js';

export default function ReceiptScanner({ onScanComplete, onClose, curr }) {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const processImage = async (file) => {
    setScanning(true);
    setError('');
    
    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Dynamic import of Tesseract
      const Tesseract = await import('tesseract.js');
      
      const worker = await Tesseract.createWorker('eng+ara', 1, {
        logger: () => {}, // suppress logs
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Extract data from OCR text
      const parsed = parseReceiptText(text);
      if (parsed) {
        const enriched = enrichTransaction({
          ...parsed,
          source: 'ocr',
          rawText: text,
        });
        setResult(enriched);
      } else {
        setError('Could not extract transaction data. Try taking a clearer photo.');
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError('Scanning failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const parseReceiptText = (text) => {
    if (!text || text.length < 5) return null;

    // Try to extract total amount
    const amountPatterns = [
      /(?:total|المجموع|الإجمالي|grand total|net|صافي)[:\s]*(?:EGP|SAR|AED|ج\.?م\.?|ر\.?س\.?|د\.?إ\.?)?\s*([0-9,]+\.?\d*)/i,
      /(?:total|المجموع|الإجمالي)[:\s]*([0-9,]+\.?\d*)/i,
      /(?:amount|المبلغ|due|مستحق)[:\s]*(?:EGP|SAR|AED|ج\.?م\.?)?\s*([0-9,]+\.?\d*)/i,
      // Last number on receipt is often the total
    ];

    let amount = null;
    for (const p of amountPatterns) {
      const match = text.match(p);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0 && amount < 1000000) break;
        amount = null;
      }
    }

    // Fallback: find the largest reasonable number
    if (!amount) {
      const numbers = text.match(/\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g);
      if (numbers) {
        const parsed = numbers.map(n => parseFloat(n.replace(/,/g, '')))
          .filter(n => n > 0 && n < 100000);
        if (parsed.length > 0) amount = Math.max(...parsed);
      }
    }

    if (!amount) return null;

    // Extract merchant name (first line often)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const merchant = lines[0]?.substring(0, 50) || 'Receipt Purchase';

    // Extract date
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    let date = new Date();
    if (dateMatch) {
      try {
        const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
        date = new Date(`${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`);
      } catch { /* use today */ }
    }

    return {
      amount,
      merchant,
      date: date.toISOString(),
      type: 'debit',
    };
  };

  const handleApprove = () => {
    if (result && onScanComplete) {
      onScanComplete({
        name: result.merchantNormalized || result.merchant,
        amount: result.amount,
        category: result.category,
        source: 'ocr',
        confidence: result.confidence,
        date: result.date || new Date().toISOString(),
      });
    }
    onClose?.();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(12px)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(180deg, ${THEME.bgTertiary}, ${THEME.bg})`,
        borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 440,
        padding: '28px 24px 40px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: THEME.white10, margin: '0 auto 20px' }} />
        
        <h3 style={{ color: THEME.white, fontSize: 22, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
          📸 Scan Receipt
        </h3>
        <p style={{ color: THEME.white50, fontSize: 13, margin: '0 0 20px', fontFamily: THEME.font }}>
          Take a photo or upload a receipt to auto-track the expense
        </p>

        {!result && !scanning && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && processImage(e.target.files[0])} />
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button onClick={() => {
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }} style={{
                flex: 1, background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                color: THEME.bg, border: 'none', borderRadius: 16, padding: '18px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: THEME.font,
              }}>
                📷 Take Photo
              </button>
              
              <button onClick={() => {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }} style={{
                flex: 1, background: THEME.white06, color: THEME.white,
                border: `1px solid ${THEME.white10}`, borderRadius: 16, padding: '18px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: THEME.font,
              }}>
                📁 Upload
              </button>
            </div>
          </>
        )}

        {scanning && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            {preview && (
              <img src={preview} alt="Receipt" style={{
                maxWidth: '100%', maxHeight: 200, borderRadius: 16, marginBottom: 16,
                opacity: 0.5, objectFit: 'contain',
              }} />
            )}
            <div style={{
              width: 48, height: 48, border: `3px solid ${THEME.white10}`,
              borderTopColor: THEME.accent, borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: THEME.white50, fontSize: 14, fontFamily: THEME.font }}>
              Scanning receipt... (Arabic + English)
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          }}>
            <p style={{ color: THEME.red, fontSize: 13, margin: 0, fontFamily: THEME.font }}>{error}</p>
          </div>
        )}

        {result && (
          <div style={{
            background: THEME.white06, borderRadius: 18, padding: 20,
            border: `1px solid ${THEME.white10}`, marginBottom: 16,
          }}>
            {preview && (
              <img src={preview} alt="Receipt" style={{
                maxWidth: '100%', maxHeight: 150, borderRadius: 12, marginBottom: 16,
                objectFit: 'contain', display: 'block', margin: '0 auto 16px',
              }} />
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, fontSize: 24,
                background: `rgba(0,212,170,0.15)`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>{result.categoryIcon || '📦'}</div>
              <div>
                <p style={{ color: THEME.white, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {result.merchantNormalized || result.merchant}
                </p>
                <p style={{ color: THEME.white40, fontSize: 12, margin: 0 }}>
                  {result.category} • {result.confidence}% confidence
                </p>
              </div>
            </div>

            <div style={{
              background: THEME.white04, borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            }}>
              <p style={{ color: THEME.white40, fontSize: 11, margin: '0 0 4px' }}>Amount</p>
              <p style={{ color: THEME.accent, fontSize: 28, fontWeight: 800, margin: 0 }}>
                {curr?.symbol || 'EGP'} {result.amount?.toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleApprove} style={{
                flex: 1, background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                color: THEME.bg, border: 'none', borderRadius: 14, padding: '14px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: THEME.font,
              }}>✓ Add Expense</button>
              <button onClick={() => { setResult(null); setPreview(null); }} style={{
                background: THEME.white06, color: THEME.white50,
                border: `1px solid ${THEME.white10}`, borderRadius: 14, padding: '14px 20px',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: THEME.font,
              }}>Retry</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
