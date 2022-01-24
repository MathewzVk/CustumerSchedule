import React, { useEffect, useState, useCallback } from "react";
import "../App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import axios from "axios";

function Barchart() {
  const [chartData, setChartData] = useState({});
  const [itemScheduled, setItemScheduled] = useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeChart, setTimeChart] = React.useState([]);

  const chart = useCallback(() => {
    let scheduleTimeArray = [];
    let itemSchedule = [];
    let itemDate = [];
    let scheduleTime = [];
    let itemScheduleDict = {};

    axios
      .get("https://cors-anywhere.herokuapp.com/https://jsonkeeper.com/b/HU8U")
      .then((res) => {
        console.log(res);
        //iterate through the data and push the item_date into the arrays
        res.data.forEach((item) => {
          itemDate.push(item.item_date);
        });
        //select schedule_time according to itemDate array
        for (let i = 0; i < itemDate.length; i++) {
          scheduleTime.push(res.data[i].schedule_time);
        }
        //combine the itemDate and scheduleTime arrays to a dictionary
        for (let i = 0; i < itemDate.length; i++) {
          itemSchedule.push({
            itemDate: itemDate[i],
            scheduleTime: scheduleTime[i],
          });
        }
        //create dictionary with itemDate as key and scheduleTime as value array
        for (let i = 0; i < itemSchedule.length; i++) {
          if (itemScheduleDict[itemSchedule[i].itemDate]) {
            itemScheduleDict[itemSchedule[i].itemDate].push(
              itemSchedule[i].scheduleTime
            );
          } else {
            itemScheduleDict[itemSchedule[i].itemDate] = [
              itemSchedule[i].scheduleTime,
            ];
          }
        }
        //store the array values of the scheduleTime array into a new array from the dictionary
        for (let key in itemScheduleDict) {
          if (key === itemScheduled) {
            scheduleTimeArray.push(itemScheduleDict[itemScheduled]);
          }
        }
        //seperate date and time from scheduleTimeArray and store them into two seperate arrays
        let dateArray = [];
        let timeArray = [];
        for (let i = 0; i < scheduleTimeArray.length; i++) {
          for (let j = 0; j < scheduleTimeArray[i].length; j++) {
            let date = scheduleTimeArray[i][j].slice(0, 10);
            let time = scheduleTimeArray[i][j].slice(11, 16);
            dateArray.push(date);
            timeArray.push(time);
          }
        }
        //create a dictionary with date as key and time as value array
        let dateTimeDict = {};
        for (let i = 0; i < dateArray.length; i++) {
          if (dateTimeDict[dateArray[i]]) {
            dateTimeDict[dateArray[i]].push(timeArray[i]);
          } else {
            dateTimeDict[dateArray[i]] = [timeArray[i]];
          }
        }
        //count the same string in dateArray and store to a dictionary
        let dateCountDict = {};
        for (let i = 0; i < dateArray.length; i++) {
          if (dateCountDict[dateArray[i]]) {
            dateCountDict[dateArray[i]] += 1;
          } else {
            dateCountDict[dateArray[i]] = 1;
          }
        }
        //select keys from the dateCountDict dictionary and store to a new array
        let labelKeys = [];
        for (let key in dateCountDict) {
          labelKeys.push(key);
        }
        //select values from the dateCountDict dictionary and store to a new array
        let labelValues = [];
        for (let key in dateCountDict) {
          labelValues.push(dateCountDict[key]);
        }
        //modify dateTimeDict to include the count of the values in the dictionary
        let dateTimeDictWithCount = {};
        for (let i = 0; i < labelKeys.length; i++) {
          dateTimeDictWithCount[labelKeys[i]] = {
            date: labelKeys[i],
            time: dateTimeDict[labelKeys[i]],
            count: labelValues[i],
          };
        }
        setChartData(dateTimeDictWithCount);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [itemScheduled]);

  useEffect(() => {
    chart();
  }, [chart, itemScheduled]);

  //create a json format data for the from the dictionary chartData
  let data = [];
  for (let key in chartData) {
    data.push({
      date: chartData[key].date,
      time: chartData[key].time,
      count: chartData[key].count,
    });
  }
  const getTime = (e) => {
    setIsLoading(true);
    console.log(e.date);
    //store the time array from the chartData dictionary into a new array
    let timeArray = [];
    for (let key in chartData) {
      if (key === e.date) {
        timeArray = chartData[key].time;
      }
    }
    //take count of the each element in the timeArray
    let timeCount = {};
    for (let i = 0; i < timeArray.length; i++) {
      if (timeCount[timeArray[i]]) {
        timeCount[timeArray[i]] += 1;
      } else {
        timeCount[timeArray[i]] = 1;
      }
    }
    //convert the timeCount dictionary to a json format
    let timeCountJson = [];
    for (let key in timeCount) {
      timeCountJson.push({
        time: key,
        count: timeCount[key],
      });
    }
    //set the timeChart data to the timeCountJson
    setTimeChart(timeCountJson);
  };
  console.log(isLoading);
  return (
    <div className="text">
      <label>Select the date: </label>
      <input
        className="input-date"
        type="date"
        value={itemScheduled}
        onChange={(e) => setItemScheduled(e.target.value)}
      />
      <div className="chart">
        {!isLoading ? (
          <BarChart width={1250} height={600} data={data}>
            <XAxis dataKey="date" stroke="#0a0a0a" />
            <YAxis allowDecimals={false} />
            <Tooltip
              wrapperStyle={{ width: 150, backgroundColor: "#2cbed1" }}
            />
            <Legend
              width={100}
              wrapperStyle={{
                top: 40,
                right: 40,
                backgroundColor: "#f5f5f5",
                border: "1px solid #d5d5d5",
                borderRadius: 3,
                lineHeight: "40px",
              }}
            />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar
              dataKey="count"
              fill="#439da8"
              barSize={30}
              onClick={getTime}
            />
          </BarChart>
        ) : (
          <div className="chart">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsLoading(false)}
            >
              Close
            </button>
            <BarChart width={1250} height={600} data={timeChart}>
              <XAxis dataKey="time" stroke="#0a0a0a" />
              <YAxis allowDecimals={false} />
              <Tooltip
                wrapperStyle={{ width: 150, backgroundColor: "#2cbed1" }}
              />
              <Legend
                width={100}
                wrapperStyle={{
                  top: 40,
                  right: 40,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #d5d5d5",
                  borderRadius: 3,
                  lineHeight: "40px",
                }}
              />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <Bar dataKey="count" fill="#439da8" barSize={30} />
            </BarChart>
          </div>
        )}
      </div>
    </div>
  );
}

export default Barchart;
