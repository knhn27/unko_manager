import React, { useState } from "react";
import { TrendingUp, AlertTriangle, Smile, Calendar, BarChart3 } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, format } from "date-fns";
import { ja } from "date-fns/locale";

interface UnkoRecord {
  id: string;
  date: string;
  time: string;
  shape: "normal" | "hard" | "soft" | "watery";
  notes?: string;
}

type Props = {
  records: UnkoRecord[];
  currentDate: Date;
};

type Period = 'week' | 'month' | 'year';

const Stats = ({ records, currentDate }: Props) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');

  const getPeriodData = (period: Period) => {
    let start: Date, end: Date;
    
    switch (period) {
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'year':
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
        break;
    }

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });
  };

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'week':
        return `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'M/d', { locale: ja })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'M/d', { locale: ja })}`;
      case 'month':
        return format(currentDate, 'yyyy年M月', { locale: ja });
      case 'year':
        return format(currentDate, 'yyyy年', { locale: ja });
    }
  };

  const getShapeStats = (periodData: UnkoRecord[]) => {
    const shapeCounts = periodData.reduce((acc, record) => {
      acc[record.shape] = (acc[record.shape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = periodData.length;
    const normalRate = total > 0 ? ((shapeCounts.normal || 0) / total * 100).toFixed(1) : '0';
    const abnormalCount = total - (shapeCounts.normal || 0);

    return { shapeCounts, total, normalRate, abnormalCount };
  };

  const getDailyStats = (periodData: UnkoRecord[]) => {
    const dailyCounts: Record<string, number> = {};
    
    periodData.forEach(record => {
      dailyCounts[record.date] = (dailyCounts[record.date] || 0) + 1;
    });

    const daysWithRecords = Object.keys(dailyCounts).length;
    const averagePerDay = periodData.length > 0 ? (periodData.length / daysWithRecords).toFixed(1) : '0';
    const maxPerDay = Math.max(...Object.values(dailyCounts), 0);

    return { daysWithRecords, averagePerDay, maxPerDay };
  };

  const periodData = getPeriodData(selectedPeriod);
  const shapeStats = getShapeStats(periodData);
  const dailyStats = getDailyStats(periodData);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 期間選択 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">統計レポート</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
          {(['week', 'month', 'year'] as Period[]).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? '週間' : period === 'month' ? '月間' : '年間'}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          期間: {getPeriodLabel(selectedPeriod)}
        </div>
      </div>

      {/* 基本統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-500 w-5 h-5" />
            <h3 className="font-semibold text-gray-800">総記録数</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{shapeStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-500 w-5 h-5" />
            <h3 className="font-semibold text-gray-800">異常記録</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{shapeStats.abnormalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="text-green-500 w-5 h-5" />
            <h3 className="font-semibold text-gray-800">正常率</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{shapeStats.normalRate}%</p>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 形状別統計 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">形状別統計</h3>
          <div className="space-y-3">
            {[
              { key: 'normal', label: '💩 普通', color: 'text-green-600' },
              { key: 'hard', label: '🪨 固い', color: 'text-yellow-600' },
              { key: 'soft', label: '🍦 柔らかい', color: 'text-orange-600' },
              { key: 'watery', label: '💧 水様', color: 'text-red-600' }
            ].map(({ key, label, color }) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm">{label}</span>
                <span className={`font-semibold ${color}`}>
                  {shapeStats.shapeCounts[key] || 0}回
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 日別統計 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">日別統計</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">記録日数</span>
              <span className="font-semibold text-blue-600">{dailyStats.daysWithRecords}日</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">1日平均</span>
              <span className="font-semibold text-green-600">{dailyStats.averagePerDay}回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">1日最大</span>
              <span className="font-semibold text-orange-600">{dailyStats.maxPerDay}回</span>
            </div>
          </div>
        </div>
      </div>

      {/* 健康アドバイス */}
      {periodData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">健康アドバイス</h3>
          <div className="text-sm text-gray-700 space-y-2">
            {parseFloat(shapeStats.normalRate) >= 70 ? (
              <p>✅ 形状が良好です！健康的な排便パターンを維持できています。</p>
            ) : (
              <p>⚠️ 形状に変化があります。水分摂取や食事内容を見直してみてください。</p>
            )}
            
            {dailyStats.daysWithRecords >= 5 ? (
              <p>✅ 記録頻度が良好です。継続的な健康管理ができています。</p>
            ) : (
              <p>💡 記録頻度を上げると、より詳細な健康分析ができます。</p>
            )}
            
            {parseFloat(shapeStats.normalRate) < 50 && (
              <p>🚨 異常な形状が多く見られます。体調管理に注意し、必要に応じて医師に相談してください。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats; 