import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  Camera, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Search,
  MoreVertical,
  CheckCircle2,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Student, AttentionLevel, ClassroomStats, AIInsight } from './types';
import { analyzeClassroomImage, getTeachingTips } from './services/geminiService';

// Mock Data
const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', attentionScore: 85, lastLevel: AttentionLevel.HIGH, status: 'active', history: [] },
  { id: '2', name: 'Sarah Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', attentionScore: 42, lastLevel: AttentionLevel.LOW, status: 'active', history: [] },
  { id: '3', name: 'Michael Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', attentionScore: 92, lastLevel: AttentionLevel.HIGH, status: 'active', history: [] },
  { id: '4', name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', attentionScore: 65, lastLevel: AttentionLevel.MEDIUM, status: 'active', history: [] },
  { id: '5', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', attentionScore: 28, lastLevel: AttentionLevel.DISTRACTED, status: 'active', history: [] },
  { id: '6', name: 'Olivia Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', attentionScore: 78, lastLevel: AttentionLevel.HIGH, status: 'active', history: [] },
];

const TREND_DATA = [
  { time: '09:00', score: 82 },
  { time: '09:15', score: 78 },
  { time: '09:30', score: 85 },
  { time: '09:45', score: 65 },
  { time: '10:00', score: 72 },
  { time: '10:15', score: 88 },
  { time: '10:30', score: 80 },
];

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [stats, setStats] = useState<ClassroomStats>({
    averageAttention: 72,
    activeStudents: 24,
    totalStudents: 25,
    attentionTrend: TREND_DATA
  });
  const [insights, setInsights] = useState<AIInsight[]>([
    { title: "Mid-Lesson Slump", description: "Attention levels dropped 15% in the last 10 minutes. Try a quick physical activity.", type: "warning" },
    { title: "High Participation", description: "Visual learners are highly engaged with the current slides.", type: "success" },
    { title: "Individual Focus", description: "Sarah and James might need extra support with the current concept.", type: "tip" }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStudents(prev => prev.map(s => ({
        ...s,
        attentionScore: Math.max(0, Math.min(100, s.attentionScore + (Math.random() * 10 - 5)))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      
      const result = await analyzeClassroomImage(base64Image);
      if (result) {
        setStats(prev => ({ ...prev, averageAttention: result.overallScore }));
        setInsights(result.insights);
      }
    }
    setIsAnalyzing(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Brain className="text-white w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">EduFocus</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users size={20} />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          <NavItem icon={<TrendingUp size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="text-indigo-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Prof. Anderson</p>
              <p className="text-xs text-slate-500">Mathematics Dept.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search students or insights..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={handleCapture}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Camera size={18} />}
              Analyze Class
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Avg. Attention" 
              value={`${Math.round(stats.averageAttention)}%`} 
              trend="+5.2%" 
              icon={<Brain className="text-indigo-600" />} 
              color="indigo"
            />
            <StatCard 
              title="Active Students" 
              value={`${stats.activeStudents}/${stats.totalStudents}`} 
              trend="96%" 
              icon={<Users className="text-emerald-600" />} 
              color="emerald"
            />
            <StatCard 
              title="Engagement Peak" 
              value="10:15 AM" 
              trend="Highest" 
              icon={<TrendingUp className="text-amber-600" />} 
              color="amber"
            />
            <StatCard 
              title="Attention Alerts" 
              value="3" 
              trend="Requires Action" 
              icon={<AlertCircle className="text-rose-600" />} 
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Attention Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Attention Trend</h3>
                  <p className="text-sm text-slate-500">Real-time engagement tracking</p>
                </div>
                <select className="bg-slate-50 border-slate-200 rounded-lg text-sm font-medium px-3 py-1.5">
                  <option>Last Hour</option>
                  <option>Today</option>
                </select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.attentionTrend}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights & Tips */}
            <div className="space-y-8 flex flex-col">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="text-amber-500" size={20} />
                  <h3 className="font-bold text-lg">AI Insights</h3>
                </div>
                <div className="space-y-4 flex-1">
                  {insights.map((insight, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className={cn(
                        "p-4 rounded-xl border flex gap-3",
                        insight.type === 'warning' ? "bg-rose-50 border-rose-100" : 
                        insight.type === 'success' ? "bg-emerald-50 border-emerald-100" : 
                        "bg-indigo-50 border-indigo-100"
                      )}
                    >
                      <div className={cn(
                        "mt-1",
                        insight.type === 'warning' ? "text-rose-600" : 
                        insight.type === 'success' ? "text-emerald-600" : 
                        "text-indigo-600"
                      )}>
                        {insight.type === 'warning' ? <AlertCircle size={18} /> : 
                         insight.type === 'success' ? <CheckCircle2 size={18} /> : 
                         <Lightbulb size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{insight.title}</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={20} />
                  <h3 className="font-bold text-lg">Smart Teaching Tips</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4">Enter your current topic to get AI-powered engagement strategies.</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="e.g. Calculus, World War II" 
                    className="w-full bg-indigo-500/50 border-indigo-400 rounded-xl px-4 py-2 text-sm placeholder:text-indigo-200 focus:ring-white focus:border-white"
                  />
                  <button className="w-full py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                    Generate Strategies
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Student Attention Monitor</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <select className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer">
                  <option>Attention Score</option>
                  <option>Name</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Attention Level</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                          <span className="font-semibold text-sm">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AttentionBadge score={student.attentionScore} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-48">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${student.attentionScore}%` }}
                              className={cn(
                                "h-full rounded-full",
                                student.attentionScore > 70 ? "bg-emerald-500" :
                                student.attentionScore > 40 ? "bg-amber-500" : "bg-rose-500"
                              )}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{Math.round(student.attentionScore)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          student.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hidden Camera Elements */}
        <video ref={videoRef} autoPlay playsInline className="hidden" width="640" height="480" />
        <canvas ref={canvasRef} className="hidden" width="640" height="480" />
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
        active 
          ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, icon, color }: { title: string, value: string, trend: string, icon: React.ReactNode, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
          {icon}
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-1 rounded-lg",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold mt-1 text-slate-800">{value}</h4>
    </div>
  );
}

function AttentionBadge({ score }: { score: number }) {
  let label = "High";
  let color = "bg-emerald-100 text-emerald-700";
  
  if (score < 40) {
    label = "Distracted";
    color = "bg-rose-100 text-rose-700";
  } else if (score < 70) {
    label = "Medium";
    color = "bg-amber-100 text-amber-700";
  }

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", color)}>
      {label}
    </span>
  );
}
