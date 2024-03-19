import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import "bulma/css/bulma.min.css";
import "./index.css";
// import { stat } from "fs";

export default function Home() {
  const [positions, setPositions] = useState([]);
  const [freeBikes, _setFreeBikes] = useState({});
  useEffect(() => {
    getData();
    setInterval(() => {
      getData();
    }, 10000);
  }, []);


  // const currentDate = new Date();
  // const thirtySecondsAgo = new Date(currentDate.getTime() - 30000);
  // console.log(isRecentlyUpdated(thirtySecondsAgo.toISOString()));

  useEffect(() => {
    const iframe = document.querySelector("iframe");
    iframe?.remove();
  }, [positions]);

  function createUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  async function getData() {
    let bikes = [];
    try {
      const response = await fetch("http://api.citybik.es/v2/networks/");
      const networks = await response.json();
      const usNetworks = networks.networks
        .filter((network) => network.location.country === "US")
        .slice(0, 20);
      const api = "http://api.citybik.es";
      const fetchPromises = usNetworks.map((network) => {
        if (network.id !== "boulder") return;
        return fetch(api + network.href)
          .then((response) => response.json())
          .then((data) => {
            const stations = data.network.stations;
            for (let j = 0; j < stations.length; j++) {
              const station = stations[j];
              let count = "noChange";
              if (freeBikes[station.name]) {
                if (station.free_bikes > freeBikes[station.name]) {
                  count = "increase"
                }
                if (station.free_bikes < freeBikes[station.name]) {
                  count = "decrease"
                }
              }
              freeBikes[station.name] = station.free_bikes;
              if(count === "increase" || count === "decrease") {
                console.log(count);
             }              bikes.push({
                name: station.name,
                count: count,
                location: { lat: station.latitude, lon: station.longitude },
                emptySlots: station.empty_slots,
                availableBikes: station.free_bikes,
                timestamp: stations[j].timestamp,
                uuid: createUUID(),
              });
            }
          });
      });
      await Promise.all(fetchPromises);
      setPositions(bikes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <div>
      <section className="hero has-background-info is-align-items-center">
        <div className="hero-body">
          <p className="title has-text-light">Spokes People</p>
        </div>
      </section>

      <div className="container">
        <div className="title is-parent">
          <article className="title is-child notification is-info-light">
            <div className="content">
              <p className="title ">Find bikes near you!</p>
              <div className="container">
                {" "}
                <MapView positions={positions} />
              </div>
            </div>
          </article>
        </div>
      </div>
      <footer className="footer has-background-info">
        <div className="content has-text-centered has-text-light">
          <p>
            CSS by
            <strong className="has-text-light"> Bulma</strong> site by{" "}
            <a
              className="has-text-primary"
              href="https://github.com/bward3/spokes-people"
            >
              {" "}
              Group 4-Project 3
            </a>
            . July 2022.
          </p>
        </div>
      </footer>
    </div>
  );
}
