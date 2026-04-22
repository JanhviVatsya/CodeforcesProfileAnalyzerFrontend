"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Home() {
  const [handle, setHandle] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicGraphData, setTopicGraphData] = useState([]);
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [compareData, setCompareData] = useState(null);

  const fetchAnalysis = async () => {
    if (!handle) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/profile/codeforces/${handle}`
      );

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  const fetchTopicAnalysis = async (topic) => {
  if (!handle || !topic) return;

  try {
    const res = await fetch(
      `http://localhost:8080/api/profile/topic-analysis?handle=${handle}&topic=${topic}`
    );

    const result = await res.json();

    // convert to chart format
    const formatted = Object.entries(result).map(([key, value]) => ({
      difficulty: key,
      count: value,
    }));

    setTopicGraphData(formatted);
  } catch (error) {
    console.error("Topic fetch error:", error);
  }
};

const fetchCompare = async () => {
  if (!user1 || !user2) return;

  try {
    const res = await fetch(
      `http://localhost:8080/api/profile/compare?user1=${user1}&user2=${user2}`
    );

    const result = await res.json();
    setCompareData(result);
  } catch (error) {
    console.error("Compare error:", error);
  }
};

  //  Convert difficultyStats → chart data
  const chartData = data
    ? Object.entries(data.difficultyStats).map(([key, value]) => ({
        difficulty: key,
        count: value,
      }))
    : [];

    const topicData = data
  ? Object.entries(data.topicStats)
      .sort((a, b) => b[1] - a[1]) // sort descending
      .slice(0, 10) // top 10
      .map(([key, value]) => ({
        topic: key,
        count: value,
      }))
  : [];

  const getChartData = (stats) =>
  Object.entries(stats).map(([key, value]) => ({
    name: key,
    count: value,
  }));

  const mergeDifficultyData = () => {
  if (!compareData) return [];

  const user1Stats = compareData.user1.difficultyStats;
  const user2Stats = compareData.user2.difficultyStats;

  const allKeys = new Set([
    ...Object.keys(user1Stats),
    ...Object.keys(user2Stats),
  ]);

  return Array.from(allKeys).map((key) => ({
    difficulty: key,
    user1: user1Stats[key] || 0,
    user2: user2Stats[key] || 0,
  }));
};

const mergeTopicData = () => {
  if (!compareData) return [];

  const user1Stats = compareData.user1.topicStats;
  const user2Stats = compareData.user2.topicStats;

  const allKeys = new Set([
    ...Object.keys(user1Stats),
    ...Object.keys(user2Stats),
  ]);

  return Array.from(allKeys)
    .map((key) => ({
      topic: key,
      user1: user1Stats[key] || 0,
      user2: user2Stats[key] || 0,
    }))
    .sort((a, b) => b.user1 + b.user2 - (a.user1 + a.user2)) // sort by total
    .slice(0, 10); // top 10 topics
};

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-10">
      <h1 className="text-3xl font-bold">Codeforces Analyzer</h1>

      <input
        type="text"
        placeholder="Enter Codeforces handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="border p-2 rounded w-64"
      />

      <button
        onClick={fetchAnalysis}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Analyze
      </button>

      {loading && <p>Loading...</p>}

      {/*  GRAPH */}
      {data && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Problems by Difficulty
          </h2>

          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="difficulty" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </div>
      )}

      {/*  TOPIC GRAPH */}
{data && (
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-4">
      Problems by Topic
    </h2>

    <BarChart width={600} height={300} data={topicData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="topic" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
    </BarChart>
  </div>
)}

<div className="mt-10 flex flex-col items-center gap-4">
  <h2 className="text-xl font-semibold">Topic Difficulty Analysis</h2>

  <select
    value={selectedTopic}
    onChange={(e) => {
      const topic = e.target.value;
      setSelectedTopic(topic);
      fetchTopicAnalysis(topic);
    }}
    className="border p-2 rounded text-black bg-white"
  >
    <option value="">Select Topic</option>

    {data &&
      Object.keys(data.topicStats).map((topic) => (
        <option key={topic} value={topic}>
          {topic}
        </option>
      ))}
  </select>
</div>

{topicGraphData.length > 0 && (
  <div className="mt-6">
    <BarChart width={600} height={300} data={topicGraphData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="difficulty" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
    </BarChart>
  </div>
)}

    <div className="mt-16 flex flex-col items-center gap-4">
  <h2 className="text-2xl font-bold">Compare Users</h2>

  <div className="flex gap-4">
    <input
      type="text"
      placeholder="User 1"
      value={user1}
      onChange={(e) => setUser1(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      type="text"
      placeholder="User 2"
      value={user2}
      onChange={(e) => setUser2(e.target.value)}
      className="border p-2 rounded"
    />
  </div>

  <button
    onClick={fetchCompare}
    className="bg-purple-500 text-white px-4 py-2 rounded"
  >
    Compare
  </button>
</div>

    {compareData && (
  <div className="mt-10">
    <h3 className="text-xl font-semibold mb-4">
      Difficulty Comparison
    </h3>

    <BarChart width={700} height={300} data={mergeDifficultyData()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="difficulty" />
      <YAxis />
      <Tooltip />

      <Bar
        dataKey="user1"
        fill="#3b82f6"
        name={compareData.user1.username}
      />

      <Bar
        dataKey="user2"
        fill="#8b5cf6"
        name={compareData.user2.username}
      />
    </BarChart>
  </div>
)}

{compareData && (
  <div className="mt-10">
    <h3 className="text-xl font-semibold mb-4">
      Topic Comparison
    </h3>

    <BarChart width={700} height={300} data={mergeTopicData()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="topic" />
      <YAxis />
      <Tooltip />

      <Bar
        dataKey="user1"
        fill="#3b82f6"
        name={compareData.user1.username}
      />

      <Bar
        dataKey="user2"
        fill="#8b5cf6"
        name={compareData.user2.username}
      />
    </BarChart>
  </div>
)}
    </div>
  );
}