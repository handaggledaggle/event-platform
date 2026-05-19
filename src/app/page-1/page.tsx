'use client';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import { getEvents, type DbEvent } from '@/app/actions/events';

const catColors: Record<string, string> = {
  '학교 행사': 'bg-blue-100 text-blue-700',
  워크숍: 'bg-purple-100 text-purple-700',
  대회: 'bg-yellow-100 text-yellow-700',
  특강: 'bg-green-100 text-green-700',
};

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: '신청 가능', color: 'text-green-600' },
  full: { label: '정원 마감', color: 'text-red-500' },
  closed: { label: '신청 종료', color: 'text-gray-400' },
};

export default function EventListPage() {
  const [allEvents, setAllEvents] = useState<DbEvent[]>([]);
  const [selected, setSelected] = useState<DbEvent | null>(null);
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(data => {
      setAllEvents(data);
      setLoading(false);
    });
  }, []);

  const categories = [
    '전체',
    ...Array.from(new Set(allEvents.map(e => e.category))),
  ];
  const filtered = allEvents.filter(e => {
    const matchCat = filter === '전체' || e.category === filter;
    const matchSearch =
      e.title.includes(search) || e.location.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">행사 목록</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="행사명 또는 장소 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(event => (
              <div
                key={event.id}
                onClick={() => setSelected(event)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${catColors[event.category] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {event.category}
                  </span>
                  <span
                    className={`text-sm font-medium ${statusMap[event.status]?.color || 'text-gray-400'}`}
                  >
                    {statusMap[event.status]?.label || event.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  📅 {event.date} {event.time}
                </p>
                <p className="text-sm text-gray-500 mb-3">📍 {event.location}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {event.registeredCount}/{event.capacity}명
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${catColors[selected.category] || 'bg-gray-100 text-gray-600'}`}
              >
                {selected.category}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selected.title}
            </h2>
            <div className="space-y-1.5 text-sm text-gray-600 mb-4">
              <p>
                📅 {selected.date} {selected.time}
              </p>
              <p>📍 {selected.location}</p>
              <p>
                👥 신청 현황: {selected.registeredCount} / {selected.capacity}명
              </p>
            </div>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              {selected.description}
            </p>
            <div className="flex gap-3">
              {selected.status === 'open' ? (
                <a
                  href="/page-3"
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-indigo-700 transition-colors"
                >
                  신청하기
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-200 text-gray-400 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
                >
                  {statusMap[selected.status]?.label || selected.status}
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
