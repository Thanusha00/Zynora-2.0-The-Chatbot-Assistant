"use client";

import { useEffect, useState } from "react";

export default function MonitoringDashboard() {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("zynora_token");
    Promise.all([
      fetch("http://localhost:5000/api/admin/metrics", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("http://localhost:5000/api/admin/logs", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([metrics, logData]) => {
      setData(metrics.metrics);
      setLogs(logData.logs || []);
    });
  }, []);

  if (!data) return <main style={{padding:30}}>Loading monitoring data...</main>;

  const cards = [
    ["Total Conversations", data.totalConversations],
    ["Total Questions", data.totalQuestions],
    ["Successful Answers", data.successfulAnswers],
    ["No-Answer Responses", data.noAnswerResponses],
    ["Avg Response Time", `${data.averageResponseTimeMs} ms`],
    ["Error Count", data.errorCount]
  ];

  return (
    <main style={{padding:30,fontFamily:"Arial"}}>
      <h1>Zynora 2.0 Monitoring Dashboard</h1>
      <p>AI response quality, system health and production logs</p>

      <section style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {cards.map(([label,value]) => (
          <div key={label as string} style={{padding:20,border:"1px solid #ddd",borderRadius:10}}>
            <small>{label}</small>
            <h2>{value}</h2>
          </div>
        ))}
      </section>

      <h2>Daily Questions</h2>
      <ul>{data.dailyQuestions.map((d:any) => <li key={String(d.date)}>{String(d.date)} — {d.questions}</li>)}</ul>

      <h2>Production Logging & Error Tracking</h2>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th>Trace ID</th><th>Time</th><th>User</th><th>Action / Module</th><th>Status</th></tr></thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.trace_id}</td>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>{log.user_id || "-"}</td>
              <td>{log.action} / {log.module}</td>
              <td>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
