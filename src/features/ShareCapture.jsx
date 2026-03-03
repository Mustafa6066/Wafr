import { ClipboardList, Camera, Zap, CreditCard, Bot, CheckCircle2, Star, Lock, Apple } from "lucide-react";
import React from 'react';
/**
 * ShareCapture — Universal Payment Capture UI
 * 
 * The user's entry point for all smart capture methods:
 * 1. Paste any message (SMS, WhatsApp, bank notification)
 * 2. Share a screenshot from any payment app
 * 3. Quick-add from InstaPay, Fawry, Vodafone Cash, etc.
 * 4. Auto-detect from photo (OCR)
 * 
 * All processing is 100% on-device. Supports Arabic + English.
 */
import { useState, useRef } from 'react';
import { THEME } from '../constants.js';
import { useApp } from '../WafrApp.jsx';
import { useTransactionInboxStore, usePrivacyStore } from '../store/index.js';
import { parsePaymentText, parseScreenshot, getSupportedPlatforms, DEMO_SHARES } from '../services/smartCapture.js';

// ─── Capture Methods ───
const CAPTURE_METHODS = [
  { id: 'paste', icon: React.createElement(ClipboardList, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), name: 'Paste Message', desc: 'WhatsApp, SMS, bank alert', nameAr: 'لصق رسالة' },
  { id: 'screenshot', icon: React.createElement(Camera, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), name: 'Scan Screenshot', desc: 'Photo of payment screen', nameAr: 'مسح سكرين شوت' },
  { id: 'quick', icon: React.createElement(Zap, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }), name: 'Quick Platforms', desc: 'InstaPay, Fawry, VF Cash...', nameAr: 'منصات سريعة' },
];

