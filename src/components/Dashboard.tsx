import React, { useMemo, useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Clock, Calendar, ChevronDown, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { buckets, logs, reportConfig } = useAppData();
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly' | 'trailingX'>('daily');

  // Filter available ranges based on config
  const availableRanges = useMemo(() => {
    const list: { id: 'daily' | 'weekly' | 'monthly' | 'trailingX'; label: string }[] = [];
    if (reportConfig.daily) list.push({ id: 'daily', label: 'Today' });
    if (reportConfig.weekly) list.push({ id: 'weekly', label: 'Weekly' });
    if (reportConfig.monthly) list.push({ id: 'monthly', label: 'Monthly' });
    if (reportConfig.trailingX) list.push({ id: 'trailingX', label: `Last ${reportConfig.trailingXDays} Days` });
    return list;
  }, [reportConfig]);

  // If current range is disabled, fallback to first available
  useEffect(() => {
    if (!reportConfig[range]) {
      if (availableRanges.length > 0) setRange(availableRanges[0].id);
    }
  }, [reportConfig, range, availableRanges]);

  // Calculate data based on range
  const rangeData = useMemo(() => {
    const now = new Date();
    let startTime: number;

    switch (range) {
      case 'daily':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        break;
      case 'weekly':
        const day = now.getDay() || 7;
        const monday = new Date(now);
        monday.setHours(0,0,0,0);
        monday.setDate(now.getDate() - day + 1);
        startTime = monday.getTime();
        break;
      case 'monthly':
        startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        break;
      case 'trailingX':
        startTime = now.getTime() - (reportConfig.trailingXDays * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = 0;
    }
    
    const filteredLogs = logs.filter(l => l.timestamp >= startTime);
    
    const totals: Record<string, number> = {};
    buckets.forEach(b => totals[b.id] = 0);
    
    filteredLogs.forEach(log => {
      Object.entries(log.buckets).forEach(([id, mins]) => {
        if (totals[id] !== undefined) totals[id] += mins as number;
      });
    });

    const totalMinutes = Object.values(totals).reduce((a, b) => a + (b as number), 0);

    return buckets.map(b => ({
      name: b.name,
      value: totals[b.id],
      goal: b.goalPercent,
      percent: totalMinutes > 0 ? ((totals[b.id] as number) / (totalMinutes as number)) * 100 : 0,
      color: b.id === 'on-task' ? '#6366f1' : b.id === 'social' ? '#f59e0b' : '#10b981'
    }));
  }, [buckets, logs, range, reportConfig]);

  const COLORS = rangeData.map(d => d.color);
  const currentRangeLabel = availableRanges.find(r => r.id === range)?.label || 'Report';

  return (
    <div className="dashboard">
      <div className="range-selector-container">
        <div className="glass-card range-card">
          <Calendar size={18} className="accent-icon" />
          <select 
            className="range-select" 
            value={range} 
            onChange={(e) => setRange(e.target.value as any)}
          >
            {availableRanges.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="chevron" />
        </div>
      </div>

      <div className="stats-grid">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <h3>Total Tracked</h3>
            <p className="stat-value">{rangeData.reduce((a, b) => a + (b.value as number), 0).toFixed(0)}m</p>
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
        <h3>{currentRangeLabel} Distribution</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rangeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {rangeData.map((_, index) => (
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
        {rangeData.map((d, i) => (
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
          padding-bottom: 7rem;
        }
        .range-selector-container {
          margin-bottom: 0.5rem;
        }
        .range-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.75rem 1rem;
          position: relative;
        }
        .range-select {
          appearance: none;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          width: 100%;
          cursor: pointer;
          outline: none;
          padding-right: 20px;
        }
        .accent-icon {
          color: var(--accent);
        }
        .chevron {
          position: absolute;
          right: 1rem;
          pointer-events: none;
          color: var(--text-secondary);
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
