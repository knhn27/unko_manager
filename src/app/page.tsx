"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  Smile,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Header from "./components/Header/Header";
import HealthMessage from "./components/HealthMessage/HealthMessage";
import Stats from "./components/Stats/Stats";
import AddRecordModal from "./components/AddRecordModal/AddRecordModal";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import { supabase } from "./lib/supabaseClient";
import {
  selectAllData,
  insertData,
  deleteData,
  updateData,
  deleteAllData,
  getUserProfile,
} from "./lib/supabaseFunction";

interface UnkoRecord {
  id: string;
  date: string;
  time: string;
  shape: "normal" | "hard" | "soft" | "watery";
  notes?: string;
}

export default function Home() {
  const [records, setRecords] = useState<UnkoRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [healthMessage, setHealthMessage] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // 認証状態の監視
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // データベースからデータを取得
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        // ユーザープロフィールを取得
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
        // 記録データを取得
        const data = await selectAllData();
        setRecords(data as UnkoRecord[]);
      };
      fetchData();
    }
  }, [user]);

  // 過去1週間のデータを分析して健康メッセージを生成
  useEffect(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    if (weekRecords.length === 0) {
      setHealthMessage(
        "今週はまだ記録がありません。健康管理のためにも記録を始めましょう！"
      );
      return;
    }

    const totalCount = weekRecords.length;
    const shapeCounts = weekRecords.reduce((acc, record) => {
      acc[record.shape] = (acc[record.shape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let message = "";
    if (totalCount >= 7) {
      message += "毎日記録できていますね！素晴らしいです。";
    } else if (totalCount >= 5) {
      message += "週5回以上記録できています。";
    } else {
      message += "記録回数が少なめです。";
    }

    if (shapeCounts.normal && shapeCounts.normal >= totalCount * 0.7) {
      message += " 形状も良好です！";
    } else if (shapeCounts.hard || shapeCounts.soft) {
      message +=
        " 形状に変化があります。水分摂取や食事内容を見直してみてください。";
    } else if (shapeCounts.watery) {
      message += " 下痢気味のようです。体調管理に気をつけてください。";
    }

    setHealthMessage(message);
  }, [records, currentDate]);

  // データ追加
  const addRecord = async (record: Omit<UnkoRecord, "id">) => {
    await insertData(
      record.date,
      record.time,
      record.shape,
      record.notes || ""
    );
    setShowAddModal(false);
    const fetchUnkoData = async () => {
      const data = await selectAllData();
      setRecords(data as UnkoRecord[]);
    };
    fetchUnkoData();
  };

  // データ削除
  const deleteRecord = async (id: string) => {
    await deleteData(id);
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode("week");
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "normal":
        return "💩";
      case "hard":
        return "🪨";
      case "soft":
        return "🍦";
      case "watery":
        return "💧";
      default:
        return "💩";
    }
  };

  const getShapeColor = (shape: string) => {
    switch (shape) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "hard":
        return "bg-yellow-100 text-yellow-800";
      case "soft":
        return "bg-orange-100 text-orange-800";
      case "watery":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 全データ削除
  const clearAllData = async () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      await deleteAllData();
      setRecords([]);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💩 うんこ管理アプリ
          </h1>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未ログイン時
  if (!user) {
    return authMode === "login" ? (
      <LoginForm
        onLoginSuccess={() => setAuthMode("login")}
        onSwitchToSignup={() => setAuthMode("signup")}
      />
    ) : (
      <SignupForm
        onSignupSuccess={() => setAuthMode("login")}
        onSwitchToLogin={() => setAuthMode("login")}
      />
    );
  }

  // ログイン済み - メインアプリ
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <Header />
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-gray-600 truncate">
              ようこそ、
              {userProfile?.name || user.user_metadata?.name || user.email}さん
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>

        {/* 健康メッセージ */}
        {healthMessage && <HealthMessage message={healthMessage} />}

        {/* カレンダー */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {viewMode === "week" ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedDate((prev) => subWeeks(prev, 1))
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">
                        {format(selectedDate, "yyyy年M月d日", { locale: ja })}
                        の週
                      </span>
                      <span className="sm:hidden">
                        {format(selectedDate, "M/d", { locale: ja })}の週
                      </span>
                    </h2>
                    <button
                      onClick={() =>
                        setSelectedDate((prev) => addWeeks(prev, 1))
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">
                        {format(currentDate, "yyyy年M月", { locale: ja })}
                      </span>
                      <span className="sm:hidden">
                        {format(currentDate, "M月", { locale: ja })}
                      </span>
                    </h2>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
              <div className="flex gap-2 text-sm">
                <button
                  onClick={toggleViewMode}
                  className="text-blue-600 hover:text-blue-800 underline touch-manipulation"
                >
                  {viewMode === "week" ? "月間表示" : "週間表示"}
                </button>
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setCurrentDate(new Date());
                    setViewMode("week");
                  }}
                  className="text-blue-600 hover:text-blue-800 underline touch-manipulation"
                >
                  今週に戻る
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm touch-manipulation"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">記録追加</span>
                <span className="sm:hidden">追加</span>
              </button>
              {records.length > 0 && (
                <button
                  onClick={clearAllData}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm touch-manipulation"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">全削除</span>
                  <span className="sm:hidden">削除</span>
                </button>
              )}
            </div>
          </div>

          {/* カレンダー表示 */}
          <div className="block sm:grid sm:grid-cols-7 sm:gap-2">
            {/* PC時は曜日ヘッダーを表示 */}
            <div className="hidden sm:contents">
              {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* モバイル時は縦並び、PC時はgrid */}
            <div className="flex flex-col gap-2 sm:contents">
              {(viewMode === "week" ? getWeekDays() : getMonthDays()).map(
                (day) => {
                  const dayRecords = records.filter(
                    (record) => record.date === format(day, "yyyy-MM-dd")
                  );
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth();
                  const isToday =
                    format(day, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  const isSelectedWeek =
                    viewMode === "week" &&
                    day.getMonth() === selectedDate.getMonth();
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border rounded-lg p-2 min-h-[60px] sm:min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation flex flex-col sm:block ${
                        viewMode === "month" && !isCurrentMonth
                          ? "bg-gray-50"
                          : ""
                      } ${isToday ? "border-blue-500 border-2" : ""} ${
                        viewMode === "week" && isSelectedWeek
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      {/* モバイル時は曜日名と日付を一緒に表示 */}
                      <div
                        className={`text-xs sm:text-sm mb-1 ${
                          viewMode === "month" && !isCurrentMonth
                            ? "text-gray-400"
                            : "text-gray-500"
                        } ${isToday ? "font-bold text-blue-600" : ""}`}
                      >
                        <span className="sm:hidden">
                          {format(day, "M/d (E)", { locale: ja })}
                        </span>
                        <span className="hidden sm:inline">
                          {format(day, "M/d")}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayRecords.map((record) => (
                          <div
                            key={record.id}
                            className={`text-xs px-2 py-1 rounded ${getShapeColor(
                              record.shape
                            )} relative group flex items-center justify-between`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-xs sm:text-sm">
                                {getShapeIcon(record.shape)}
                              </span>
                              <span className="text-xs">
                                {record.time.split(":").slice(0, 2).join(":")}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecord(record.id);
                              }}
                              className="ml-1 bg-red-500 text-white rounded-full w-3 h-3 sm:w-4 sm:h-4 text-xs opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity touch-manipulation flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <Stats records={records} currentDate={currentDate} />

        {/* 記録追加モーダル */}
        {showAddModal && (
          <AddRecordModal
            onAdd={addRecord}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
}
