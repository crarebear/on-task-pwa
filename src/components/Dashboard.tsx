import React, { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { buckets, logs } = useAppData();

  // Calculate data for today
  const todayData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todaysLogs = logs.filter(l => l.timestamp >= startOfDay);
    
    const totals: Record<string, number> = {};
    buckets.forEach(b => totals[b.id] = 0);
    
    todaysLogs.forEach(log => {
      Object.entries(log.buckets).forEach(([id, mins]) => {
        if (totals[id] !== undefined) totals[id] += mins;
      });
    });

    const totalMinutes = Object.values(totals).reduce((a, b) => a + b, 0);

    return buckets.map(b => ({
      name: b.name,
      value: totals[b.id],
      goal: b.goalPercent,
      percent: totalMinutes > 0 ? (totals[b.id] / totalMinutes) * 100 : 0,
      color: b.id === 'on-task' ? '#6366f1' : b.id === 'social' ? '#f59e0b' : '#10b981'
    }));
  }, [buckets, logs]);

  const COLORS = todayData.map(d => d.color);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <h3>Total Tracked</h3>
            <p className="stat-value">{todayData.reduce((a, b) => a + b.value, 0)}m</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card stat-card">
          <div className="stat-icon"><Target size={24} /></div>
          <div className="stat-info">
            <h3>Daily Goal</h3>
            <p className="stat-value">On Task: {buckets.find(b => b.id === 'on-task')?.goalPercent}%</p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="glass-card chart-container"
      >
        <h3>Time Distribution (Today)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={todayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {todayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="buckets-comparison">
        {todayData.map((d, i) => (
          <div key={i} className="comparison-row">
            <div className="bucket-info">
              <span className="dot" style={{ background: d.color }} />
              <span className="name">{d.name}</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar">
                <motion.div 
                   className="fill" 
                   initial={{ width: 0 }}
                   animate={{ width: `${d.percent}%` }}
                   style={{ background: d.color }}
                />
                <div className="goal-marker" style={{ left: `${d.goal}%` }} />
              </div>
              <div className="labels">
                <span>{d.percent.toFixed(0)}% actual</span>
                <span>{d.goal}% goal</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }
        .stat-icon {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .stat-info h3 {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin: 0;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .chart-container h3 {
          margin-bottom: 1rem;
          text-align: center;
        }
        .buckets-comparison {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .comparison-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bucket-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .progress-track {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          position: relative;
          overflow: visible;
        }
        .fill {
          height: 100%;
          border-radius: 4px;
        }
        .goal-marker {
          position: absolute;
          top: -4px;
          bottom: -4px;
          width: 2px;
          background: var(--text-primary);
          opacity: 0.5;
        }
        .labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
