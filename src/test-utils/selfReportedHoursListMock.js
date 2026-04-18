// Mock for SelfReportedHoursList component
export const SelfReportedHoursList = ({ records, onView, onEdit, onDelete }) => (
  <div data-testid="self-reported-hours-list">
    {records.map((record) => (
      <div key={record.id} data-testid={`hours-record-${record.id}`}>
        <span>{record.description}</span>
        <button onClick={() => onView(record.id)}>View</button>
        <button onClick={() => onEdit(record.id)}>Edit</button>
        <button onClick={() => onDelete(record.id)}>Delete</button>
      </div>
    ))}
    {records.length === 0 && <span>No records</span>}
  </div>
);
