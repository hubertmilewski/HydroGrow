# HydroGrow

![App Logo](path/to/logo-image.png)

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

![Device Setup](path/to/device-setup-photo.png)

---

## Welcome Screen

When you open the app, you’ll see a welcoming screen to get you started.

![Welcome Screen](path/to/welcome-screen.png)

---

## Home Screen

The main screen shows current weather info fetched from an API and tracks how many days your plant has been growing.

![Home Screen](path/to/home-screen.png)

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

![Monitoring with Graphs](path/to/monitoring-graphs.png)

You can also check which sensors are connected and providing data:

![Sensors List](path/to/sensors-list.png)

---

## AI Assistant

The third tab is an AI helper — ask questions about your plants and get instant advice.

![AI Assistant](path/to/ai-assistant.png)

---

## Technologies

- React Native / Expo  
- Firebase Realtime Database for sensor data  
- Weather API integration  
- Sensor hardware with ESP32 and analog/digital probes  

---

