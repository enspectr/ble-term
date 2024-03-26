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

## Useful resources
- https://github.com/WebBluetoothCG/web-bluetooth
- https://googlechrome.github.io/samples/web-bluetooth/device-info.html
- https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp
- https://apps.apple.com/us/app/nrf-connect-for-mobile/id1054362403
