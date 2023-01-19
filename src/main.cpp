#include<Arduino.h>
#include <WiFi.h>
#include <WiFiAP.h>
#include <SPI.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <SPIFFS.h>
#include <FS.h>


#define ST 4000 // sampling time

// Replace with your network credentials
const char* ssid     = "Infinity";
const char* password = "11110000"; 
unsigned char event = 0;
char monitor =0 , stop = 0 ;
int long count=0;
int long count1=0;
double g [12];
int msg_buf;
 String d1 ;
 String d2 ;
 String d3 ;
hw_timer_t * timer = NULL;

void IRAM_ATTR isr() {
  event = 1;
  }

void timer0(){
   //timer setup
  timer = timerBegin(0, 80, true);
  timerAttachInterrupt(timer, &isr, true);
  timerAlarmWrite(timer, ST, true);
  timerAlarmEnable(timer);
}
  ////////////////////////////////////

// Callback: send homepage
void homepage(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/page1.html", "text/html");
}

// Callback: send aboutpage
void aboutpage(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/about.html", "text/html");
}

void concolor(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery.cancolor.js", "text/js");
}

void axislabels(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery.flot.axislabels.js", "text/js");
}

void drawSeries(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery.flot.drawSeries.js", "text/js");
}

void flotjs(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery.flot.js", "text/js");
}

void saturated(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery.flot.saturated.js", "text/js");
}

void jquery1(AsyncWebServerRequest *request) {
  request->send(SPIFFS, "/jquery1.js", "text/js");
}

  ////////////////////////////////////

AsyncWebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num,WStype_t type,uint8_t *payload,size_t length)
{

  // Figure out the type of WebSocket event
  switch (type)
  {
      
        case WStype_DISCONNECTED:   
        Serial.printf("[%u] Disconnected!\n",num);   
            break;
        case WStype_CONNECTED: 
            {
              IPAddress ip = webSocket.remoteIP(num); 
               Serial.printf("[%u] Connection from ", num);
               Serial.println(ip.toString());  
            }
            break;
        
        case WStype_TEXT:
            {
                // Print out raw message
              Serial.print(" Received text: ");
               for (int i = 0; i < length; i++)
              {
               msg_buf = (int)payload[i];
              } 

              switch (msg_buf)
               {
                case 49:
                   monitor = 1;
                   stop = 0;
                  timer0();
                 break;
                 case 48:
                      stop = 1;
                break;
               default:
                break;
                }

            }   
    Serial.println(msg_buf);
    Serial.println();
            break; 
               default:
                break; 
             
    }
}


void setup() {
//  timer0();

  Serial.begin(115200);
if (!SPIFFS.begin(true))
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  ////////////////////////////////////
  WiFi.softAP(ssid,password);
  IPAddress ip = WiFi.softAPIP();
  Serial.print(" IP address: ");
  Serial.println(ip);
  Serial.println("Welcome Rashwan");

  ////////////////////////////////////////

    // On HTTP request for root, provide index.html and javascript files
  server.on("/", HTTP_GET, homepage);
  server.on("/about.html", HTTP_GET, aboutpage);
  server.on("/jquery.cancolor.js", HTTP_GET, concolor);
  server.on("/jquery.flot.axislabels.js", HTTP_GET, axislabels);
  server.on("/jquery.flot.drawSeries.js", HTTP_GET, drawSeries);
  server.on("/jquery.flot.js", HTTP_GET, flotjs);
  server.on("/jquery.flot.saturated.js", HTTP_GET, saturated);
  server.on("/jquery1.js", HTTP_GET, jquery1);

  //////////////////////////////////////////////////////////

  server.begin();         // start server
  webSocket.begin();     // start webSocket server
  webSocket.onEvent(webSocketEvent); // Callback to handle for websocket events

   }

void loop() {
  
  // Look for and handle WebSocket data
  webSocket.loop();
//////////////////////////////////
  
    if ((event == 1) && (monitor == 1))
  
    // if (event == 1) 
  {
     count++;
    for (int i = 0; i < 12; i++)
    {
    // g [i] = random(99.00);
      g [i] =i*3.25;
    }
    
    for (int i = 0; i < 11; i++)
    {
      d1 += String(g [i], 2) + ",";
    }
    d1 += String(g [11], 2);
    //Serial.println(d1);
    d2 += d1 +",";  //d2 is an array of  elements

if(count % 50 == 0)
{
   // Serial.println(d2); 
 //d3=d2+count1;
  webSocket.broadcastTXT(d2);    // send data to all connected clients pio run -t uploadfs
   d2 = "";
   count1++ ;
  
}

  d1="";
  event = 0;
}


if(stop == 1){
      count=0;
      count1=0;
      monitor=0;
      stop = 0;
      timerStop(timer);
      timerAlarmDisable(timer);

}

}

