const escapeCsvValue = (value) => {
  const safeValue = value == null ? '' : String(value);
  const escaped = safeValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const exportRegistrationsToCsv = (registrations, fileName = 'student-registrations.csv') => {
  if (!Array.isArray(registrations) || registrations.length === 0) {
    return;
  }

  const headers = [
    'Student Name',
    'Email',
    'Training Program',
    'Category',
    'Registration Date',
    'Attendance Status',
    'Completion Status'
  ];

  const rows = registrations.map((reg) => [
    reg.student?.name || 'N/A',
    reg.student?.email || 'N/A',
    reg.training?.trainingTitle || 'N/A',
    reg.training?.trainingCategory || 'N/A',
    reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A',
    reg.attendanceStatus || 'not_marked',
    reg.completionStatus || 'not_completed'
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printRegistrationsReport = () => {
  window.print();
};
