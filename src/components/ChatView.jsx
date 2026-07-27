import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, CheckCheck, Bot, User, Volume2, Flame, Heart, Info } from 'lucide-react';
import { parseTransactionMessage } from '../utils/nlpParser';

export default function ChatView({
  chatMessages,
  setChatMessages,
  activeUser,
  setActiveUser,
  profile,
  onAddTransaction,
  gamification
}) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isRecording]);

  // Simulação de Gravação de Voz
  const startRecording = () => {
    setIsRecording(true);
    setRecordTimer(0);
    timerRef.current = setInterval(() => {
      setRecordTimer(prev => prev + 1);
    }, 1000);
  };

  const stopAndSendRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    // Mensagens de áudio de exemplo simuladas
    const sampleAudioPhrases = [
      'Mercado 165,90',
      'Conta de luz 320 fixo',
      'Gasolina no posto 150',
      'Almoço no restaurante 65',
      'Aporte reserva de emergência 300'
    ];
    const phrase = sampleAudioPhrases[Math.floor(Math.random() * sampleAudioPhrases.length)];

    handleSendMessage(`🎙️ [Áudio de ${recordTimer}s]: ${phrase}`);
  };

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend || !textToSend.trim()) return;

    const userMsgText = textToSend.trim();
    const isAudio = userMsgText.startsWith('🎙️');
    const cleanTextForParsing = isAudio ? userMsgText.split(']: ')[1] || userMsgText : userMsgText;

    const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Mensagem do Usuário
    const userMessage = {
      id: Date.now().toString(),
      sender: activeUser,
      type: isAudio ? 'audio' : 'text',
      content: userMsgText,
      timestamp: newTime
    };

    // 2. Tentar processar via NLP
    const result = parseTransactionMessage(cleanTextForParsing, activeUser);

    let botMessage = null;

    if (result.success) {
      // Notificar o pai para adicionar transação e somar XP
      onAddTransaction(result.data, result.data.xpEarned);

      botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Bot',
        type: 'bot',
        content: result.botReply,
        timestamp: newTime
      };
    } else {
      botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'Bot',
        type: 'bot',
        content: `🤔 ${result.error}`,
        timestamp: newTime
      };
    }

    setChatMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickChip = (phrase) => {
    handleSendMessage(phrase);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[550px] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      
      {/* WhatsApp Header */}
      <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-500/20">
              💬
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Grupo Finanças Casal
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Bot Ativo 🤖
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {profile.partner1} {profile.avatar1} & {profile.partner2} {profile.avatar2} • Fricção Zero
            </p>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sequência</div>
            <div className="text-xs font-black text-amber-300">{gamification.streakDays} Dias Seguidos</div>
          </div>
        </div>
      </div>

      {/* Info Banner para primeira experiência */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Basta mandar mensagens curtas como <strong>"Mercado 150"</strong> ou usar o botão de <strong>Voz 🎙️</strong>!</span>
        </div>
        <div className="hidden md:flex items-center gap-1 font-medium text-[11px] text-emerald-400">
          <span>+15 a +30 XP por gasto lançado</span>
        </div>
      </div>

      {/* WhatsApp Message Area */}
      <div className="flex-1 whatsapp-chat-bg p-4 md:p-6 overflow-y-auto space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender !== 'Bot';
          const isPartner1 = msg.sender === profile.partner1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3.5 shadow-md relative ${
                  !isUser
                    ? 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none'
                    : isPartner1
                    ? 'bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-tr-none shadow-blue-900/30'
                    : 'bg-gradient-to-br from-purple-700 to-purple-800 text-white rounded-tr-none shadow-purple-900/30'
                }`}
              >
                {/* Sender Name Badge */}
                {isUser && (
                  <div className="text-[10px] font-extrabold uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1">
                    <span>{isPartner1 ? profile.avatar1 : profile.avatar2}</span>
                    <span>{msg.sender}</span>
                  </div>
                )}

                {!isUser && (
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Assistente FinCasal AI</span>
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Message Timestamp */}
                <div
                  className={`text-[10px] text-right mt-1.5 font-medium flex items-center justify-end gap-1 ${
                    isUser ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-emerald-400 inline" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Audio Recording Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center my-4">
            <div className="bg-red-950/80 border border-red-500/40 text-red-300 px-4 py-2.5 rounded-2xl flex items-center gap-3 recording-active shadow-lg">
              <Mic className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-bold text-sm">Gravando Áudio... {recordTimer}s</span>
              <span className="text-xs opacity-75">(Solte para enviar o áudio simulado)</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Atalhos:
        </span>
        <button
          onClick={() => handleQuickChip('Mercado 150')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full border border-slate-700 shrink-0 transition-all font-semibold flex items-center gap-1"
        >
          🛒 Mercado 150
        </button>
        <button
          onClick={() => handleQuickChip('Conta de Luz 320 fixo')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full border border-slate-700 shrink-0 transition-all font-semibold flex items-center gap-1"
        >
          💡 Luz 320 (Fixo)
        </button>
        <button
          onClick={() => handleQuickChip('Gasolina 100')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full border border-slate-700 shrink-0 transition-all font-semibold flex items-center gap-1"
        >
          🚗 Gasolina 100
        </button>
        <button
          onClick={() => handleQuickChip('Jantar pizza 90')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full border border-slate-700 shrink-0 transition-all font-semibold flex items-center gap-1"
        >
          🍕 Pizza 90 (Desejo)
        </button>
        <button
          onClick={() => handleQuickChip('Aporte reserva 400')}
          className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 text-xs px-3 py-1 rounded-full shrink-0 transition-all font-semibold flex items-center gap-1"
        >
          🛡️ Aporte Reserva 400
        </button>
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex flex-col gap-2">
        {/* User Switcher Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold">Quem está enviando a mensagem?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveUser(profile.partner1)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                activeUser === profile.partner1
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{profile.avatar1}</span> {profile.partner1}
            </button>
            <button
              onClick={() => setActiveUser(profile.partner2)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                activeUser === profile.partner2
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{profile.avatar2}</span> {profile.partner2}
            </button>
          </div>
        </div>

        {/* Text Area and Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Escreva aqui (ex: "Mercado 120" ou "Aluguel 1800")...`}
              className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-500 text-sm rounded-2xl px-4 py-3 border border-slate-700/80 focus:outline-none focus:border-emerald-500 transition-all pr-10"
            />
          </div>

          {/* Record Audio Button */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopAndSendRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopAndSendRecording}
            title="Mantenha pressionado para gravar áudio"
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Text Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 transition-all shadow-lg shadow-emerald-600/30 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}
