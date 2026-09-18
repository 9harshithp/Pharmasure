import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { baseUrl } from "../App";

const ConsumedChart = () => {
  const [chartData, setChartData] = useState([]);
  const [medications, setMedications] = useState([]);
  const patientId = sessionStorage.getItem("pid");

  const expectedTimes = { Morning: 9, Afternoon: 14, Evening: 19 };

  useEffect(() => {
    if (patientId) fetchConsumedData();
  }, [patientId]);

  const fetchConsumedData = async () => {
    try {
      const res = await axios.get(`${baseUrl}/consumed/bypatient/${patientId}`);
      processData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const processData = (data) => {
    if (!data || data.length === 0) return;

    const meds = [...new Set(data.map((d) => d.medication.tableName))];
    setMedications(meds);

    data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    const pointsMap = {};

    data.forEach((item) => {
      const date = item.dateTime.split("T")[0];
      if (!pointsMap[date]) pointsMap[date] = { date };

      const medName = item.medication.tableName;
      const actualHour =
        new Date(item.dateTime).getHours() +
        new Date(item.dateTime).getMinutes() / 60;

      let bestTiming = null;
      let minDiff = Infinity;

      item.medication.timing.split(",").forEach((t) => {
        const time = t.trim();
        const diff = Math.abs(actualHour - expectedTimes[time]);
        if (diff < minDiff && diff <= 3) {
          bestTiming = time;
          minDiff = diff;
        }
      });

      if (bestTiming) {
        const key = `${medName} (${bestTiming})`;
        pointsMap[date][key] = actualHour;
      }
    });

    setChartData(Object.values(pointsMap));
  };

  const renderCustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const timing = dataKey.split("(")[1].replace(")", "").trim();
    const expected = expectedTimes[timing];
    const actual = payload[dataKey];
    if (actual === undefined) return null;

    const diff = actual - expected;
    let fill = "#32CD32";
    if (diff > 1 || diff < -1) fill = "#FF0000";
    else if (diff > 0.5 || diff < -0.5) fill = "#FFA500";

    return <circle cx={cx} cy={cy} r={6} fill={fill} stroke="#000" strokeWidth={1} />;
  };

  // ⭐ DYNAMIC CUSTOM LEGEND (Tablet names)
const CustomLegend = () => {
  const colors = ["#FFA500", "#1E90FF", "#32CD32", "#FF1493","#8A2BE2","#041b1bff","#FF4500","#2E8B57"];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "5px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {medications.map((med, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: colors[i % colors.length],
              display: "inline-block",
              marginRight: 5,
            }}
          ></span>
          {med}
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="container mt-4 px-2">
      <h5 className="text-center mb-3 fw-bold">Medication Consumption Chart</h5>

      {chartData.length > 0 ? (
        <div className="chart-wrapper" style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "320px", width: "100%", height: "50vh" }}>

            {/* Center Legend */}
            <CustomLegend />

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) =>
                    new Date(tick).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  type="number"
                  domain={[0, 24]}
                  ticks={[9, 14, 19]}
                  tickFormatter={(tick) => {
                    if (tick === 9) return "9 AM";
                    if (tick === 14) return "2 PM";
                    if (tick === 19) return "7 PM";
                    return `${tick}:00`;
                  }}
                  label={{
                    value: "Time of Consumption",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10 },
                  }}
                  tick={{ fontSize: 10 }}
                />

                <Tooltip
                  formatter={(value) =>
                    value
                      ? `${Math.floor(value)}:${Math.round((value % 1) * 60)
                          .toString()
                          .padStart(2, "0")}`
                      : ""
                  }
                  labelFormatter={(label) => `Date: ${label}`}
                />

                {/* Hidden default legend */}
                <Legend content={() => null} />

                {/* Lines */}
                {medications.map((med, index) =>
                  ["Morning", "Afternoon", "Evening"].map((time) => {
                    const key = `${med} (${time})`;
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={[
                          "#FFA500",
                          "#1E90FF",
                          "#32CD32",
                          "#FF1493",
                          "#8A2BE2",
                          "#041b1bff",
                          "#FF4500",
                          "#2E8B57",
                        ][index % 8]}
                        activeDot={renderCustomDot}
                        connectNulls={true}
                        strokeWidth={2}
                      />
                    );
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="text-center text-muted small">No consumption data available.</p>
      )}
    </div>
  );
};

export default ConsumedChart;
