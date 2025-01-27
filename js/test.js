'use strict';

(() => {

const bt_btn  = document.getElementById('bt-btn');
const bt_btn2 = document.getElementById('bt-btn2');
const rx_msg  = document.getElementById('rx-msg');
const tx_msg  = document.getElementById('tx-msg');

const rx_msg_max = parseInt(rx_msg.getAttribute('rows'));
const query_str  = window.location.search;
const url_param  = new URLSearchParams(query_str);
const echo_mode  = url_param.get('echo') !== null;
const dual_mode  = url_param.get('dual') !== null;

const bt_svc_id     = 0xFFE0;
const bt_char_tx_id = 0xFFE1;
const bt_char_rx_id = 0xFFE2;

let bt_char = null;
let bt_busy = false;
let tx_queue = [];
let rx_msgs = [];
let bt_rx_suspended = false;

function isConnected()
{
	return bt_char !== null;
}

function initPage()
{
	if (!navigator.bluetooth) {
		document.body.innerHTML = '<div class="alert-page">The Bluetooth is not supported in this browser. Please try another one.</div>';
		return;
	}
	bt_btn.textContent = 'Connect';
	bt_btn.onclick = onBtn;
	bt_btn2.onclick = onBtn2;
}

function showMessage(msg)
{
	if (rx_msgs.length >= rx_msg_max)
		rx_msgs.shift();
	rx_msgs.push(msg);
	console.log('rx:', msg);
	rx_msg.textContent = rx_msgs.join('\n');
}

function onDisconnection(event)
{
	const device = event.target;
	console.log(device.name + ' bluetooth device disconnected');
	tx_msg.disabled = true;
	rx_msg.disabled = true;
	bt_btn.disabled = true;
	bt_btn2.disabled = true;
	bt_char = null;
	bt_busy = false;
	tx_queue = [];
	connectTo(device);
}

function bt_write(val)
{
	bt_char.writeValueWithoutResponse(val)
	.then(
		() => {tx_queue_flush();},
		(err) => {console.log('BT write failed'); tx_queue.push(val); tx_queue_flush();}
	);
}

function tx_queue_flush()
{
	let val = tx_queue.shift();
	if (val)
		bt_write(val);
	else
		bt_busy = false;
}

function writeValue(val)
{
	if (bt_busy) {
		tx_queue.push(val);
		return;
	}
	bt_busy = true;
	bt_write(val);
}

function onValueChanged(event) {
	const value = event.target.value;
	if (echo_mode)
		writeValue(value);
	let msg = '';
	for (let i = 0; i < value.byteLength; i++) {
		const c = value.getUint8(i);
		if (c == 0)
			break;
		msg += String.fromCharCode(c);
	}
	if (!bt_rx_suspended)
		showMessage(msg);
}

function suspendRx(flag)
{
	bt_rx_suspended = flag;
	bt_btn2.textContent = flag ? 'Resume' : 'Suspend';
}

function onBTConnected(device, chars)
{
	console.log(device.name, 'connected');
	chars[0].addEventListener('characteristicvaluechanged', onValueChanged);
	device.addEventListener('gattserverdisconnected', onDisconnection);
	bt_char = dual_mode ? chars[1] : chars[0];
	tx_msg.disabled = bt_btn.disabled = !bt_char.properties.write;
	rx_msg.disabled = false;
	bt_btn.textContent = 'Send';
	bt_btn2.disabled = false;
	bt_btn2.classList.remove('hidden');
	suspendRx(bt_rx_suspended);
}

function connectTo(device)
{
	device.gatt.connect().
	then((server) => {
		console.log(device.name, 'GATT server connected, getting service...');
		return server.getPrimaryService(bt_svc_id);
	}).
	then((service) => {
		console.log(device.name, 'service found, getting characteristic...');
		return Promise.all([
      service.getCharacteristic(bt_char_tx_id),
      dual_mode ? service.getCharacteristic(bt_char_rx_id) : null
    ]);
	}).
	then((chars) => {
		console.log(device.name, 'characteristic found');
		return chars[0].startNotifications().then(
			() => {
				onBTConnected(device, chars);
	        },
	        (err) => {
	        	console.log('Failed to subscribe to ' + device.name + ':', err.message);
	        	return Promise.reject(err);
	        }
        );
	})
	.catch((err) => {
		console.log('Failed to connect to ' + device.name + ':', err.message);
		setTimeout(() => { connectTo(device); }, 500);
	});
}

function doConnect(devname)
{
	console.log('doConnect', devname);
	bt_btn.disabled = true;
	let filters = [{services: [bt_svc_id]}];
	if (devname) {
		filters.push({name: devname});
	}
	return navigator.bluetooth.requestDevice({
		filters: filters,
	}).
	then((device) => {
		console.log(device.name, 'selected');
		connectTo(device);
	})
	.catch((err) => {
		console.log('Failed to discover BT devices');
		bt_btn.textContent = 'Connect';
		bt_btn.disabled = false;
	});
}

function onConnect(event)
{
	console.log('onConnect');
	doConnect();
}

function txString(str)
{
	const val = Uint8Array.from(Array.from(str).map(letter => letter.charCodeAt(0)));
	console.log('tx:', str);
	writeValue(val);
}

function onTx(event)
{
	txString(tx_msg.value + '\r');
}

function onBtn(event)
{
	if (isConnected())
		onTx();
	else
		onConnect();
}

function onBtn2(event)
{
	suspendRx(!bt_rx_suspended);
}

initPage();

})();

