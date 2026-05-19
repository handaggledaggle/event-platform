'use client';
import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import {
  getMyRegistrations,
  applyToEvent,
  cancelRegistration,
  type RegWithEvent,
} from '@/app/actions/registrations';
import { getEvents, type DbEvent } from '@/app/actions/events';

async function fetchData(): Promise<{ regs: RegWithEvent[]; evs: DbEvent[] }> {
  const [regs, evs] = await Promise.all([getMyRegistrations(), getEvents()]);
  return { regs, evs };
}

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<RegWithEvent[]>([]);
  const [openEvents, setOpenEvents] = useState<DbEvent[]>([]);
  const [applying, setApplying] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyError, setApplyError] = useState('');

  const refresh = useCallback(async () => {
    const { regs, evs } = await fetchData();
    setApps(regs);
    setOpenEvents(evs.filter(e => e.status === 'open'));
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchData().then(({ regs, evs }) => {
      if (cancelled) return;
      setApps(regs);
      setOpenEvents(evs.filter(e => e.status === 'open'));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleCancel = async (appId: string) => {
    const result = await cancelRegistration(appId);
    if (result.error) {
      alert(result.error);
    } else {
      setApps(prev => prev.filter(a => a.id !== appId));
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    const result = await applyToEvent(selectedEventId);
    if (result.error) {
      setApplyError(result.error);
    } else {
      setApplying(false);
      setSelectedEventId('');
      await refresh();
    }
  };

  const formatDate = (d: Date | string) => {
    const s = d instanceof Date ? d.toISOString() : String(d);
    return s.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">내 신청 내역</h1>
          <button
            onClick={() => {
              setApplying(true);
              setApplyError('');
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + 행사 신청
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">로딩 중...</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="mb-4">신청한 행사가 없습니다.</p>
            <a
              href="/page-1"
              className="text-indigo-600 font-medium hover:underline text-sm"
            >
              행사 목록 보기 →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {app.event.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    📅 {app.event.date} {app.event.time}
                  </p>
                  <p className="text-sm text-gray-500">
                    📍 {app.event.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    신청일: {formatDate(app.appliedAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      app.attended
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {app.attended ? '출석 완료' : '신청 완료'}
                  </span>
                  {!app.attended && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      신청 취소
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {applying && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setApplying(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">행사 신청</h2>
            {applyError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
                {applyError}
              </div>
            )}
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  행사 선택
                </label>
                <select
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">행사를 선택하세요</option>
                  {openEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  신청하기
                </button>
                <button
                  type="button"
                  onClick={() => setApplying(false)}
                  className="px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
