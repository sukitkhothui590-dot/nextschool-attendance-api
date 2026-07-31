import { StudentsTable } from '@/features/students/students-table';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search and review student enrollment status.
        </p>
      </div>
      <StudentsTable />
    </div>
  );
}
