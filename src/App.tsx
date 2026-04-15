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
  RotateCcw,
  Trophy,
  History,
  HelpCircle,
  Construction,
  LandPlot,
  Building2,
  Tent,
  Package,
  Beaker,
  BookOpen,
  X,
  Plus,
  Lock,
  CalendarCheck,
  Bird,
  Sparkles,
  Book,
  Store,
  ShoppingBag
} from 'lucide-react';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  DragStartEvent, 
  DragEndEvent,
  useDroppable,
  useDraggable,
  DragOverlay
} from '@dnd-kit/core';
import { 
  IMAGES, 
  GamePhase, 
  QUIZZES, 
  QuizQuestion, 
  SOUNDS, 
  MATERIALS, 
  RECIPES, 
  FINAL_RECIPE, 
  CATEGORY_DROPS, 
  FLOOR_INFO,
  Material,
  QuizCategory
} from './constants';

// --- Utils ---

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {}); // Ignore autoplay errors
};

// --- Components ---

interface MaterialCardProps {
  key?: string | number;
  material: Material;
  count: number;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const MaterialCard = ({ 
  material, 
  count, 
  selected = false, 
  onClick, 
  disabled = false 
}: MaterialCardProps) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
      selected 
        ? 'border-secondary bg-secondary/10 shadow-lg' 
        : 'border-outline-variant/20 bg-surface-container hover:border-primary/50'
    } ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
  >
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 p-1">
      <img src={material.image} className="w-full h-full object-cover" alt={material.name} referrerPolicy="no-referrer" />
    </div>
    <span className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">{material.name}</span>
    {count > 0 && (
      <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
        {count}
      </div>
    )}
  </motion.button>
);

interface GridSlotProps {
  index: number;
  materialId: string | null;
}

