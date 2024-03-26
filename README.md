# ble-term
BLE terminal for modules like JDY-08

## How to use
- connect BLE module to UART adapter
- goto https://enspectr.github.io/ble-term/
- press Connect, select your adapter in the list and press Pair
- now you may send text to your adapter and receive messages from it

## Python scripts
Scripts from the *python* folder are designed to communicate with adapter
- *ble_term.py* sends text to application
- *ble_cat.py* receives text from application
- *ble_echo.py* runs echo test (see below)
- *ble_echo_hash.py* runs echo / hash test (see below)

## Tests
1. Before running BLE tests check your adapter. To do it connect RX and TX pins and run *ble_echo.py*.
2. For echo test goto https://enspectr.github.io/ble-term/?echo and connect to your adapter. Then run *ble_echo.py*.
3. For echo / hash test goto https://enspectr.github.io/ble-term/?echo=hash and connect to your adapter. Then run *ble_echo_hash.py*.

## Browsers tested
- Chrome for Windows
- Chromium for Linux (set chrome://flags/#enable-experimental-web-platform-features flag)
- Chrome for Android
- Bluefy on iOS (https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055)

## Detailed description
The BLE is built around GATT where data is bound to attributes which in tern are bound to services. The attribute data length is limited by radio link MTU and is just 20 bytes by default. The data stream transmission is only possible by gradually updating attribute. The BLE guarantees that unless something goes wrong every attribute update will be delivered to the peer. The BLE module (we use JDY-08) used to split UART data received onto 20 byte chunks before sending them to the peer. Yet one should not send too many chunks at once just because the UART buffer may be overflowed and data may be lost. There are no hardware handshaking supported by the module. There are two test scenarious supported by the web page. The first 'echo' test just send any data received back to the sender. The second 'echo / hash' test sends just the hash of the received data back to the sender.

The BLE module is configured in many aspects by means of AT commands. Note that there is no line termination symbol in the protocol. AT commands should be ended by just ending transmitting of characters. So readily available tools like PuTTY will not work. One can use *ble_term.py* script to send AT commands to the module and receive responses. The module accepts AT commands unless paired with remote party.

## Useful resources
- https://github.com/WebBluetoothCG/web-bluetooth
- https://googlechrome.github.io/samples/web-bluetooth/device-info.html
- https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp
- https://apps.apple.com/us/app/nrf-connect-for-mobile/id1054362403
