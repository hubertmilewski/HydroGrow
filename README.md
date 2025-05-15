# HydroGrow

HydroGrow is a mobile app built for a competition to monitor plant parameters and help you take better care of your plants.

---

## Device & Sensors

The hardware setup you built consists of:

- **ESP32** — main controller  
- **DFRobot Gravity analog pH sensor/meter** - analog pH meter compatible with Arduino
- **DFRobot SEN0244** — is used to measure hardness, purity of water
- **DS18B20** — water temperature sensor  
- **DHT11** — room temperature and humidity sensor  
- **LDR with resistor** — light intensity sensor  

All sensors send their readings to the ESP32, which connects to WiFi and uploads data to **Firebase Realtime Database**.

The mobile app then fetches this real-time data and displays it in interactive graphs.

![Device Setup](/readmeImages/all.jpg)

---

## Welcome Screen

When you open the app, you’ll see a welcoming screen to get you started.

![Welcome Screen](/readmeImages/welcome.jpg)

---

## Home Screen

The main screen shows current weather info fetched from an API and tracks how many days your plant has been growing.

![Home Screen](/readmeImages/home.jpg)

---

## Monitoring Tab

Here you can track key parameters for your plant:

- pH level  
- TDS (Total Dissolved Solids)  
- Water temperature  
- Room temperature  
- Humidity  
- Lighting (LDR sensor)

All data is visualized with charts. You can easily change the displayed time range to see trends over days.

![Monitoring with Graphs](/readmeImages/charts.jpg)

You can also check which sensors are connected and providing data:

![Sensors List](/readmeImages/charts-info.jpg)
![Sensors List](/readmeImages/charts-sensor.jpg)

---

## AI Assistant

The third tab is an AI helper — ask questions about your plants and get instant advice.

![AI Assistant](/readmeImages/ai.jpg)

---

## Technologies

- React Native / Expo  
- Firebase Realtime Database for sensor data  
- Weather API integration  
- Sensor hardware with ESP32 and analog/digital probes
![Setup](/readmeImages/syste,.jpg)

---