export default function ShareCapture() {
  const { curr } = useApp();
  const addPending = useTransactionInboxStore(s => s.addPending);
  const addAuditEntry = usePrivacyStore(s => s.addAuditEntry);

  const [activeMethod, setActiveMethod] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const fileInputRef = useRef(null);

  const platforms = getSupportedPlatforms();

  // Handle paste/message parsing
  const handleParse = (text, source = 'paste') => {
    if (!text?.trim()) return;

    const parsed = parsePaymentText(text.trim(), source);

    // Audit log
    addAuditEntry({
      type: parsed.blocked ? 'blocked' : parsed.success ? 'parsed' : 'skipped',
      source: source,
      platform: parsed.platform?.name || null,
      timestamp: Date.now(),
    });

    if (parsed.blocked) {
      setResult({ success: false, msg: ' OTP/verification message — blocked for your safety' });
    } else if (parsed.success) {
      addPending(parsed.transaction);
      setResult({
        success: true,
        platform: parsed.platform,
        msg: `${parsed.transaction.currency} ${parsed.transaction.parsedAmount.toLocaleString()} from ${parsed.platform?.name || parsed.transaction.bank}`,
        merchant: parsed.transaction.parsedMerchant,
      });
    } else {
      setResult({ success: false, msg: 'No transaction found. Try pasting a bank notification or payment confirmation.' });
    }

    setPasteText('');
    setTimeout(() => setResult(null), 5000);
  };

  // Handle screenshot OCR
  const handleScreenshot = async (file) => {
    if (!file) return;
    setScanning(true);
    setResult(null);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Dynamic import Tesseract.js for OCR
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('eng+ara', 1, { logger: () => {} });
      const { data: { text: ocrText } } = await worker.recognize(file);
      await worker.terminate();

      if (!ocrText || ocrText.trim().length < 5) {
        setResult({ success: false, msg: 'Could not read text from this image. Try a clearer screenshot.' });
        setScanning(false);
        return;
      }

      const parsed = parseScreenshot(ocrText, 'screenshot');

      addAuditEntry({
        type: parsed.success ? 'parsed' : 'skipped',
        source: 'screenshot',
        platform: parsed.platform?.name || null,
        timestamp: Date.now(),
      });

      if (parsed.success) {
        addPending(parsed.transaction);
        setResult({
          success: true,
          platform: parsed.platform,
          msg: `${parsed.transaction.currency} ${parsed.transaction.parsedAmount.toLocaleString()} detected from screenshot`,
          merchant: parsed.transaction.parsedMerchant,
        });
      } else {
        setResult({ success: false, msg: 'No transaction found in this screenshot. Try a payment confirmation screen.' });
      }
    } catch (err) {
      console.error('OCR error:', err);
      setResult({ success: false, msg: 'Scanning failed. Please try again with a clearer image.' });
    } finally {
      setScanning(false);
    }
  };

  // Handle demo
  const runDemo = (demo) => {
    handleParse(demo.text, demo.source);
    setShowDemo(false);
  };

  return (
    <div style={{ padding: '16px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}><Star size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></div>
        <h2 style={{ color: THEME.white, fontSize: 22, fontWeight: 800, margin: '0 0 4px', fontFamily: THEME.font }}>
          Smart Capture
        </h2>
        <p style={{ color: THEME.white40, fontSize: 13, margin: 0, fontFamily: THEME.font }}>
          Paste, share, or scan — we'll auto-detect the payment
        </p>
      </div>

      {/* Security Badge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,184,148,0.04))',
        borderRadius: 12, padding: '8px 14px', marginBottom: 16,
        border: '1px solid rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}><Lock size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
        <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font }}>
          100% on-device processing · OTPs auto-blocked · No data uploaded
        </p>
      </div>

      {/* Capture Method Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {CAPTURE_METHODS.map(method => (
          <button key={method.id} onClick={() => { setActiveMethod(method.id); setResult(null); setPreview(null); }} style={{
            flex: 1, background: activeMethod === method.id
              ? `linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,212,170,0.06))`
              : THEME.cardBg,
            border: `1px solid ${activeMethod === method.id ? 'rgba(0,212,170,0.25)' : THEME.cardBorder}`,
            borderRadius: 14, padding: '12px 8px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 20 }}>{method.icon}</span>
            <span style={{
              color: activeMethod === method.id ? THEME.accent : THEME.white50,
              fontSize: 10, fontWeight: 700, fontFamily: THEME.font, textAlign: 'center',
            }}>{method.name}</span>
          </button>
        ))}
      </div>

      {/* ── PASTE METHOD ── */}
      {activeMethod === 'paste' && (
        <div style={{
          background: THEME.cardBg, borderRadius: 20, padding: '18px',
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 12,
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
            Paste any payment message
          </p>
          <p style={{ color: THEME.white30, fontSize: 11, margin: '0 0 10px', fontFamily: THEME.font }}>
            Works with: SMS, WhatsApp, bank app notifications, payment confirmations
          </p>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`Paste here...

Examples:
• "Transfer of EGP 500 to Ahmed successful via InstaPay"
• "تم خصم 1,250 ج.م من حسابك ببنك مصر"
• "Fawry payment EGP 150 for WE Internet"`}
            style={{
              width: '100%', background: THEME.white04, border: `1px solid ${THEME.white10}`,
              borderRadius: 12, padding: '12px', color: THEME.white, fontSize: 13,
              outline: 'none', fontFamily: THEME.font, minHeight: 100, resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => handleParse(pasteText)} disabled={!pasteText.trim()} style={{
              flex: 1,
              background: pasteText.trim() ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : THEME.white10,
              color: pasteText.trim() ? THEME.bg : THEME.white30,
              border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700,
              cursor: pasteText.trim() ? 'pointer' : 'default', fontFamily: THEME.font,
            }}>
              Detect Payment 
            </button>
            <button onClick={() => setShowDemo(!showDemo)} style={{
              background: THEME.white06, border: `1px solid ${THEME.white10}`,
              borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', color: THEME.white50, fontFamily: THEME.font,
            }}>
              Demo
            </button>
          </div>
        </div>
      )}

      {/* ── SCREENSHOT METHOD ── */}
      {activeMethod === 'screenshot' && (
        <div style={{
          background: THEME.cardBg, borderRadius: 20, padding: '18px',
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 12,
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: '0 0 8px', fontFamily: THEME.font }}>
            Upload a payment screenshot
          </p>
          <p style={{ color: THEME.white30, fontSize: 11, margin: '0 0 14px', fontFamily: THEME.font }}>
            InstaPay success screen, Fawry receipt, bank transfer confirmation, any payment app
          </p>

          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleScreenshot(e.target.files[0])}
          />

          {preview ? (
            <div style={{ marginBottom: 12 }}>
              <img src={preview} alt="Screenshot" style={{
                width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'contain',
                background: THEME.white04,
              }} />
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} style={{
              width: '100%', background: 'rgba(0,212,170,0.06)', border: `2px dashed rgba(0,212,170,0.2)`,
              borderRadius: 16, padding: '32px 20px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 36 }}><Camera size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /></span>
              <span style={{ color: THEME.accent, fontSize: 14, fontWeight: 700, fontFamily: THEME.font }}>
                Tap to upload screenshot
              </span>
              <span style={{ color: THEME.white30, fontSize: 11, fontFamily: THEME.font }}>
                or take a photo of a receipt
              </span>
            </button>
          )}

          {scanning && (
            <div style={{
              background: 'rgba(0,212,170,0.08)', borderRadius: 12, padding: '14px',
              border: '1px solid rgba(0,212,170,0.12)', textAlign: 'center', marginTop: 8,
            }}>
              <p style={{ color: THEME.accent, fontSize: 13, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
                 Scanning with on-device OCR (Arabic + English)...
              </p>
            </div>
          )}

          {preview && !scanning && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setPreview(null); fileInputRef.current?.click(); }} style={{
                flex: 1, background: THEME.white06, border: `1px solid ${THEME.white10}`,
                borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', color: THEME.white50, fontFamily: THEME.font,
              }}>Try Another</button>
            </div>
          )}
        </div>
      )}

      {/* ── QUICK PLATFORMS METHOD ── */}
      {activeMethod === 'quick' && (
        <div style={{
          background: THEME.cardBg, borderRadius: 20, padding: '18px',
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 12,
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: '0 0 12px', fontFamily: THEME.font }}>
            Supported Payment Platforms
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {platforms.map(p => (
              <div key={p.id} style={{
                background: THEME.white04, borderRadius: 12, padding: '12px',
                display: 'flex', alignItems: 'center', gap: 8,
                border: `1px solid ${THEME.white06}`,
              }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <div>
                  <p style={{ color: THEME.white, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                    {p.name}
                  </p>
                  {p.aliases.length > 0 && (
                    <p style={{ color: THEME.white20, fontSize: 9, margin: '1px 0 0', fontFamily: THEME.font }}>
                      {p.aliases[0]}
                    </p>
                  )}
                </div>
                <span style={{ color: THEME.accent, fontSize: 10, fontWeight: 700, marginLeft: 'auto' }}>✓</span>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,182,72,0.06)', borderRadius: 10, padding: '10px 12px', marginTop: 12,
            border: '1px solid rgba(255,182,72,0.1)',
          }}>
            <p style={{ color: THEME.white40, fontSize: 11, margin: 0, fontFamily: THEME.font }}>
               Copy the payment confirmation from any of these apps and paste it in the "Paste Message" tab.
              For InstaPay on iPhone, use the Share button → Wafr to instantly log the payment.
            </p>
          </div>
        </div>
      )}

      {/* ── RESULT FEEDBACK ── */}
      {result && (
        <div style={{
          background: result.success ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)',
          borderRadius: 16, padding: '16px', marginBottom: 12,
          border: `1px solid ${result.success ? 'rgba(0,212,170,0.2)' : 'rgba(255,107,107,0.2)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result.platform && <span style={{ fontSize: 22 }}>{result.platform.icon}</span>}
            <div style={{ flex: 1 }}>
              <p style={{
                color: result.success ? THEME.accent : THEME.red,
                fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font,
              }}>
                {result.success ? ' Payment Detected!' : result.msg}
              </p>
              {result.success && (
                <>
                  <p style={{ color: THEME.white50, fontSize: 13, fontWeight: 600, margin: '2px 0 0', fontFamily: THEME.font }}>
                    {result.msg}
                  </p>
                  {result.merchant && (
                    <p style={{ color: THEME.white30, fontSize: 11, margin: '2px 0 0', fontFamily: THEME.font }}>
                       {result.merchant}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          {result.success && (
            <p style={{ color: THEME.white30, fontSize: 10, margin: '8px 0 0', fontFamily: THEME.font, textAlign: 'center' }}>
              Added to your Transaction Inbox for review 
            </p>
          )}
        </div>
      )}

      {/* ── DEMO SHARES ── */}
      {showDemo && (
        <div style={{
          background: THEME.cardBg, borderRadius: 18, padding: '16px',
          border: `1px solid ${THEME.cardBorder}`, marginBottom: 12,
        }}>
          <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 700, margin: '0 0 10px', fontFamily: THEME.font }}>
             Try These Demo Messages
          </p>
          {DEMO_SHARES.map((demo, i) => (
            <button key={i} onClick={() => runDemo(demo)} style={{
              width: '100%', background: THEME.white04, border: `1px solid ${THEME.white06}`,
              borderRadius: 10, padding: '10px 12px', cursor: 'pointer', marginBottom: 6,
              textAlign: 'left',
            }}>
              <p style={{ color: THEME.white50, fontSize: 12, fontWeight: 600, margin: 0, fontFamily: THEME.font }}>
                {demo.type.toUpperCase()} {demo.source === 'screenshot' ? '' : ''}
              </p>
              <p style={{ color: THEME.white30, fontSize: 10, margin: '2px 0 0', fontFamily: THEME.font,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {demo.text}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* How It Works */}
      <div style={{
        background: THEME.cardBg, borderRadius: 18, padding: '18px',
        border: `1px solid ${THEME.cardBorder}`,
      }}>
        <h3 style={{ color: THEME.white, fontSize: 14, fontWeight: 800, margin: '0 0 12px', fontFamily: THEME.font }}>
          How Smart Capture Works
        </h3>
        {[
          { step: '1', title: 'Make a payment', desc: 'Use InstaPay, Fawry, bank app, wallet — anything', icon: React.createElement(CreditCard, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
          { step: '2', title: 'Copy the confirmation', desc: 'Copy the SMS, screenshot the success screen, or share the WhatsApp receipt', icon: React.createElement(ClipboardList, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
          { step: '3', title: 'Paste or upload here', desc: 'Our on-device AI reads Arabic + English and detects the amount, merchant, and platform', icon: React.createElement(Bot, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
          { step: '4', title: 'One-tap approve', desc: 'Review the auto-detected expense in your Inbox and approve it', icon: React.createElement(CheckCircle2, { size: "1em", style: { display: "inline-block", verticalAlign: "middle" } }) },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{step.icon}</div>
            <div>
              <p style={{ color: THEME.white, fontSize: 12, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
                {step.title}
              </p>
              <p style={{ color: THEME.white30, fontSize: 11, margin: '1px 0 0', fontFamily: THEME.font }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* iOS Tip */}
      <div style={{
        background: 'rgba(108,92,231,0.08)', borderRadius: 14, padding: '12px 16px', marginTop: 12,
        border: '1px solid rgba(108,92,231,0.12)',
      }}>
        <p style={{ color: THEME.white50, fontSize: 11, lineHeight: 1.5, margin: 0, fontFamily: THEME.font }}><Apple size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /> <strong>iPhone Users:</strong> When you see a payment confirmation screen, tap Share → Wafr to instantly log the expense. 
          Or simply take a screenshot — next time you open Wafr, it'll auto-detect and queue the expense for approval.
        </p>
      </div>

      {/* Android Tip */}
      <div style={{
        background: 'rgba(0,212,170,0.06)', borderRadius: 14, padding: '12px 16px', marginTop: 8,
        border: '1px solid rgba(0,212,170,0.08)',
      }}>
        <p style={{ color: THEME.white40, fontSize: 11, lineHeight: 1.5, margin: 0, fontFamily: THEME.font }}><Bot size="1em" style={{display:"inline-block", verticalAlign:"middle", margin:"0 4px"}} /> <strong style={{ color: THEME.white50 }}>Android Users:</strong> Enable Notification Access in Settings → Privacy & Auto-Tracking for fully automatic detection.
          InstaPay, Fawry, bank, and wallet notifications are captured silently in the background.
        </p>
      </div>
    </div>
  );
}
