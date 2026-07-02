import { useTranslation } from 'react-i18next';
import { Navbar } from './components/Navbar';
import { SafeTable } from './components/SafeTable';

const mockData = [
  { id: '1', name: 'Smith, John', position: 'Data Scientist', level: 'Middle' },
  { id: '2', name: 'King, Paul', position: 'DevOps Engineer', level: 'Junior' },
  { id: '3', name: 'Morris, Lee', position: 'QA Engineer', level: 'Senior' },
];

function App() {
  useTranslation();

  return (
      <div className="min-vh-100 d-flex flex-column bg-body text-body">
        <Navbar />

        <main className="container flex-grow-1 py-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0">Список резюме</h2>
          </div>

          <SafeTable
              data={mockData}
              onView={(id) => alert(`Просмотр ID: ${id}`)}
              onEdit={(id) => alert(`Редактирование ID: ${id}`)}
              onDelete={(ids) => alert(`Удаление ID: ${ids.join(', ')}`)}
          />
        </main>
      </div>
  );
}

export default App;