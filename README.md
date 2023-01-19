# ESP32-Web-Server
A standalone web server with an ESP32 which serves web pages for mapping ECG signals in real-time offline via web sockets connection between them, it draws the received data in real-time at jQuery Flot Chart.

The home page is a simple HTML page with fewer JavaScript and CSS requirements, it contains twelve charts for ECG signals (I, II, III, aVR, aVL, aVF, V1, V2, V3, V4, V5, V6), six buttons for monitoring and recording, temperature box and Date & Time box, as shown in fig ( 1 ).
![image](https://user-images.githubusercontent.com/123108854/213541987-d1fdcd75-8f68-416d-b196-ed83f52c3b94.png)
![Screenshot 2023-01-19 113518](https://user-images.githubusercontent.com/123108854/213542799-6e629945-40b5-46e9-83c3-b86316a0cbb5.png)

•	Buttons functionality
   Monitor: A button is used to send a request to the server for asking data (ECG signals) to be drawn at charts in real time.
   Stop: A button is used to send a request to the server for stopping the monitoring.
   10 Sec: A button is used to send a request to the server for recording 10 Sec.
   20 Sec: A button is used to send a request to the server for recording 20 Sec and so on ……..