const GridSlot: React.FC<GridSlotProps> = ({ index, materialId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: index,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all relative ${
        isOver ? 'border-primary bg-primary/10 scale-105 z-10' : 'border-outline-variant/10 bg-surface-container-low'
      }`}
    >
      {materialId ? (
        <DraggableMaterial id={index} materialId={materialId} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-[8px] font-bold">{index + 1}</span>
        </div>
      )}
    </div>
  );
};

const DraggableMaterial = ({ id, materialId }: { id: number, materialId: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });
  const material = MATERIALS[materialId];

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`w-full h-full p-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing z-20 ${isDragging ? 'opacity-0' : ''}`}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-sm bg-white/5 p-1">
        <img src={material.image} className="w-full h-full object-cover" alt={material.name} referrerPolicy="no-referrer" />
      </div>
      <span className="text-[8px] font-bold text-on-surface truncate w-full text-center mt-1 leading-none">{material.name}</span>
    </div>
  );
};

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
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [collectedRare, setCollectedRare] = useState<string[]>([]);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState<Material | null>(null);
  const [showHandbook, setShowHandbook] = useState(false);
  
  const [discoveredMaterials, setDiscoveredMaterials] = useState<string[]>([]);
  const [handbookTab, setHandbookTab] = useState<'GALLERY' | 'RECIPES'>('GALLERY');
  
  const [showMerchant, setShowMerchant] = useState(false);
  const [merchantSelectedIndices, setMerchantSelectedIndices] = useState<number[]>([]);
  
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const [constructionLevel, setConstructionLevel] = useState(1);
  const [totalSyntheses, setTotalSyntheses] = useState(0);
  const [decorations, setDecorations] = useState<Record<string, number>>({});
  const [showGuide, setShowGuide] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    let timer: any;
    if (showQuiz && !isPaused && timeLeft > 0 && isCorrect === null) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && showQuiz && isCorrect === null) {
      playSound(SOUNDS.INCORRECT);
      setFeedback('时间到！请重新尝试。');
      setTimeout(() => {
        setTimeLeft(15);
        setFeedback(null);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [showQuiz, isPaused, timeLeft, isCorrect]);

  const handleStart = () => {
    playSound(SOUNDS.CLICK);
    setPhase('PLAYING');
    setGrid(Array(9).fill(null));
    setCollectedRare([]);
    setConstructionLevel(1);
    setTotalSyntheses(0);
    setDecorations({});
  };

  const handleReset = () => {
    playSound(SOUNDS.CLICK);
    setPhase('START');
    setShowQuiz(false);
    setIsPaused(false);
    setIsCinematic(false);
    setGrid(Array(9).fill(null));
    setCollectedRare([]);
    setDiscoveredMaterials([]);
  };

  const markAsDiscovered = (materialId: string) => {
    setDiscoveredMaterials(prev => {
      if (prev.includes(materialId)) return prev;
      return [...prev, materialId];
    });
  };

  const addToGrid = (materialId: string) => {
    setGrid(prev => {
      const next = [...prev];
      const emptyIndex = next.indexOf(null);
      if (emptyIndex !== -1) {
        next[emptyIndex] = materialId;
        markAsDiscovered(materialId);
        
        const filledCount = next.filter(m => m !== null).length;
        if (filledCount >= 7) {
          setFeedback(`成功获取：${MATERIALS[materialId].name}！格子快满了，快去合成新材料吧！`);
        } else {
          setFeedback(`成功获取：${MATERIALS[materialId].name}！`);
        }
        
        setTimeout(() => setFeedback(null), 2500);
        return next;
      } else {
        setFeedback('格子已满！请先前往工坊进行合成。');
        setTimeout(() => setFeedback(null), 2500);
        return prev;
      }
    });
  };

  const triggerQuiz = (category?: QuizCategory) => {
    const filteredQuizzes = category 
      ? QUIZZES.filter(q => q.category === category)
      : QUIZZES;
    const randomQuiz = filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
    setCurrentQuiz(randomQuiz);
    setShowQuiz(true);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedback(null);
  };

  const handleAnswer = (optionId: string) => {
    if (isCorrect !== null || !currentQuiz) return;
    
    setSelectedOption(optionId);
    const correct = optionId === currentQuiz.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      playSound(SOUNDS.CORRECT);
      const drops = CATEGORY_DROPS[currentQuiz.category];
      const randomDrop1 = drops[Math.floor(Math.random() * drops.length)];
      const randomDrop2 = drops[Math.floor(Math.random() * drops.length)];
      
      setFeedback(`回答正确！获得基础材料：${MATERIALS[randomDrop1].name} 和 ${MATERIALS[randomDrop2].name}`);
      
      setTimeout(() => {
        addToGrid(randomDrop1);
        addToGrid(randomDrop2);
        // Don't close quiz automatically, allow continuous answering
        triggerQuiz(currentQuiz.category);
      }, 1500);
    } else {
      playSound(SOUNDS.INCORRECT);
      setFeedback('回答错误，请再试一次。');
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setFeedback(null);
        setTimeLeft(15);
      }, 2000);
    }
  };

  const handleDailyCheckIn = () => {
    playSound(SOUNDS.SUCCESS);
    addToGrid('stone');
    addToGrid('wood');
    addToGrid('clay');
    addToGrid('pigment');
    setFeedback('签到成功！获得全套基础材料');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMerchantExchange = () => {
    if (merchantSelectedIndices.length !== 2) return;
    
    const idx1 = merchantSelectedIndices[0];
    const idx2 = merchantSelectedIndices[1];
    const mat1 = grid[idx1];
    const mat2 = grid[idx2];
    
    if (!mat1 || !mat2) return;
    
    // Blind Box Logic: Randomly pick a material from BASE, INTERMEDIATE, or RARE
    const allMaterials = Object.values(MATERIALS).filter(m => m.type !== 'FINAL');
    const rareMaterials = allMaterials.filter(m => m.type === 'RARE');
    const intermediateMaterials = allMaterials.filter(m => m.type === 'INTERMEDIATE');
    const baseMaterials = allMaterials.filter(m => m.type === 'BASE');

    const rand = Math.random();
    let randomResult: string;

    if (rand < 0.15) { // 15% chance for Rare
      randomResult = rareMaterials[Math.floor(Math.random() * rareMaterials.length)].id;
    } else if (rand < 0.50) { // 35% chance for Intermediate
      randomResult = intermediateMaterials[Math.floor(Math.random() * intermediateMaterials.length)].id;
    } else { // 50% chance for Base
      randomResult = baseMaterials[Math.floor(Math.random() * baseMaterials.length)].id;
    }
    
    playSound(SOUNDS.SUCCESS);
    setGrid(prev => {
      const next = [...prev];
      next[idx1] = randomResult;
      next[idx2] = null;
      return next;
    });
    
    markAsDiscovered(randomResult);
    
    const resultMat = MATERIALS[randomResult];
    if (resultMat.type === 'RARE') {
      if (!collectedRare.includes(randomResult)) {
        setCollectedRare(prev => [...prev, randomResult]);
      }
      setShowKnowledge(resultMat);
    }

    setFeedback(`商人收下了你的物资，并回赠了一个盲盒材料：${MATERIALS[randomResult].name}`);
    setMerchantSelectedIndices([]);
    setShowMerchant(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const activeIndex = active.id as number;
    const overIndex = over.id as number;

    if (activeIndex === overIndex) return;

    const matA = grid[activeIndex];
    const matB = grid[overIndex];

    if (!matA) return;

    if (!matB) {
      // Move to empty slot
      setGrid(prev => {
        const next = [...prev];
        next[overIndex] = matA;
        next[activeIndex] = null;
        return next;
      });
      return;
    }

    // Check recipe
    const recipe = RECIPES.find(r => 
      (r.ingredients[0] === matA && r.ingredients[1] === matB) ||
      (r.ingredients[0] === matB && r.ingredients[1] === matA)
    );

    if (recipe) {
      playSound(SOUNDS.SYNTH);
      setGrid(prev => {
        const next = [...prev];
        next[overIndex] = recipe.result;
        next[activeIndex] = null;
        return next;
      });
      
      markAsDiscovered(recipe.result);
      setFeedback(`合成成功：${MATERIALS[recipe.result].name}！`);
      setTimeout(() => setFeedback(null), 2000);

      const resultMat = MATERIALS[recipe.result];
      if (resultMat.type === 'RARE') {
        if (!collectedRare.includes(recipe.result)) {
          setCollectedRare(prev => [...prev, recipe.result]);
        }
        setShowKnowledge(resultMat);
      }

      setTotalSyntheses(prev => {
        const next = prev + 1;
        setConstructionLevel(Math.floor(next / 5) + 1);
        return next;
      });
    } else {
      // Swap positions if no recipe
      setGrid(prev => {
        const next = [...prev];
        const temp = next[overIndex];
        next[overIndex] = next[activeIndex];
        next[activeIndex] = temp;
        return next;
      });
    }
  };

  const handleDecorate = (floorIndex: number) => {
    // Check grid for materials
    const woodIndex = grid.indexOf('wood');
    const pigmentIndex = grid.lastIndexOf('pigment'); // Find another one

    if (woodIndex !== -1 && pigmentIndex !== -1 && woodIndex !== pigmentIndex) {
      playSound(SOUNDS.SUCCESS);
      setGrid(prev => {
        const next = [...prev];
        next[woodIndex] = null;
        next[pigmentIndex] = null;
        return next;
      });
      setDecorations(prev => ({
        ...prev,
        [floorIndex]: (prev[floorIndex] || 0) + 1
      }));
    } else {
      playSound(SOUNDS.INCORRECT);
      setFeedback('材料不足：需要 1x木材 + 1x颜料 在格子里');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleFinalSynthesize = () => {
    if (collectedRare.length < 5) return;
    setPhase('SYNTHESIS');
  };

  const handleFinalSynthesisComplete = () => {
    setIsCinematic(true);
    setTimeout(() => {
      playSound(SOUNDS.SUCCESS);
      setPhase('SUCCESS');
      setIsCinematic(false);
    }, 4000);
  };

  if (phase === 'START') {
    return (
      <div className="flex h-screen bg-surface overflow-hidden items-center justify-center p-4">
        <div className="relative w-full max-w-[1600px] aspect-video bg-surface shadow-2xl overflow-hidden flex flex-col items-center justify-center border border-outline-variant/10 rounded-3xl">
          <div className="absolute inset-0 z-0">
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

            <button 
              onClick={handleDailyCheckIn}
              className="mt-12 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-white/5 px-8 py-3 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10"
            >
              <CalendarCheck size={16} />
              每日签到领材料
            </button>
          </motion.div>

          <footer className="absolute bottom-8 left-0 w-full z-10 px-12 flex justify-between items-end text-white/60">
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
      </div>
    );
  }

  if (phase === 'PLAYING') {
    return (
      <div className="flex h-screen bg-surface overflow-hidden items-center justify-center p-4">
        {/* 16:9 Container */}
        <div className="relative w-full max-w-[1600px] aspect-video bg-surface shadow-2xl overflow-hidden flex border border-outline-variant/10 rounded-3xl">
          {/* Top Nav */}
          <nav className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
            <div className="flex items-center gap-8">
            <span className="text-2xl font-bold text-secondary font-serif tracking-tight uppercase">御用建筑师</span>
            <div className="flex items-center gap-4 ml-8">
              <div className="bg-surface-container-high px-4 py-1 rounded-full border border-outline-variant/20">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase mr-2">稀有构件</span>
                <span className="text-lg font-bold text-primary tabular-nums">{collectedRare.length} / 5</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-primary hover:bg-surface-container-highest rounded-lg"><Settings size={20} /></button>
            <button onClick={() => setIsPaused(!isPaused)} className="p-2 text-primary hover:bg-surface-container-highest rounded-lg">{isPaused ? <Play size={20} /> : <Pause size={20} />}</button>
          </div>
        </nav>

        {/* Sidebar */}
        <aside className="w-64 pt-20 flex flex-col bg-surface-container/50 border-r border-outline-variant/10 shadow-xl z-40">
          <div className="px-6 py-6 border-b border-outline-variant/10">
            <h2 className="text-lg font-bold text-primary mb-1">营造工坊</h2>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">拖动材料进行合成</p>
          </div>
          <nav className="flex-1 py-4">
            <SidebarItem 
              icon={Sparkles} 
              label="获取材料" 
              active={showCategorySelection} 
              onClick={() => setShowCategorySelection(true)} 
            />
            <SidebarItem 
              icon={Book} 
              label="营造图鉴" 
              active={showHandbook} 
              onClick={() => setShowHandbook(true)} 
            />
            <SidebarItem 
              icon={Store} 
              label="鲁班商人" 
              active={showMerchant} 
              onClick={() => setShowMerchant(true)} 
            />
            <SidebarItem 
              icon={RotateCcw} 
              label="重置进度" 
              onClick={handleReset} 
            />
          </nav>
          
          <div className="p-4 border-t border-outline-variant/10">
            <ProgressBar value={(collectedRare.length / 5) * 100} label="工程总进度" />
            {collectedRare.length === 5 && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleFinalSynthesize}
                className="w-full bg-primary text-white py-4 rounded-lg font-bold shadow-xl hover:scale-105 active:scale-95 transition-all mt-6 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                开启终极合成
              </motion.button>
            )}
          </div>
        </aside>

        {/* Main View */}
        <main className="flex-1 relative flex flex-col bg-surface-container-low overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={IMAGES.BACKGROUND_SNAKE_HILL} className="w-full h-full object-cover" alt="BG" referrerPolicy="no-referrer" />
          </div>

          <div className="relative z-10 p-8 flex-1 flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
              <h3 className="text-3xl font-bold text-primary mb-2">营造工坊</h3>
              <p className="text-on-surface-variant">将一个材料拖动到另一个材料上进行合成</p>
            </div>

            <DndContext 
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-3 grid-rows-3 gap-4 p-6 bg-surface-container rounded-3xl border-4 border-primary/20 shadow-2xl w-full max-w-md aspect-square">
                {grid.map((matId, i) => (
                  <GridSlot key={i} index={i} materialId={matId} />
                ))}
              </div>

              <DragOverlay>
                {activeId !== null && grid[activeId] ? (
                  <div className="w-16 h-16 md:w-20 md:h-20 p-2 bg-surface rounded-xl border-2 border-primary shadow-2xl flex flex-col items-center justify-center scale-110">
                    <img src={MATERIALS[grid[activeId]!].image} className="w-full h-full object-contain" alt="Dragging" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-bold mt-1">{MATERIALS[grid[activeId]!].name}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg"
              >
                {feedback}
              </motion.div>
            )}
          </div>
        </main>

        {/* Merchant Modal */}
        <AnimatePresence>
          {showMerchant && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20"
              >
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Store size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-primary">鲁班商人</h2>
                      <p className="text-on-surface-variant text-[10px]">“等价交换，童叟无欺。”</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowMerchant(false); setMerchantSelectedIndices([]); }} className="p-1.5 hover:bg-surface-container-highest rounded-full">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">选择两个要兑换的材料</h3>
                    <div className="grid grid-cols-3 gap-1.5 bg-surface-container p-2 rounded-xl border border-primary/10">
                      {grid.map((matId, i) => (
                        <button
                          key={i}
                          disabled={!matId}
                          onClick={() => {
                            if (merchantSelectedIndices.includes(i)) {
                              setMerchantSelectedIndices(prev => prev.filter(idx => idx !== i));
                            } else if (merchantSelectedIndices.length < 2) {
                              setMerchantSelectedIndices(prev => [...prev, i]);
                            }
                          }}
                          className={`aspect-square rounded-lg border transition-all flex flex-col items-center justify-center p-0.5 relative ${
                            !matId ? 'bg-surface-container-low border-transparent opacity-30 cursor-not-allowed' :
                            merchantSelectedIndices.includes(i) ? 'bg-primary/10 border-primary shadow-md scale-105' : 'bg-surface border-outline-variant/20 hover:border-primary/50'
                          }`}
                        >
                          {matId && (
                            <>
                              <img src={MATERIALS[matId].image} className="w-6 h-6 object-contain mb-0.5" alt="" referrerPolicy="no-referrer" />
                              <span className="text-[8px] font-bold text-on-surface truncate w-full text-center leading-tight">{MATERIALS[matId].name}</span>
                              {merchantSelectedIndices.includes(i) && (
                                <div className="absolute -top-1 -right-1 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border border-surface">
                                  {merchantSelectedIndices.indexOf(i) + 1}
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <div className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center ${merchantSelectedIndices[0] !== undefined ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                        {merchantSelectedIndices[0] !== undefined && grid[merchantSelectedIndices[0]] && (
                          <img src={MATERIALS[grid[merchantSelectedIndices[0]]!].image} className="w-6 h-6 object-contain" alt="" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <Plus size={14} />
                      <div className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center ${merchantSelectedIndices[1] !== undefined ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>
                        {merchantSelectedIndices[1] !== undefined && grid[merchantSelectedIndices[1]] && (
                          <img src={MATERIALS[grid[merchantSelectedIndices[1]]!].image} className="w-6 h-6 object-contain" alt="" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <ArrowRight size={16} className="mx-0.5" />
                      <div className="w-10 h-10 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center text-primary">
                        <HelpCircle size={20} className="animate-pulse" />
                      </div>
                    </div>

                    <button
                      disabled={merchantSelectedIndices.length !== 2}
                      onClick={handleMerchantExchange}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        merchantSelectedIndices.length === 2 ? 'bg-primary text-white hover:scale-105 active:scale-95' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag size={16} />
                      确认兑换
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz Category Selection Modal */}
        <AnimatePresence>
          {showCategorySelection && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20"
              >
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                  <div>
                    <h2 className="text-lg font-bold text-primary">选择考学类型</h2>
                    <p className="text-on-surface-variant text-[10px] mt-0.5">答对任意题目均有概率获得所有基础材料</p>
                  </div>
                  <button onClick={() => setShowCategorySelection(false)} className="p-1.5 hover:bg-surface-container-highest rounded-full">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(['HISTORY', 'ARCHITECTURE', 'POETRY', 'LEGEND'] as QuizCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setShowCategorySelection(false);
                        triggerQuiz(cat);
                      }}
                      className="group p-3 rounded-xl border border-outline-variant/20 hover:border-primary hover:bg-primary/5 transition-all text-left flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          {cat === 'HISTORY' ? '历史典故' : cat === 'ARCHITECTURE' ? '建筑构造' : cat === 'POETRY' ? '诗词歌赋' : '民间传说'}
                        </span>
                        <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {CATEGORY_DROPS[cat].map(dropId => (
                          <div key={dropId} className="flex items-center gap-1 bg-surface-container px-1 py-0.5 rounded text-[8px] font-bold text-on-surface-variant">
                            <img src={MATERIALS[dropId].image} className="w-2 h-2 rounded-full" alt="" referrerPolicy="no-referrer" />
                            {MATERIALS[dropId].name}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Handbook Modal */}
        <AnimatePresence>
          {showHandbook && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-surface w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col"
              >
                <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Book size={24} />
                        营造图鉴
                      </h2>
                      <p className="text-on-surface-variant mt-0.5 uppercase tracking-widest text-[10px]">所有建筑构件与材料参考</p>
                    </div>
                    
                    <div className="flex bg-surface-container-highest p-1 rounded-lg ml-4">
                      <button 
                        onClick={() => setHandbookTab('GALLERY')}
                        className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${handbookTab === 'GALLERY' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
                      >
                        构件图鉴
                      </button>
                      <button 
                        onClick={() => setHandbookTab('RECIPES')}
                        className={`px-4 py-1.5 rounded-md font-bold text-xs transition-all ${handbookTab === 'RECIPES' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
                      >
                        合成图纸
                      </button>
                    </div>
                  </div>
                  <button onClick={() => setShowHandbook(false)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <X size={24} className="text-on-surface-variant" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-surface-container-low">
                  {handbookTab === 'GALLERY' ? (
                    <div className="space-y-8">
                      {['BASE', 'INTERMEDIATE', 'RARE', 'FINAL'].map(type => (
                        <div key={type} className="space-y-4">
                          <h3 className="text-base font-bold text-secondary border-l-4 border-secondary pl-3 flex items-center gap-2">
                            {type === 'BASE' ? '基础材料' : type === 'INTERMEDIATE' ? '中间构件' : type === 'RARE' ? '核心构件' : '最终成品'}
                            <span className="text-[10px] font-normal text-on-surface-variant opacity-60">({Object.values(MATERIALS).filter(m => m.type === type).length})</span>
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.values(MATERIALS).filter(m => m.type === type).map(mat => {
                              const isDiscovered = discoveredMaterials.includes(mat.id);
                              return (
                                <div key={mat.id} className="bg-surface p-3 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-surface-container mb-2 relative">
                                    <img 
                                      src={mat.image} 
                                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!isDiscovered ? 'grayscale brightness-50' : ''}`} 
                                      alt={mat.name} 
                                      referrerPolicy="no-referrer" 
                                    />
                                    {!isDiscovered && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                        <Lock size={18} className="text-white/50" />
                                      </div>
                                    )}
                                    {type === 'RARE' && collectedRare.includes(mat.id) && (
                                      <div className="absolute top-1 right-1 bg-secondary text-white p-0.5 rounded-full shadow-lg">
                                        <Sparkles size={10} />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className={`font-bold text-xs mb-0.5 ${isDiscovered ? 'text-primary' : 'text-on-surface-variant opacity-50'}`}>
                                    {isDiscovered ? mat.name : '未知材料'}
                                  </h4>
                                  <p className="text-[9px] text-on-surface-variant leading-tight line-clamp-2">
                                    {isDiscovered ? mat.description : '获取该材料后解锁描述'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-6">
                        <h3 className="text-base font-bold text-primary mb-1 flex items-center gap-2">
                          <Hammer size={18} />
                          营造秘籍：合成逻辑
                        </h3>
                        <p className="text-on-surface-variant text-xs">
                          在营造工坊中，将左侧的材料拖动到右侧的材料上即可尝试合成。
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {RECIPES.map((recipe, i) => {
                          const isDiscovered = discoveredMaterials.includes(recipe.result);
                          return (
                            <div key={i} className="bg-surface p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between group hover:border-primary transition-all">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                  <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-surface overflow-hidden">
                                    <img src={MATERIALS[recipe.ingredients[0]].image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-surface overflow-hidden">
                                    <img src={MATERIALS[recipe.ingredients[1]].image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-on-surface-variant uppercase">配方</span>
                                  <span className="text-xs font-bold text-on-surface">
                                    {MATERIALS[recipe.ingredients[0]].name.slice(0,2)} + {MATERIALS[recipe.ingredients[1]].name.slice(0,2)}
                                  </span>
                                </div>
                              </div>

                              <ArrowRight size={16} className="text-outline-variant" />

                              <div className="flex items-center gap-3 text-right">
                                <div className="flex flex-col">
                                  <span className="text-[9px] font-bold text-secondary uppercase">产出</span>
                                  <span className={`text-xs font-bold ${isDiscovered ? 'text-primary' : 'text-on-surface-variant opacity-50'}`}>
                                    {isDiscovered ? MATERIALS[recipe.result].name : '???'}
                                  </span>
                                </div>
                                <div className={`w-12 h-12 rounded-lg bg-surface-container border overflow-hidden ${isDiscovered ? 'border-primary' : 'border-outline-variant/20 grayscale'}`}>
                                  <img src={MATERIALS[recipe.result].image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Quiz Modal */}
          <AnimatePresence>
            {showQuiz && currentQuiz && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-surface w-full max-w-3xl border-4 border-primary shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Left: Quiz Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-primary/5">
                      <div>
                        <h2 className="text-lg font-bold text-primary tracking-tight uppercase">营造考学：{currentQuiz.category === 'HISTORY' ? '历史' : currentQuiz.category === 'ARCHITECTURE' ? '建筑' : currentQuiz.category === 'POETRY' ? '诗词' : '传说'}</h2>
                        <p className="text-on-surface-variant text-[10px]">回答正确即可获得基础建筑材料</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase block">剩余时间</span>
                        <span className={`text-xl font-bold tabular-nums ${timeLeft < 5 ? 'text-secondary animate-pulse' : 'text-primary'}`}>
                          {timeLeft}s
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto">
                      <div className="bg-surface-container-low p-4 border-l-4 border-secondary mb-4">
                        <p className="text-base font-medium text-on-surface leading-relaxed">
                          {currentQuiz.question}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {currentQuiz.options.map((option) => (
                          <button 
                            key={option.id}
                            onClick={() => handleAnswer(option.id)}
                            disabled={isCorrect !== null}
                            className={`w-full text-left p-3 border-2 transition-all rounded-lg flex items-center gap-3 group ${
                              selectedOption === option.id
                                ? isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                                : 'border-outline-variant/30 hover:bg-primary/5 hover:border-primary'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] ${
                              selectedOption === option.id
                                ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                : 'border-outline group-hover:bg-primary group-hover:text-white'
                            }`}>
                              {option.id}
                            </span>
                            <span className="font-bold text-xs text-on-surface">{option.text}</span>
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {feedback && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded text-xs text-center font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {feedback}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="p-4 border-t border-outline-variant/10 bg-surface-container flex justify-end gap-3">
                      <button 
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-secondary-container transition-all flex items-center gap-2"
                      >
                        <Hammer size={16} />
                        返回营造工坊
                      </button>
                    </div>
                  </div>

                  {/* Right: Inventory Sidebar in Quiz */}
                  <div className="w-48 bg-surface-container-low border-l border-outline-variant/20 p-4 flex flex-col">
                    <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
                      <Package size={14} />
                      当前材料仓
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 overflow-y-auto flex-1">
                      {grid.map((matId, i) => (
                        <div key={i} className="aspect-square bg-surface border border-outline-variant/10 rounded-lg flex items-center justify-center p-1 relative">
                          {matId ? (
                            <img src={MATERIALS[matId].image} className="w-full h-full object-cover rounded" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-surface-container-highest/20 rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-outline-variant/10">
                      <p className="text-[9px] text-on-surface-variant leading-tight">
                        提示：格子满时无法获得新材料。
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Knowledge Card Modal */}
          <AnimatePresence>
            {showKnowledge && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
              >
                <motion.div 
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-surface w-full max-w-md p-6 border-4 border-secondary shadow-[0_0_30px_rgba(0,0,0,0.5)] relative"
                >
                  <button onClick={() => setShowKnowledge(null)} className="absolute top-2 right-2 text-on-surface-variant hover:text-primary"><X size={20} /></button>
                  <div className="text-center mb-4">
                    <span className="px-2 py-0.5 bg-secondary text-white text-[8px] font-bold tracking-widest uppercase rounded">稀有核心构件</span>
                    <h2 className="text-2xl font-serif text-primary font-bold mt-2">{showKnowledge.name}</h2>
                  </div>
                  <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 border-2 border-outline-variant/20">
                    <img src={showKnowledge.image} className="w-full h-full object-cover" alt={showKnowledge.name} referrerPolicy="no-referrer" />
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-secondary">
                    <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">建筑知识</h4>
                    <p className="text-xs text-on-surface leading-relaxed italic">“{showKnowledge.knowledge}”</p>
                  </div>
                  <button 
                    onClick={() => setShowKnowledge(null)}
                    className="w-full mt-6 bg-primary text-white py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
                  >
                    收录法式图集
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (phase === 'SYNTHESIS') {
    return (
      <div className="flex h-screen bg-surface overflow-hidden items-center justify-center p-4">
        <div className="relative w-full max-w-[1600px] aspect-video bg-surface shadow-2xl overflow-hidden flex flex-col items-center justify-center border border-outline-variant/10 rounded-3xl">
          <div className="absolute inset-0 z-0 opacity-30">
            <img src={IMAGES.BACKGROUND_SNAKE_HILL} className="w-full h-full object-cover" alt="BG" referrerPolicy="no-referrer" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center mb-16"
          >
            <h2 className="text-5xl font-serif text-primary font-bold mb-4 tracking-[0.5em]">万材归宗</h2>
            <p className="text-on-surface-variant tracking-widest text-lg">五大稀有构件已齐备，即刻开启黄鹤楼终极合成</p>
          </motion.div>

          <div className="relative z-10 flex flex-wrap gap-8 items-center justify-center max-w-4xl">
            {FINAL_RECIPE.map((id, i) => (
              <motion.div
                key={id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center shadow-2xl overflow-hidden p-2">
                  <img src={MATERIALS[id].image} className="w-full h-full object-contain" alt={MATERIALS[id].name} referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-primary text-xs tracking-widest">{MATERIALS[id].name}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={handleFinalSynthesisComplete}
            className="mt-20 bg-secondary text-white px-16 py-6 rounded-full font-bold text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4"
          >
            <RefreshCw size={28} />
            开始终极合成
          </motion.button>

          <AnimatePresence>
            {isCinematic && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.1, rotate: 0, opacity: 0 }}
                  animate={{ scale: [0.1, 1.2, 1], rotate: [0, 360, 720], opacity: 1 }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="relative"
                >
                  <img src={IMAGES.COMPLETED_TOWER} className="max-h-[70vh] object-contain" alt="Tower" referrerPolicy="no-referrer" />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-secondary rounded-full blur-3xl"
                  />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="text-6xl font-serif text-primary mt-12 tracking-[1em] font-bold"
                >
                  名楼重现
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (phase === 'SUCCESS') {
    return (
      <div className="flex h-screen bg-surface overflow-hidden items-center justify-center p-4">
        <div className="relative w-full max-w-[1600px] aspect-video bg-surface shadow-2xl overflow-hidden flex flex-col items-center justify-center border border-outline-variant/10 rounded-3xl">
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
            className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center overflow-y-auto max-h-full p-8"
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
              
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-6">
                  <div className="inline-block px-4 py-1 border-y border-outline-variant/30">
                    <span className="text-on-surface-variant font-medium tracking-[0.2em] uppercase text-xs">唐 · 崔颢 · 《黄鹤楼》</span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-3xl md:text-4xl text-on-surface font-serif leading-relaxed tracking-widest">
                      昔人已乘黄鹤去，此地空余黄鹤楼。<br/>
                      黄鹤一去不复返，白云千载空悠悠。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-primary/20 pb-2 flex items-center gap-2">
                    <BookOpen size={20} />
                    分层知识讲解
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FLOOR_INFO.map((floor, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface-container-highest p-4 rounded-lg border-l-4 border-secondary relative group"
                      >
                        <h4 className="font-bold text-secondary text-sm mb-1">{floor.floor}：{floor.title}</h4>
                        <p className="text-on-surface-variant text-xs leading-relaxed">{floor.content}</p>
                        
                        {decorations[i] ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 p-3 bg-primary/5 rounded border border-primary/20"
                          >
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">隐藏知识点</span>
                            <p className="text-[11px] text-on-surface italic">“{floor.hidden}”</p>
                          </motion.div>
                        ) : (
                          <button 
                            onClick={() => handleDecorate(i)}
                            className="mt-3 w-full py-2 bg-surface-container border border-outline-variant/30 rounded text-[10px] font-bold text-on-surface-variant hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Hammer size={12} />
                            进行楼层扩建 (消耗 2x木材 + 2x颜料)
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
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
                    <h4 className="font-bold text-secondary text-xs uppercase tracking-widest mb-2">建筑特色</h4>
                    <p className="text-on-surface text-sm italic leading-relaxed">
                      “外观五层、内部九层，四方套八边形结构，72根圆柱支撑，60个翘角凌空欲飞，金色琉璃瓦熠熠生辉。”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-center">
              <button 
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-3 bg-secondary text-white px-10 py-5 font-extrabold uppercase tracking-widest text-base transition-all hover:bg-secondary-container active:scale-95 shadow-xl"
              >
                <BookOpen size={18} />
                完整导游词
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-3 bg-primary text-white px-10 py-5 font-extrabold uppercase tracking-widest text-base transition-all hover:bg-primary-container active:scale-95 shadow-xl"
              >
                <RotateCcw size={18} />
                重回起点
              </button>
            </div>

            {/* Surrounding Buildings Gallery */}
            <div className="mt-16 w-full max-w-4xl">
              <h3 className="text-2xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-3">
                <LandPlot size={24} />
                周边建筑图鉴 (建造等级: LV.{constructionLevel})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: '铸铜黄鹤', level: 1, icon: Bird },
                  { name: '胜像宝塔', level: 2, icon: Tent },
                  { name: '牌坊', level: 3, icon: Building2 },
                  { name: '轩廊', level: 4, icon: LandPlot },
                ].map((b, i) => (
                  <div key={i} className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                    constructionLevel >= b.level ? 'bg-surface-container border-secondary shadow-lg' : 'bg-surface-container-low border-outline-variant/10 opacity-40 grayscale'
                  }`}>
                    <b.icon size={32} className={constructionLevel >= b.level ? 'text-secondary' : 'text-on-surface-variant'} />
                    <span className="font-bold text-sm">{b.name}</span>
                    {constructionLevel < b.level && <span className="text-[10px] text-on-surface-variant">LV.{b.level} 解锁</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Guide Modal */}
            <AnimatePresence>
              {showGuide && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-surface w-full max-w-3xl max-h-[80vh] overflow-y-auto p-12 border-8 border-primary shadow-2xl relative"
                  >
                    <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 text-on-surface-variant hover:text-primary"><X size={32} /></button>
                    <h2 className="text-4xl font-serif text-primary font-bold mb-8 border-b-4 border-primary/20 pb-4">黄鹤楼完整导游词</h2>
                    <div className="space-y-8 text-on-surface leading-loose text-lg font-serif">
                      <p>各位游客朋友们，大家好！欢迎来到“天下江山第一楼”——黄鹤楼。</p>
                      <p>黄鹤楼坐落在武汉市长江南岸的蛇山之巅。它始建于三国时代吴黄武二年（223年），距今已有1800多年的历史。我们现在看到的这座楼，是以清代“同治楼”为原型，于1985年落成开放的。</p>
                      <p>整座楼高51.4米，外观五层，内部实际上有九层，寓意“九五至尊”。它采用了四边套八边形的钢筋混凝土框架仿木结构，由72根大圆柱支撑，60个翘角凌空欲飞，金黄琉璃瓦屋面在阳光下熠熠生辉。</p>
                      <p>接下来，请随我逐层领略名楼的文化底蕴...</p>
                      {FLOOR_INFO.map((floor, i) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-bold text-primary text-xl">【{floor.floor}：{floor.title}】</h4>
                          <p>{floor.content}</p>
                        </div>
                      ))}
                      <p>登楼远眺，武汉三镇尽收眼底。正如崔颢诗云：“晴川历历汉阳树，芳草萋萋鹦鹉洲。”希望这次“云构黄鹤”的旅程能让您感受到中华建筑与文化的博大精深。</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  return null; // Should never reach here as all phases are handled
}
