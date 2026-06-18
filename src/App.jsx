import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'react-todo-improved-tasks';

const initialTasks = [
  { id: 1, text: 'לסיים את משימת React', isCompleted: false },
  { id: 2, text: 'לבדוק שהוספה ומחיקה עובדות', isCompleted: true },
  { id: 3, text: 'להסביר את הקוד במילים שלי', isCompleted: false },
];

function loadTasksFromStorage() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  } catch (error) {
    console.error('Could not load tasks from localStorage', error);
    return initialTasks;
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [newTaskText, setNewTaskText] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.isCompleted);
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.isCompleted);
    }

    return tasks;
  }, [tasks, filter]);

  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const activeCount = tasks.length - completedCount;

  function handleAddTask(event) {
    event.preventDefault();

    const cleanText = newTaskText.trim();

    if (!cleanText) {
      setErrorMessage('אי אפשר להוסיף מטלה ריקה');
      return;
    }

    const taskToAdd = {
      id: Date.now(),
      text: cleanText,
      isCompleted: false,
    };

    setTasks((currentTasks) => [taskToAdd, ...currentTasks]);
    setNewTaskText('');
    setErrorMessage('');
  }

  function handleDeleteTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  function handleToggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  }

  function handleStartEditing(task) {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setErrorMessage('');
  }

  function handleCancelEditing() {
    setEditingTaskId(null);
    setEditingText('');
  }

  function handleSaveEditing(taskId) {
    const cleanText = editingText.trim();

    if (!cleanText) {
      setErrorMessage('אי אפשר לשמור מטלה ריקה');
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, text: cleanText } : task
      )
    );

    handleCancelEditing();
    setErrorMessage('');
  }

  function handleClearCompleted() {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.isCompleted));
  }

  return (
    <main className="app-container">
      <section className="todo-card">
        <header className="app-header">
          <p className="eyebrow">משימת React</p>
          <h1>רשימת מטלות</h1>
          <p className="subtitle">
            ניהול מטלות עם הוספה, מחיקה, סימון כבוצע, עריכה, סינון ושמירה מקומית.
          </p>
        </header>

        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTaskText}
            onChange={(event) => setNewTaskText(event.target.value)}
            placeholder="כתוב מטלה חדשה..."
            aria-label="טקסט מטלה חדשה"
          />
          <button type="submit">הוסף</button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="stats-row">
          <span>סה״כ: {tasks.length}</span>
          <span>פעילות: {activeCount}</span>
          <span>בוצעו: {completedCount}</span>
        </div>

        <div className="filter-row" aria-label="סינון מטלות">
          <button
            className={filter === 'all' ? 'active-filter' : ''}
            onClick={() => setFilter('all')}
            type="button"
          >
            הכל
          </button>
          <button
            className={filter === 'active' ? 'active-filter' : ''}
            onClick={() => setFilter('active')}
            type="button"
          >
            פעילות
          </button>
          <button
            className={filter === 'completed' ? 'active-filter' : ''}
            onClick={() => setFilter('completed')}
            type="button"
          >
            בוצעו
          </button>
        </div>

        <ul className="task-list">
          {filteredTasks.length === 0 ? (
            <li className="empty-state">אין מטלות להצגה בסינון הנוכחי.</li>
          ) : (
            filteredTasks.map((task) => (
              <li key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
                {editingTaskId === task.id ? (
                  <div className="edit-area">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSaveEditing(task.id);
                        }

                        if (event.key === 'Escape') {
                          handleCancelEditing();
                        }
                      }}
                      aria-label="עריכת מטלה"
                      autoFocus
                    />
                    <button type="button" onClick={() => handleSaveEditing(task.id)}>
                      שמור
                    </button>
                    <button type="button" className="secondary-button" onClick={handleCancelEditing}>
                      ביטול
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="task-content">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span>{task.text}</span>
                    </label>

                    <div className="task-actions">
                      <button type="button" className="secondary-button" onClick={() => handleStartEditing(task)}>
                        ערוך
                      </button>
                      <button type="button" className="danger-button" onClick={() => handleDeleteTask(task.id)}>
                        מחק
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

        <footer className="footer-actions">
          <button type="button" className="secondary-button" onClick={handleClearCompleted}>
            מחק מטלות שבוצעו
          </button>
        </footer>
      </section>
    </main>
  );
}

export default App;
