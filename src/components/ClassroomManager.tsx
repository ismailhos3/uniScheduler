import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, School, Users, Monitor, Building } from 'lucide-react';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';


export const ClassroomManager: React.FC = () => {
    const classrooms = useStore((state) => state.classrooms);
    const addClassroom = useStore((state) => state.addClassroom);
    const removeClassroom = useStore((state) => state.removeClassroom);
    const updateClassroom = useStore((state) => state.updateClassroom);

    const [newName, setNewName] = useState('');
    const [newCapacity, setNewCapacity] = useState('50');
    const [newType, setNewType] = useState<'Classroom' | 'ComputerLab' | 'Office' | 'Online'>('Classroom');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editCapacity, setEditCapacity] = useState('');
    const [editType, setEditType] = useState<'Classroom' | 'ComputerLab' | 'Office' | 'Online'>('Classroom');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newCapacity) {
            addClassroom({
                id: uuidv4(),
                name: newName,
                capacity: (newType === 'Online' || newType === 'Office') ? 9999 : parseInt(newCapacity),
                type: newType
            });
            setNewName('');
            setNewCapacity('50');
            setNewType('Classroom');
        }
    };

    const startEditing = (id: string, currentName: string, currentCapacity: number, currentType: 'Classroom' | 'ComputerLab' | 'Office' | 'Online') => {
        setEditingId(id);
        setEditName(currentName);
        setEditCapacity(currentCapacity.toString());
        setEditType(currentType);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditCapacity('');
        setEditType('Classroom');
    };

    const saveEditing = (id: string) => {
        if (editName && editCapacity) {
            updateClassroom(id, {
                name: editName,
                capacity: (editType === 'Online' || editType === 'Office') ? 9999 : parseInt(editCapacity),
                type: editType
            });
            setEditingId(null);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ComputerLab': return <Monitor className="w-4 h-4 text-purple-600" />;
            case 'Office': return <Building className="w-4 h-4 text-orange-600" />;
            case 'Online': return <Users className="w-4 h-4 text-blue-600" />;
            default: return <School className="w-4 h-4 text-indigo-600" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ComputerLab': return 'Bilgisayar Lab';
            case 'Office': return 'Ofis';
            case 'Online': return 'Online';
            default: return 'Derslik';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <School className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Derslik Yönetimi</h2>
                            <p className="text-sm text-slate-500">Yeni derslik, laboratuvar veya ofis ekleyin ve düzenleyin.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const testClassrooms = [
                                { id: uuidv4(), name: 'G-454', capacity: 50, type: 'Classroom' as const },
                                { id: uuidv4(), name: 'G-Z54', capacity: 60, type: 'Classroom' as const },
                                { id: uuidv4(), name: 'E-103', capacity: 40, type: 'Classroom' as const },
                                { id: uuidv4(), name: 'G-154', capacity: 55, type: 'Classroom' as const },
                                { id: uuidv4(), name: 'Online', capacity: 999, type: 'Online' as const },
                                { id: uuidv4(), name: 'Ofis', capacity: 10, type: 'Office' as const },
                            ];
                            testClassrooms.forEach(c => addClassroom(c));
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
                    >
                        Test Verisi Yükle
                    </button>
                </div>

                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Derslik Adı</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
                            placeholder="Örn: 101, Lab-A"
                            required
                        />
                    </div>
                    <div className="w-full md:w-40">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipi</label>
                        <div className="relative">
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as any)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 appearance-none"
                            >
                                <option value="Classroom">Derslik</option>
                                <option value="ComputerLab">Bilgisayar Lab</option>
                                <option value="Office">Ofis</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Kapasite</label>
                        {newType !== 'Online' && newType !== 'Office' && (
                            <input
                                type="number"
                                value={newCapacity}
                                onChange={(e) => setNewCapacity(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                                min="1"
                                required
                            />
                        )}
                        {(newType === 'Online' || newType === 'Office') && (
                            <div className="flex items-center h-[42px] px-4 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-sm italic">
                                Sınırsız
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 font-semibold h-[42px]"
                    >
                        <Plus className="w-5 h-5" />
                        Ekle
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Mevcut Derslikler
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{classrooms.length}</span>
                    </h2>
                </div>

                {classrooms.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <School className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">Henüz derslik eklenmemiş.</p>
                        <p className="text-sm">Yukarıdaki formu kullanarak yeni derslikler ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4 pl-6">Derslik Adı</th>
                                <th className="p-4">Tipi</th>
                                <th className="p-4">Kapasite</th>
                                <th className="p-4 pr-6 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classrooms.map((room) => (
                                <tr key={room.id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 pl-6 font-medium text-slate-900">
                                        {editingId === room.id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                autoFocus
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md ring-2 ring-indigo-500/20 outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
                                                {room.name}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {editingId === room.id ? (
                                            <select
                                                value={editType}
                                                onChange={(e) => setEditType(e.target.value as any)}
                                                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md outline-none"
                                            >
                                                <option value="Classroom">Derslik</option>
                                                <option value="ComputerLab">Bilgisayar Lab</option>
                                                <option value="Office">Ofis</option>
                                                <option value="Online">Online</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 w-fit text-sm text-slate-600 shadow-sm">
                                                {getTypeIcon(room.type)}
                                                <span>{getTypeLabel(room.type)}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {editingId === room.id ? (
                                            <input
                                                type="number"
                                                value={editCapacity}
                                                onChange={(e) => setEditCapacity(e.target.value)}
                                                className="w-24 px-3 py-1.5 border border-indigo-300 rounded-md outline-none"
                                                disabled={editType === 'Online' || editType === 'Office'}
                                            />
                                        ) : (
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-sm font-medium",
                                                (room.type === 'Online' || room.type === 'Office')
                                                    ? "bg-slate-100 text-slate-500"
                                                    : "bg-indigo-50 text-indigo-700"
                                            )}>
                                                {(room.type === 'Online' || room.type === 'Office') ? '∞' : `${room.capacity}`}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        {editingId === room.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => saveEditing(room.id)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                                                    title="Kaydet"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                                    title="İptal"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(room.id, room.name, room.capacity, room.type)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeClassroom(room.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
