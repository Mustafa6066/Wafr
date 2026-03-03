import { Bot, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useApp } from "./WafrApp.jsx";
import { SAVING_TIPS, CATEGORIES, FREE_LIMITS, THEME } from "./constants.js";

// GPT integration — tries OpenAI, falls back to rule-based
async function callGPT(userMsg, context) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null; // Fallback to rule-based

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Wafr's AI financial coach for MENA users. You give personalized, actionable advice.

User context:
- Name: ${context.name || "User"}
- Country: ${context.country || "Egypt"}
- Monthly income: ${context.curr.symbol} ${context.budget.toLocaleString()}
- Total spent this month: ${context.curr.symbol} ${context.totalSpent.toLocaleString()}
- Remaining budget: ${context.curr.symbol} ${(context.budget - context.totalSpent).toLocaleString()}
- Top spending categories: ${context.topCats.map(([id, amt]) => `${id}: ${context.curr.symbol}${amt.toLocaleString()}`).join(", ") || "None yet"}
- Savings goals: ${context.goals.map(g => `${g.name} (${Math.round((g.saved / g.target) * 100)}%)`).join(", ") || "None"}
- Savings rate: ${context.savingsRate}%

Rules:
- Use emoji for visual appeal
- Be concise but thorough
- Give specific actionable advice based on their data
- Reference MENA-specific tips (local markets, apps like Fawry/InstaPay)
- Encourage good habits, don't shame
- Keep responses under 300 words
- Use markdown bold for key points`,
          },
          { role: "user", content: userMsg },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null; // Fallback to rule-based
  }
}

export default function AICoach() {
  const { curr, isPremium, expenses, currentMonthExpenses, totalSpent, budget, profile, goals,
    aiChatHistory, setAiChatHistory, canSendAiMessage, incrementAiCount, aiMessageCount,
    showPaywall } = useApp();

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatHistory, typing]);

  const remainingMessages = isPremium ? "∞" : Math.max(0, FREE_LIMITS.maxAiMessages - (aiMessageCount.date === new Date().toDateString() ? aiMessageCount.count : 0));

  const generateResponse = (userMsg) => {
    const msg = userMsg.toLowerCase();
    const catTotals = {};
    currentMonthExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const savingsRate = budget > 0 ? Math.round(((budget - totalSpent) / budget) * 100) : 0;
    const topCatName = topCat[0] ? (CATEGORIES.find(c => c.id === topCat[0][0])?.name || topCat[0][0]) : "N/A";

    // Context-aware responses
    if (msg.includes("analyz") || msg.includes("spending") || msg.includes("habit")) {
      const breakdown = topCat.slice(0, 4).map(([id, amt]) => {
        const cat = CATEGORIES.find(c => c.id === id);
        return `  ${cat?.name || id}: ${curr.symbol} ${amt.toLocaleString()} (${Math.round((amt / totalSpent) * 100)}%)`;
      }).join("\n");

      return ` **Spending Analysis for ${new Date().toLocaleDateString("en", { month: "long" })}**\n\nYou've spent ${curr.symbol} ${totalSpent.toLocaleString()} out of your ${curr.symbol} ${budget.toLocaleString()} budget (${Math.round((totalSpent / budget) * 100)}% used).\n\n**Top Categories:**\n${breakdown || "  No expenses tracked yet"}\n\n${savingsRate > 20 ? " Great job! You're on track to save " + savingsRate + "% this month." : savingsRate > 0 ? " You're saving " + savingsRate + "% — try to reach 20% for healthy finances." : " You've exceeded your budget! Let's find areas to cut back."}\n\n **Tip:** ${getRelevantTip(topCat[0]?.[0])}\n\nWant me to help you set a budget for specific categories?`;
    }

    if (msg.includes("save") && (msg.includes("food") || msg.includes("eat") || msg.includes("dining"))) {
      const foodSpent = catTotals["food"] || 0;
      return ` **Food & Dining Savings Plan**\n\nYou've spent ${curr.symbol} ${foodSpent.toLocaleString()} on food this month.\n\n**Here's your personalized plan:**\n\n1.  **Cook at home 3 more days/week**\n   Potential savings: ${curr.symbol} ${Math.round(foodSpent * 0.3).toLocaleString()}/month\n\n2.  **Pack lunch twice a week**\n   Potential savings: ${curr.symbol} ${Math.round(foodSpent * 0.15).toLocaleString()}/month\n\n3.  **Use delivery app promo codes**\n   Always check for discounts before ordering\n\n4.  **Meal prep on weekends**\n   Saves both money and time during the week\n\n**Total potential savings: ${curr.symbol} ${Math.round(foodSpent * 0.45).toLocaleString()}/month!**`;
    }

    if (msg.includes("save") && (msg.includes("transport") || msg.includes("car") || msg.includes("uber") || msg.includes("taxi"))) {
      const transportSpent = catTotals["transport"] || 0;
      return ` **Transport Savings Plan**\n\nYou've spent ${curr.symbol} ${transportSpent.toLocaleString()} on transport this month.\n\n**Smart alternatives:**\n\n1.  **Walk for trips under 2km**\n   Saves money AND improves health\n\n2.  **Use public transport 2 more days/week**\n   Potential savings: ${curr.symbol} ${Math.round(transportSpent * 0.25).toLocaleString()}/month\n\n3.  **Carpool with colleagues**\n   Split fuel costs for daily commute\n\n4.  **Batch your errands**\n   Group trips by location to reduce rides\n\n**Potential savings: ${curr.symbol} ${Math.round(transportSpent * 0.35).toLocaleString()}/month!**`;
    }

    if (msg.includes("goal") || msg.includes("target") || msg.includes("dream")) {
      const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
      return ` **Your Savings Goals Overview**\n\n${goals.length > 0
        ? goals.map(g => `**${g.name}**: ${curr.symbol} ${g.saved.toLocaleString()} / ${curr.symbol} ${g.target.toLocaleString()} (${Math.round((g.saved / g.target) * 100)}%)`).join("\n")
        : "You haven't set any savings goals yet!"}\n\n**Total saved: ${curr.symbol} ${totalSaved.toLocaleString()}**\n\n Based on your income of ${curr.symbol} ${budget.toLocaleString()}, I recommend saving at least ${curr.symbol} ${Math.round(budget * 0.2).toLocaleString()}/month (20% rule).\n\nWant me to help you create a new savings goal? Go to the Goals tab!`;
    }

    if (msg.includes("budget") || msg.includes("plan") || msg.includes("allocat")) {
      return ` **Recommended Budget (50/30/20 Rule)**\n\nBased on your income of ${curr.symbol} ${budget.toLocaleString()}:\n\n **Needs (50%):** ${curr.symbol} ${Math.round(budget * 0.5).toLocaleString()}\n  → Rent, bills, groceries, transport\n\n **Wants (30%):** ${curr.symbol} ${Math.round(budget * 0.3).toLocaleString()}\n  → Dining out, entertainment, shopping\n\n **Savings (20%):** ${curr.symbol} ${Math.round(budget * 0.2).toLocaleString()}\n  → Emergency fund, investments, goals\n\n${totalSpent > budget * 0.8 ? " You've already used " + Math.round((totalSpent / budget) * 100) + "% of your budget. Time to slow down!" : " You're doing well so far this month!"}\n\nGo to the Budget tab to set spending limits per category!`;
    }

    if (msg.includes("tip") || msg.includes("advice") || msg.includes("help") || msg.includes("suggest")) {
      const tips = getRelevantTips(topCat, 3);
      const totalPotential = tips.reduce((s, t) => s + t.saving, 0);
      return ` **Personalized Savings Tips**\n\nBased on your spending patterns:\n\n${tips.map((t, i) => `${i + 1}. ${t.tip}\n    Save up to ${curr.symbol} ${t.saving}/month`).join("\n\n")}\n\n**Total potential savings: ${curr.symbol} ${totalPotential}/month (${curr.symbol} ${totalPotential * 12}/year!)**\n\nWant me to dive deeper into any of these?`;
    }

    // Default response with contextual awareness
    const tip = SAVING_TIPS[Math.floor(Math.random() * SAVING_TIPS.length)];
    return `Based on your spending pattern, here's a tip:\n\n ${tip.tip}\n\n Potential savings: ${curr.symbol} ${tip.saving}/month\n\nYour top spending category is **${topCatName}** at ${curr.symbol} ${(topCat[0]?.[1] || 0).toLocaleString()} this month.\n\nTry asking me:\n• "Analyze my spending"\n• "How can I save on food?"\n• "Help me set a budget"\n• "Show my savings goals"`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!canSendAiMessage()) {
      showPaywall();
      return;
    }

    const userMsg = input.trim();
    setAiChatHistory(prev => [...prev, { role: "user", text: userMsg, time: Date.now() }]);
    setInput("");
    incrementAiCount();
    setTyping(true);

    // Build context for GPT
    const catTotals = {};
    currentMonthExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const savingsRate = budget > 0 ? Math.round(((budget - totalSpent) / budget) * 100) : 0;

    // Try GPT first (Pro users only), fallback to rule-based
    let response = null;
    if (isPremium) {
      response = await callGPT(userMsg, {
        name: profile.name, country: profile.country, curr, budget, totalSpent,
        topCats: topCat, goals, savingsRate,
      });
    }

    if (!response) {
      // Rule-based fallback
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
      response = generateResponse(userMsg);
    }

    setAiChatHistory(prev => [...prev, { role: "ai", text: response, time: Date.now() }]);
    setTyping(false);
  };

  return (
    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", height: "calc(100vh - 150px)" }}>
      {/* Header — Premium */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,184,148,0.04))",
        borderRadius: 18, padding: "16px 18px",
        border: "1px solid rgba(0,212,170,0.1)", marginBottom: 14,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,212,170,0.2)",
          }}>
            <Sparkles size={18} color={THEME.bg} />
          </div>
          <div>
            <p style={{ color: THEME.white, fontSize: 14, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              AI Savings Coach
            </p>
            <p style={{ color: THEME.white40, fontSize: 11, margin: "1px 0 0", fontFamily: THEME.font }}>
              Powered by your spending data
            </p>
          </div>
        </div>
        {!isPremium && (
          <div style={{
            background: "rgba(255,182,72,0.1)", borderRadius: 10, padding: "5px 12px",
            border: "1px solid rgba(255,182,72,0.15)",
          }}>
            <p style={{ color: THEME.orange, fontSize: 11, fontWeight: 700, margin: 0, fontFamily: THEME.font }}>
              {remainingMessages}/day
            </p>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, paddingRight: 4 }}>
        {aiChatHistory.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 16px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 18px",
              background: "linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,184,148,0.06))",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(0,212,170,0.1)",
            }}>
              <Bot size={28} color={THEME.accent} />
            </div>
            <p style={{ color: THEME.white50, fontSize: 15, margin: "0 0 20px", fontFamily: THEME.font }}>
              Hi{profile.name ? ` ${profile.name}` : ""}! Ask me anything about your finances.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Analyze my spending habits",
                "How can I save more on food?",
                "Help me set a budget plan",
                "Show my savings goals progress",
              ].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: "12px 16px",
                  color: THEME.white50, fontSize: 13, cursor: "pointer", fontFamily: THEME.font,
                  transition: "all 0.2s ease",
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {aiChatHistory.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12, animation: "fadeIn 0.3s ease",
          }}>
            {msg.role === "ai" && (
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0, marginRight: 8, marginTop: 2,
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={14} color={THEME.bg} />
              </div>
            )}
            <div style={{
              maxWidth: "80%",
              background: msg.role === "user"
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,184,148,0.06))",
              border: msg.role === "user"
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,212,170,0.12)",
              color: THEME.white,
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: THEME.font,
            }}>
              {msg.text}
              <p style={{ color: THEME.white20, fontSize: 9, margin: "6px 0 0", fontFamily: THEME.font }}>
                {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={14} color={THEME.bg} />
            </div>
            <div style={{
              background: "linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,184,148,0.06))",
              border: "1px solid rgba(0,212,170,0.12)",
              borderRadius: "18px 18px 18px 4px", padding: "12px 18px",
              color: THEME.white50, fontSize: 13, fontFamily: THEME.font,
            }}>
              <span style={{ animation: "pulse 1s infinite" }}>Analyzing your data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input — Premium */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={canSendAiMessage() ? "Ask your AI savings coach..." : "Upgrade for more messages"}
          disabled={!canSendAiMessage() && !isPremium}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "14px 18px", color: THEME.white, fontSize: 14,
            outline: "none", fontFamily: THEME.font,
          }} />
        <button onClick={sendMessage} disabled={!input.trim()} style={{
          background: input.trim() ? `linear-gradient(135deg, ${THEME.accent}, ${THEME.accentDark})` : "rgba(255,255,255,0.06)",
          border: "none", borderRadius: 14, width: 50, height: 50,
          cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: input.trim() ? "0 4px 16px rgba(0,212,170,0.25)" : "none",
          transition: "all 0.2s ease",
        }}>
          <Send size={18} color={input.trim() ? THEME.bg : "rgba(255,255,255,0.3)"} />
        </button>
      </div>
    </div>
  );
}

// Helpers
function getRelevantTip(categoryId) {
  const relevant = SAVING_TIPS.filter(t => t.category === categoryId);
  if (relevant.length > 0) return relevant[Math.floor(Math.random() * relevant.length)].tip;
  return SAVING_TIPS[Math.floor(Math.random() * SAVING_TIPS.length)].tip;
}

function getRelevantTips(topCategories, count = 3) {
  const catIds = topCategories.map(([id]) => id);
  const relevant = SAVING_TIPS.filter(t => catIds.includes(t.category));
  const others = SAVING_TIPS.filter(t => !catIds.includes(t.category));
  const pool = [...relevant, ...others];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
