/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Pause, 
  Play, 
  Hammer, 
  Map as MapIcon, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Share2, 
  RotateCcw,
  Trophy,
  History,
  HelpCircle,
  Construction,
  LandPlot,
  Building2,
  Tent
} from 'lucide-react';
import { IMAGES, GamePhase, QUIZZES, QuizQuestion, SOUNDS } from './constants';

// --- Utils ---

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {}); // Ignore autoplay errors
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 transition-all ${
      active 
        ? 'bg-surface-container-low border-l-4 border-secondary text-primary translate-x-1' 
        : 'text-on-surface-variant hover:bg-surface-container-highest'
    }`}
  >
    <Icon size={20} className={active ? 'text-secondary' : 'text-on-surface-variant'} />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const ProgressBar = ({ value, label, color = 'bg-secondary' }: { value: number, label: string, color?: string }) => (
  <div className="w-full">
    <div className="flex justify-between items-end mb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{label}</span>
      <span className="text-xs font-bold text-secondary">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color} transition-all duration-500`} 
      />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('START');
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);

  const phaseQuizzes = QUIZZES[phase] || [];
  const currentQuiz = phaseQuizzes[currentQuestionIndex] || phaseQuizzes[0];

  useEffect(() => {
    let timer: any;
    if (phase !== 'START' && phase !== 'SUCCESS' && !isPaused && timeLeft > 0 && showQuiz && !isCinematic) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && showQuiz && !isCorrect) {
      // Time's up logic
      playSound(SOUNDS.INCORRECT);
      setFeedback('时间到！请重新尝试。');
      setTimeout(() => {
        setTimeLeft(15);
        setFeedback(null);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [phase, isPaused, timeLeft, showQuiz, isCinematic, isCorrect]);

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0');
  };

  const handleStart = () => {
    playSound(SOUNDS.CLICK);
    setPhase('FOUNDATION');
    setProgress(0);
    setTimeLeft(15);
    setCurrentQuestionIndex(0);
  };

  const handleReset = () => {
    playSound(SOUNDS.CLICK);
    setPhase('START');
    setProgress(0);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedback(null);
    setTimeLeft(15);
    setIsPaused(false);
    setIsCinematic(false);
  };

  const handleAnswer = (optionId: string) => {
    if (isCorrect !== null) return;
    
    setSelectedOption(optionId);
    const correct = optionId === currentQuiz.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playSound(SOUNDS.CORRECT);
      setFeedback('回答正确！正在推进工程...');
      setTimeout(() => {
        if (currentQuestionIndex < phaseQuizzes.length - 1) {
          // Move to next question in same phase
          setCurrentQuestionIndex(prev => prev + 1);
          setProgress(prev => prev + (phase === 'FOUNDATION' ? 22 : phase === 'STRUCTURE' ? 22 : 5));
          setTimeLeft(15); // Reset timer for next question
        } else {
          // Move to next phase
          playSound(SOUNDS.TRANSITION);
          if (phase === 'FOUNDATION') {
            setPhase('STRUCTURE');
            setProgress(45);
            setShowQuiz(false);
          } else if (phase === 'STRUCTURE') {
            setPhase('ROOFING');
            setProgress(90);
            setShowQuiz(false);
          } else if (phase === 'ROOFING') {
            setIsCinematic(true);
            setShowQuiz(false);
            setTimeout(() => {
              playSound(SOUNDS.SUCCESS);
              setPhase('SUCCESS');
              setProgress(100);
              setIsCinematic(false);
            }, 4000); // 4 seconds for cinematic
          }
          setCurrentQuestionIndex(0);
          setTimeLeft(15);
        }
        setSelectedOption(null);
        setIsCorrect(null);
        setFeedback(null);
      }, 1500);
    } else {
      playSound(SOUNDS.INCORRECT);
      setFeedback('回答错误，请再试一次。提示：' + currentQuiz.hint);
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setFeedback(null);
        setTimeLeft(15); // Reset timer on wrong answer too? Or just let it run? 
        // User said "15s per question", usually implies a reset or a penalty.
      }, 2000);
    }
  };

  if (phase === 'START') {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0">
          <img 
            src={IMAGES.START_SCREEN} 
            className="w-full h-full object-cover scale-105" 
            alt="Yellow Crane Tower"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <span className="text-primary-container text-lg tracking-[0.4em] font-bold uppercase mb-4 block">
            大国工匠 · 湖北篇
          </span>
          <h1 className="font-serif text-7xl md:text-9xl text-white font-extrabold flex flex-col gap-2 drop-shadow-2xl mb-12">
            <span className="tracking-widest">云构黄鹤</span>
            <span className="text-4xl md:text-5xl tracking-[0.8em] font-light text-primary-container mt-4 block border-t border-b border-primary-container/20 py-4">
              数建名楼
            </span>
          </h1>
          
          <button 
            onClick={handleStart}
            className="group relative bg-primary px-20 py-6 transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            <span className="text-white text-3xl font-bold tracking-[0.5em]">开始游戏</span>
            <div className="absolute -inset-2 border border-primary-container/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>

        <footer className="fixed bottom-8 left-0 w-full z-10 px-12 flex justify-between items-end text-white/60">
          <div className="flex flex-col gap-1">
            <div className="h-1 w-24 bg-secondary" />
            <p className="text-[10px] tracking-tighter">VER. 2026.04.ARCHITECT</p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-[10px] tracking-widest uppercase opacity-50">Authorized by</p>
              <p className="text-xs font-bold">Wuhan Digital Heritage Institute</p>
            </div>
            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (phase === 'SUCCESS') {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.COMPLETED_TOWER} 
            className="w-full h-full object-cover" 
            alt="Completed Tower"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/20 to-surface/90" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl uppercase tracking-tighter text-secondary font-extrabold mb-2 drop-shadow-sm">
              大功告成
            </h1>
            <p className="text-xl text-primary font-bold tracking-widest uppercase">天下江山第一楼 · 黄鹤楼</p>
          </div>

          <div className="relative w-full bg-surface-container-low border-[12px] border-[#c5a059] shadow-2xl p-8 md:p-16 overflow-hidden rounded-sm">
            <div className="absolute -left-6 top-0 bottom-0 w-6 bg-primary shadow-inner rounded-l-full" />
            <div className="absolute -right-6 top-0 bottom-0 w-6 bg-primary shadow-inner rounded-r-full" />
            
            <div className="max-w-2xl mx-auto space-y-10 text-center">
              <div className="inline-block px-4 py-1 border-y border-outline-variant/30">
                <span className="text-on-surface-variant font-medium tracking-[0.2em] uppercase text-xs">唐 · 崔颢 · 《黄鹤楼》</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-3xl md:text-4xl text-on-surface font-serif leading-relaxed tracking-widest">
                  昔人已乘黄鹤去，此地空余黄鹤楼。<br/>
                  黄鹤一去不复返，白云千载空悠悠。
                </p>
                <div className="h-px w-24 bg-outline-variant mx-auto opacity-30" />
                <p className="text-lg md:text-xl text-on-surface-variant italic font-medium leading-relaxed max-w-lg mx-auto">
                  晴川历历汉阳树，芳草萋萋鹦鹉洲。<br/>
                  日暮乡关何处是？烟波江上使人愁。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-outline-variant/20 text-left">
                <div className="space-y-3">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <History size={16} />
                    历史底蕴
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    黄鹤楼始建于三国时代吴黄武二年（223年），原为军事哨楼。历经隋、唐、宋、元、明、清各代，虽屡毁屡建，却始终是文人墨客登临揽胜的绝佳去处。
                  </p>
                </div>
                <div className="bg-surface-container-highest p-5 rounded-sm border-l-4 border-secondary">
                  <h4 className="font-bold text-secondary text-xs uppercase tracking-widest mb-2">建筑笔记</h4>
                  <p className="text-on-surface text-sm italic leading-relaxed">
                    “现存建筑以清代‘同治楼’为原型设计，高51.4米，五层檐口，金黄琉璃瓦屋面，完美融合了古典美学与现代结构工艺。”
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center items-center">
            <button 
              onClick={() => { setPhase('FOUNDATION'); setProgress(0); setCurrentQuestionIndex(0); setTimeLeft(300); }}
              className="flex items-center gap-3 bg-primary text-white px-10 py-5 font-extrabold uppercase tracking-widest text-base transition-all hover:bg-primary-container active:scale-95 shadow-xl"
            >
              <RotateCcw size={18} />
              重玩关卡
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold text-secondary font-serif tracking-tight uppercase">御用建筑师</span>
          <div className="hidden md:flex gap-6">
            {['基础工程', '主体结构', '屋面营建'].map((item, i) => (
              <button 
                key={item}
                className={`text-sm font-bold uppercase tracking-tight px-2 py-1 transition-all ${
                  (i === 0 && phase === 'FOUNDATION') || (i === 1 && phase === 'STRUCTURE') || (i === 2 && phase === 'ROOFING')
                    ? 'text-primary border-b-2 border-secondary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-primary hover:bg-surface-container-highest transition-colors rounded-lg"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 text-primary hover:bg-surface-container-highest transition-colors rounded-lg"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface w-full max-w-md p-8 rounded-sm shadow-2xl border-4 border-primary"
            >
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <Settings size={24} />
                系统设置
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">背景音效</span>
                  <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">高画质模式</span>
                  <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="pt-6 border-t border-outline-variant/20">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-primary text-white py-3 font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
                  >
                    返回游戏
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <div className="text-center">
              <h2 className="text-6xl font-serif text-white mb-8 tracking-widest">游戏暂停</h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="bg-white text-primary px-12 py-4 font-bold text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
              >
                <Play size={24} />
                继续营建
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 pt-20 flex flex-col bg-surface-container/50 border-r border-outline-variant/10 shadow-xl z-40">
        <div className="px-6 py-6 border-b border-outline-variant/10">
          <h2 className="text-lg font-bold text-primary mb-1">黄鹤楼</h2>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">长江流域 · 历代营建</p>
        </div>
        <nav className="flex-1 py-4">
          <SidebarItem 
            icon={LandPlot} 
            label="基址稳固" 
            active={phase === 'FOUNDATION'} 
            onClick={() => {
              if (phase === 'STRUCTURE' || phase === 'ROOFING') setPhase('FOUNDATION');
            }}
          />
          <SidebarItem 
            icon={Building2} 
            label="木作构架" 
            active={phase === 'STRUCTURE'} 
            onClick={() => {
              if (phase === 'ROOFING') setPhase('STRUCTURE');
            }}
          />
          <SidebarItem 
            icon={Tent} 
            label="翚飞敛翼" 
            active={phase === 'ROOFING'} 
          />
          <SidebarItem icon={MapIcon} label="营造法式" />
        </nav>
      </aside>

      {/* Main View */}
      <main className="flex-1 pt-20 relative overflow-hidden">
        {/* Background */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={phase === 'ROOFING' ? IMAGES.SUNSET_ROOF : IMAGES.CONSTRUCTION_SITE} 
              className="w-full h-full object-cover" 
              alt="Scene"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/40" />
          </motion.div>
        </AnimatePresence>

        {/* HUD */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-full max-w-4xl px-8">
          <div className="flex-1 glass-paper p-4 rounded-lg border border-outline-variant/15 shadow-lg">
            <ProgressBar value={progress} label={`${phase} 进度`} />
          </div>
          <div className="glass-paper p-4 flex items-center gap-6 rounded-lg border border-outline-variant/15 shadow-lg">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant leading-none">答题限时</span>
              <span className={`text-2xl font-bold tabular-nums ${timeLeft < 5 ? 'text-secondary animate-pulse' : 'text-primary'}`}>
                {formatTime(timeLeft)}s
              </span>
            </div>
            <button className="bg-secondary text-white px-4 py-2 flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform">
              <MapIcon size={16} />
              法式图集
            </button>
          </div>
        </div>

        {/* Interactive Area */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[600px] h-[400px]">
            <span className="chinese-accent top-[-40px] left-[-20px]">
              {phase === 'FOUNDATION' ? '基' : phase === 'STRUCTURE' ? '梁' : '顶'}
            </span>
            <motion.div 
              key={phase + progress}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full h-full border-4 border-dashed border-primary/30 bg-primary/5 backdrop-blur-[2px] rounded-sm transform rotateX-45 perspective-1000 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Construction size={64} className="text-primary/40 mx-auto mb-2" />
                </motion.div>
                <p className="font-bold text-primary/60 uppercase tracking-widest text-lg">
                  {phase === 'FOUNDATION' ? '待建基座' : phase === 'STRUCTURE' ? '主体构架' : '屋顶封顶'}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: progress > (i * 20) ? 1 : 0 }}
                      className="w-3 h-3 bg-secondary rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar / Quiz Trigger */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
          {!showQuiz ? (
            <motion.div 
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="glass-paper p-6 rounded-xl border border-outline-variant/20 shadow-2xl text-center"
            >
              <h3 className="text-lg font-bold text-primary mb-2">营建知识考验</h3>
              <p className="text-sm text-on-surface-variant mb-4">通过知识考验以获取施工许可</p>
              <button 
                onClick={() => setShowQuiz(true)}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
              >
                <HelpCircle size={20} />
                开始答题
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface w-full border-[12px] border-surface-container-highest shadow-2xl flex flex-col relative"
            >
              <div className="p-8 border-b border-outline-variant/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded">必修</span>
                  <h2 className="text-2xl font-bold text-primary tracking-tight uppercase">营造考学：{phase}</h2>
                </div>
                <p className="text-on-surface-variant text-sm">回答正确即可解锁施工图纸</p>
              </div>
              <div className="p-8">
                <div className="bg-surface-container-low p-6 border-l-4 border-primary mb-8 relative">
                  <p className="text-lg font-medium text-on-surface leading-relaxed">
                    {currentQuiz.question}
                  </p>
                  <AnimatePresence>
                    {feedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -bottom-6 left-0 right-0 text-center font-bold text-sm ${isCorrect ? 'text-green-600' : 'text-secondary'}`}
                      >
                        {feedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {currentQuiz.options.map((option) => (
                    <button 
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      disabled={isCorrect !== null}
                      className={`w-full text-left p-4 border transition-all rounded flex items-center gap-4 group ${
                        selectedOption === option.id
                          ? isCorrect 
                            ? 'bg-green-100 border-green-500' 
                            : 'bg-red-100 border-red-500'
                          : 'border-outline-variant/30 hover:bg-primary-container hover:border-primary'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${
                        selectedOption === option.id
                          ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          : 'border-outline group-hover:bg-primary group-hover:text-white'
                      }`}>
                        {option.id}
                      </span>
                      <span className="font-semibold text-on-surface">{option.text}</span>
                      {selectedOption === option.id && isCorrect && <CheckCircle2 className="ml-auto text-green-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20 flex justify-end">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">—— 御用营造司 监制 ——</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Advice Notification */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-surface-container-high/90 p-4 border-r-4 border-primary shadow-xl max-w-xs"
          >
            <div className="flex items-center gap-3 mb-2">
              <Info size={16} className="text-secondary" />
              <h4 className="font-bold text-xs uppercase tracking-widest text-primary">营造司叮嘱</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed italic">
              “{currentQuiz.hint}”
            </p>
          </motion.div>
        </div>

        {/* Cinematic Tower Appearance */}
        <AnimatePresence>
          {isCinematic && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.5, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img 
                  src={IMAGES.COMPLETED_TOWER} 
                  className="max-h-[80vh] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]" 
                  alt="Tower Appearing"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-t from-primary-container/20 to-transparent pointer-events-none"
                />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-4xl font-serif text-primary mt-8 tracking-[1em] font-bold"
              >
                名楼重现
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={handleReset}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-white flex items-center justify-center rounded shadow-2xl group transition-transform active:scale-95"
      >
        <RefreshCw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
        <div className="absolute right-20 bg-primary text-white px-4 py-2 font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          重置进度
        </div>
      </button>
    </div>
  );
}
