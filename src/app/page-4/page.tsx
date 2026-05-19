'use client';
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type DbEvent,
} from '@/app/actions/events';

type FormData = {
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  description: string;
  category: string;
  status: string;
};

const emptyForm: FormData = {
  title: '',
  date: '',
  time: '',
  location: '',
  capacity: 50,
  description: '',
  category: '특강',
  status: 'open',
};

export default function AdminEventPage() {
  const [eventList, setEventList] = useState<DbEvent[]>([]);
  const [editing, setEditing] = useState<DbEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getEvents();
      setEventList(data);
      setLoading(false);
    })();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (ev: DbEvent) => {
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      capacity: ev.capacity,
      description: ev.description,
      category: ev.category,
      status: ev.status,
    });
    setEditing(ev);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 행사를 삭제하시겠습니까?')) return;
    await deleteEvent(id);
    setEventList(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const result = await updateEvent(editing.id, form);
      if (result.event) {
        setEventList(prev =>
          prev.map(ev => (ev.id === editing.id ? result.event! : ev))
        );
      }
    } else {
      const result = await createEvent(form);
      if (result.event) {
        setEventList(prev => [...prev, result.event!]);
      }
    }
    setOpen(false);
  };

  const statusLabel: Record<string, string> = {
    open: '신청 가능',
    full: '정원 마감',
    closed: '신청 종료',
  };
  const statusColor: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    full: 'bg-red-100 text-red-600',
    closed: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">행사 관리</h1>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              관리자 전용
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + 새 행사 등록
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">로딩 중...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    행사명
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    일시
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    장소
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    신청/정원
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    상태
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventList.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ev.title}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {ev.date} {ev.time}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {ev.location}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {ev.registeredCount}/{ev.capacity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[ev.status] || 'bg-gray-100 text-gray-500'}`}
                      >
                        {statusLabel[ev.status] || ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(ev)}
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="text-red-500 hover:underline text-xs font-medium"
                        >
                          삭제
                        </button>
                        <a
                          href="/page-5"
                          className="text-gray-500 hover:underline text-xs font-medium"
                        >
                          명단
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? '행사 수정' : '새 행사 등록'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  행사명
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e =>
                      setForm(f => ({ ...f, date: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시간
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e =>
                      setForm(f => ({ ...f, time: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  장소
                </label>
                <input
                  value={form.location}
                  onChange={e =>
                    setForm(f => ({ ...f, location: e.target.value }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    정원
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        capacity: Number(e.target.value),
                      }))
                    }
                    min={1}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={form.category}
                    onChange={e =>
                      setForm(f => ({ ...f, category: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['학교 행사', '워크숍', '대회', '특강'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={form.status}
                  onChange={e =>
                    setForm(f => ({ ...f, status: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="open">신청 가능</option>
                  <option value="full">정원 마감</option>
                  <option value="closed">신청 종료</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={e =>
                    setForm(f => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  {editing ? '수정 완료' : '등록하기'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
