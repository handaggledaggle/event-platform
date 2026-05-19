'use client';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import {
  getAllRegistrations,
  toggleAttendance,
  type RegWithEventAndUser,
} from '@/app/actions/registrations';

export default function AdminParticipantsPage() {
  const [apps, setApps] = useState<RegWithEventAndUser[]>([]);
  const [filterEvent, setFilterEvent] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAllRegistrations();
      setApps(data);
      setLoading(false);
    })();
  }, []);

  const eventOptions = Array.from(
    new Map(apps.map(a => [a.event.id, a.event.title])).entries()
  );

  const filtered = apps.filter(a => {
    const matchEvent = filterEvent === 'all' || a.event.id === filterEvent;
    const matchSearch =
      a.user.name.includes(search) || a.user.email.includes(search);
    return matchEvent && matchSearch;
  });

  const attendedCount = filtered.filter(a => a.attended).length;

  const handleToggle = async (id: string) => {
    await toggleAttendance(id);
    setApps(prev =>
      prev.map(a => (a.id === id ? { ...a, attended: !a.attended } : a))
    );
  };

  const formatDate = (d: Date | string) => {
    const s = d instanceof Date ? d.toISOString() : String(d);
    return s.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            신청자 명단 · 출석 관리
          </h1>
          <p className="text-xs text-indigo-600 font-medium mt-0.5">
            관리자 전용
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">전체 신청자</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {filtered.length}명
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">출석 완료</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {attendedCount}명
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">미출석</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">
              {filtered.length - attendedCount}명
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <select
            value={filterEvent}
            onChange={e => setFilterEvent(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 행사</option>
            {eventOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">로딩 중...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    이름
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    이메일
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    행사
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    신청일
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    출석
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(app => (
                  <tr
                    key={app.id}
                    className={`hover:bg-gray-50 transition-colors ${app.attended ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {app.user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {app.user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                      {app.event.title}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(app.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold transition-colors ${
                          app.attended
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {app.attended ? '✓' : '○'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
