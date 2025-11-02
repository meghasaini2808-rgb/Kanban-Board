import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Clock, User, Users, Calendar, Check, Tag, AlertCircle, Palette } from 'lucide-react';

const TaskFlowBoard = () => {
  const [boards, setBoards] = useState({
    todo: { title: 'To Do', tasks: [], color: 'bg-blue-500' },
    inProgress: { title: 'In Progress', tasks: [], color: 'bg-yellow-500' },
    done: { title: 'Done', tasks: [], color: 'bg-green-500' }
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [theme, setTheme] = useState('default');
  const [showAddTask, setShowAddTask] = useState(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    tags: []
  });
  const [users, setUsers] = useState([
    { id: '1', name: 'You', color: 'bg-blue-500', online: true },
    { id: '2', name: 'Alice Chen', color: 'bg-purple-500', online: true },
    { id: '3', name: 'Bob Kumar', color: 'bg-pink-500', online: false },
    { id: '4', name: 'Carol Smith', color: 'bg-indigo-500', online: true }
  ]);
  const [activeUsers, setActiveUsers] = useState(['1', '2', '4']);
  const [editingTask, setEditingTask] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const themes = {
    default: { 
      name: 'Ocean Blue',
      icon: '🌊',
      bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50', 
      card: 'bg-white',
      preview: 'from-blue-400 to-indigo-500'
    },
    dark: { 
      name: 'Dark Mode',
      icon: '🌙',
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900', 
      card: 'bg-gray-800',
      preview: 'from-gray-700 to-gray-900'
    },
    midnight: { 
      name: 'Midnight Purple',
      icon: '🌃',
      bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900', 
      card: 'bg-indigo-800',
      preview: 'from-indigo-600 to-purple-700'
    },
    sunrise: { 
      name: 'Sunrise',
      icon: '🌅',
      bg: 'bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100', 
      card: 'bg-white',
      preview: 'from-rose-400 to-orange-500'
    },
    nature: { 
      name: 'Forest Green',
      icon: '🌿',
      bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100', 
      card: 'bg-white',
      preview: 'from-emerald-400 to-teal-500'
    },
    lavender: { 
      name: 'Lavender Dreams',
      icon: '💜',
      bg: 'bg-gradient-to-br from-purple-100 via-pink-50 to-fuchsia-100', 
      card: 'bg-white',
      preview: 'from-purple-400 to-pink-500'
    },
    cherry: { 
      name: 'Cherry Blossom',
      icon: '🌸',
      bg: 'bg-gradient-to-br from-pink-100 via-rose-50 to-red-100', 
      card: 'bg-white',
      preview: 'from-pink-400 to-rose-500'
    },
    cosmic: { 
      name: 'Cosmic',
      icon: '✨',
      bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900', 
      card: 'bg-slate-800',
      preview: 'from-purple-600 to-slate-800'
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300'
  };

  // Load board state from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [boardData, themeData] = await Promise.all([
          window.storage.get('taskflow-boards').catch(() => null),
          window.storage.get('taskflow-theme').catch(() => null)
        ]);

        if (boardData?.value) {
          setBoards(JSON.parse(boardData.value));
        }
        if (themeData?.value) {
          setTheme(JSON.parse(themeData.value));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Save board state
  useEffect(() => {
    if (boards.todo.tasks.length > 0 || boards.inProgress.tasks.length > 0 || boards.done.tasks.length > 0) {
      window.storage.set('taskflow-boards', JSON.stringify(boards)).catch(console.error);
    }
  }, [boards]);

  // Save theme
  useEffect(() => {
    window.storage.set('taskflow-theme', JSON.stringify(theme)).catch(console.error);
  }, [theme]);

  // Simulate real-time collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const allUserIds = users.map(u => u.id);
        const online = users.filter(u => u.online).map(u => u.id);
        const shouldChange = Math.random() > 0.7;
        if (!shouldChange) return prev;
        
        const newActive = online.filter(() => Math.random() > 0.3);
        return newActive.length > 0 ? newActive : [users[0].id];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [users]);

  const handleDragStart = (task, columnId) => {
    setDraggedTask(task);
    setDraggedFrom(columnId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (columnId) => {
    if (!draggedTask || !draggedFrom) return;

    if (draggedFrom === columnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    const newBoards = { ...boards };
    newBoards[draggedFrom].tasks = newBoards[draggedFrom].tasks.filter(
      t => t.id !== draggedTask.id
    );
    newBoards[columnId].tasks.push({
      ...draggedTask,
      movedAt: new Date().toISOString()
    });

    setBoards(newBoards);
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const addTask = (columnId) => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString(),
      assignee: newTask.assignee || users[0].name
    };

    setBoards(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, task]
      }
    }));

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      tags: []
    });
    setShowAddTask(null);
  };

  const deleteTask = (columnId, taskId) => {
    setBoards(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: prev[columnId].tasks.filter(t => t.id !== taskId)
      }
    }));
  };

  const updateTask = (columnId, taskId, updates) => {
    setBoards(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: prev[columnId].tasks.map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        )
      }
    }));
    setEditingTask(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const exportToCalendar = (task) => {
    if (!task.dueDate) {
      alert('This task has no due date set!');
      return;
    }
    
    const start = new Date(task.dueDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&details=${encodeURIComponent(task.description || '')}&dates=${formatDate(start)}/${formatDate(end)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const isDarkTheme = theme === 'dark' || theme === 'midnight' || theme === 'cosmic';
  const currentTheme = themes[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} p-4 md:p-8 transition-all duration-700`}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className={`${currentTheme.card} ${isDarkTheme ? 'text-white' : 'text-gray-900'} rounded-2xl shadow-2xl p-6 transition-all duration-300 backdrop-blur-sm`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow Board
              </h1>
              <p className={`text-sm mt-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                Organize your projects with drag-and-drop • {currentTheme.icon} {currentTheme.name}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Active Users */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {users.filter(u => activeUsers.includes(u.id)).map(user => (
                    <div
                      key={user.id}
                      className={`${user.color} w-10 h-10 rounded-full border-3 border-white flex items-center justify-center text-white text-sm font-bold relative hover:scale-110 transition-transform cursor-pointer`}
                      title={user.name}
                    >
                      {user.name.charAt(0)}
                      {user.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowCollabModal(true)}
                  className={`p-2.5 rounded-xl ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all`}
                  title="Manage collaborators"
                >
                  <Users size={22} />
                </button>
              </div>

              {/* Theme Selector Button */}
              <button
                onClick={() => setShowThemeModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-200'} transition-all shadow-sm`}
              >
                <Palette size={20} />
                <span className="hidden sm:inline text-sm font-medium">Themes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(boards).map(([columnId, column]) => (
          <div
            key={columnId}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(columnId)}
            className={`${currentTheme.card} ${isDarkTheme ? 'text-white' : 'text-gray-900'} rounded-2xl shadow-xl p-5 transition-all duration-300 min-h-[500px] flex flex-col backdrop-blur-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-opacity-20 border-gray-400">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${column.color} shadow-lg`}></div>
                <h2 className="text-xl font-bold">{column.title}</h2>
                <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {column.tasks.length}
                </span>
              </div>
              <button
                onClick={() => setShowAddTask(columnId)}
                className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all hover:scale-110`}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask === columnId && (
              <div className={`mb-4 p-4 rounded-xl ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} border-2 border-dashed ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} animate-scale-in`}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg mb-2 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg mb-2 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows="2"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className={`px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className={`flex-1 px-3 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Tag size={16} />
                  </button>
                </div>
                {newTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTask.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-blue-600">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => addTask(columnId)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(null);
                      setNewTask({
                        title: '',
                        description: '',
                        priority: 'medium',
                        dueDate: '',
                        assignee: '',
                        tags: []
                      });
                    }}
                    className={`px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'} transition-all font-medium`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, columnId)}
                  className={`${isDarkTheme ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg p-4 cursor-move hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${
                    task.priority === 'high' ? 'border-red-500' :
                    task.priority === 'medium' ? 'border-yellow-500' :
                    'border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold flex-1">{task.title}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingTask(task.id === editingTask ? null : task.id)}
                        className={`p-1 rounded ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-all`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTask(columnId, task.id)}
                        className={`p-1 rounded ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-all text-red-500`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className={`text-sm mb-3 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority.toUpperCase()}
                    </span>
                    {task.dueDate && (
                      <button
                        onClick={() => exportToCalendar(task)}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-all"
                        title="Add to Google Calendar"
                      >
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </button>
                    )}
                  </div>

                  {task.assignee && (
                    <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${isDarkTheme ? 'border-gray-600' : 'border-gray-200'}`}>
                      <User size={14} />
                      <span className="text-xs">{task.assignee}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowThemeModal(false)}></div>
          <div className={`relative ${currentTheme.card} ${isDarkTheme ? 'text-white' : 'text-gray-900'} rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-scale-in`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">Choose Your Theme</h3>
                <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  Personalize your workspace
                </p>
              </div>
              <button onClick={() => setShowThemeModal(false)} className={`p-2 rounded-lg ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all`}>
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(themes).map(([key, themeData]) => (
                <button
                  key={key}
                  onClick={() => {
                    setTheme(key);
                    setShowThemeModal(false);
                  }}
                  className={`group relative overflow-hidden rounded-xl transition-all ${
                    theme === key 
                      ? 'ring-4 ring-blue-500 scale-105' 
                      : 'hover:scale-105'
                  }`}
                >
                  <div className={`h-32 bg-gradient-to-br ${themeData.preview} flex flex-col items-center justify-center text-white font-bold p-4`}>
                    <span className="text-4xl mb-2">{themeData.icon}</span>
                    <span className="text-sm text-center">{themeData.name}</span>
                  </div>
                  {theme === key && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowCollabModal(false)}></div>
          <div className={`relative ${currentTheme.card} ${isDarkTheme ? 'text-white' : 'text-gray-900'} rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Team Members</h3>
              <button onClick={() => setShowCollabModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} transition-all hover:scale-102`}>
                  <div className="flex items-center gap-3">
                    <div className={`${user.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold relative`}>
                      {user.name.charAt(0)}
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.online ? '🟢 Online' : '⚫ Offline'}
                      </p>
                    </div>
                  </div>
                  {activeUsers.includes(user.id) && (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      <Check size={12} />
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-xl ${isDarkTheme ? 'bg-blue-900' : 'bg-blue-50'} flex items-start gap-2`}>
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600">
                Changes are synced in real-time. Team members can see updates instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default TaskFlowBoard;