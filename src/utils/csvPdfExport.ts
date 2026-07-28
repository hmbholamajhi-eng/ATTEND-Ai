import { AttendanceRecord, AttendanceStats, OverallStats, StudentProfile, Subject } from '../types';

/**
 * Downloads a string as a file in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports Subject Stats and Attendance summary to CSV
 */
export function exportAttendanceSummaryCSV(
  subjects: Subject[],
  subjectStats: AttendanceStats[],
  overall: OverallStats,
  profile: StudentProfile
) {
  let csv = `AttendAI Attendance Summary Report\n`;
  csv += `Student Name,${profile.name}\n`;
  csv += `Roll Number,${profile.rollNumber}\n`;
  csv += `Institution,${profile.college}\n`;
  csv += `Branch & Semester,${profile.branch} - ${profile.semester}\n`;
  csv += `Report Generated Date,${new Date().toLocaleDateString()}\n\n`;

  csv += `OVERALL SUMMARY\n`;
  csv += `Overall Attendance %,${overall.overallPercentage}%\n`;
  csv += `Target Goal %,${overall.targetPercentage}%\n`;
  csv += `Total Classes Conducted,${overall.totalEffective}\n`;
  csv += `Total Attended,${overall.totalPresent}\n`;
  csv += `Total Absent,${overall.totalAbsent}\n`;
  csv += `Total Cancelled,${overall.totalCancelled}\n`;
  csv += `Classes Needed for Goal,${overall.overallClassesNeeded}\n`;
  csv += `Safe Bunks Available,${overall.overallSafeBunks}\n\n`;

  csv += `SUBJECT WISE BREAKDOWN\n`;
  csv += `Subject Code,Subject Name,Faculty,Credits,Target %,Present,Absent,Cancelled,Extra,Total Evaluated,Attendance %,Status,Safe Bunks,Classes Needed\n`;

  for (const stats of subjectStats) {
    const sub = subjects.find((s) => s.id === stats.subjectId);
    csv += `"${stats.subjectCode}","${stats.subjectName}","${sub?.faculty || ''}",${sub?.credits || 0},${stats.targetPercentage}%,${stats.presentCount},${stats.absentCount},${stats.cancelledCount},${stats.extraCount},${stats.totalClasses},${stats.attendancePercentage}%,${stats.status.toUpperCase()},${stats.safeBunkCount},${stats.classesNeededForGoal}\n`;
  }

  downloadFile(csv, `AttendAI_Attendance_Report_${profile.rollNumber || 'Student'}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports raw attendance logs to CSV
 */
export function exportAttendanceLogsCSV(
  records: AttendanceRecord[],
  subjects: Subject[],
  profile: StudentProfile
) {
  let csv = `Date,Subject Code,Subject Name,Status,Note\n`;

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  for (const rec of sortedRecords) {
    const sub = subjects.find((s) => s.id === rec.subjectId);
    csv += `"${rec.date}","${sub?.code || ''}","${sub?.name || 'Unknown'}","${rec.status.toUpperCase()}","${rec.note || ''}"\n`;
  }

  downloadFile(csv, `AttendAI_Attendance_Logs_${profile.rollNumber || 'Student'}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generates an elegant printable HTML window for saving as PDF
 */
export function generatePrintablePDF(
  subjects: Subject[],
  subjectStats: AttendanceStats[],
  overall: OverallStats,
  profile: StudentProfile
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AttendAI - Official Attendance Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .profile-item { font-size: 13px; }
          .profile-item strong { color: #475569; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; text-align: center; }
          .card-value { font-size: 22px; font-weight: bold; color: #0284c7; }
          .card-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .badge-safe { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">AttendAI Academic Attendance Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <button class="no-print" onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        </div>

        <div class="profile-grid">
          <div class="profile-item"><strong>Student Name</strong>${profile.name}</div>
          <div class="profile-item"><strong>Roll / ID Number</strong>${profile.rollNumber}</div>
          <div class="profile-item"><strong>Institution</strong>${profile.college}</div>
          <div class="profile-item"><strong>Branch & Semester</strong>${profile.branch} (${profile.semester})</div>
        </div>

        <div class="stat-cards">
          <div class="card">
            <div class="card-value">${overall.overallPercentage}%</div>
            <div class="card-label">Overall Attendance</div>
          </div>
          <div class="card">
            <div class="card-value" style="color: #16a34a;">${overall.totalPresent}</div>
            <div class="card-label">Classes Attended</div>
          </div>
          <div class="card">
            <div class="card-value" style="color: #dc2626;">${overall.totalAbsent}</div>
            <div class="card-label">Classes Bunked/Missed</div>
          </div>
          <div class="card">
            <div class="card-value" style="color: #0284c7;">${overall.overallSafeBunks}</div>
            <div class="card-label">Safe Bunks Left</div>
          </div>
        </div>

        <h3 style="font-size: 16px; margin-bottom: 8px; color: #0f172a;">Subject Attendance Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Faculty</th>
              <th>Target %</th>
              <th>Present / Total</th>
              <th>Current %</th>
              <th>Status</th>
              <th>Safe Bunks</th>
              <th>Classes Needed</th>
            </tr>
          </thead>
          <tbody>
            ${subjectStats
              .map((s) => {
                const sub = subjects.find((x) => x.id === s.subjectId);
                const badgeClass = s.status === 'safe' ? 'badge-safe' : s.status === 'warning' ? 'badge-warning' : 'badge-danger';
                return `
                  <tr>
                    <td><strong>${s.subjectCode}</strong> - ${s.subjectName}</td>
                    <td>${sub?.faculty || '-'}</td>
                    <td>${s.targetPercentage}%</td>
                    <td>${s.presentCount} / ${s.totalClasses}</td>
                    <td><strong>${s.attendancePercentage}%</strong></td>
                    <td><span class="badge ${badgeClass}">${s.status}</span></td>
                    <td style="color: #16a34a; font-weight: 600;">${s.safeBunkCount}</td>
                    <td style="color: #dc2626; font-weight: 600;">${s.classesNeededForGoal}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          AttendAI • Smart Student Attendance Engine & Offline Math Calculator
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
