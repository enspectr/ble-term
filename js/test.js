'use strict';

(() => {

const bt_btn = document.getElementById('bt-btn');
const rx_msg = document.getElementById('rx-msg');
const tx_msg = document.getElementById('tx-msg');

const rx_msg_max = parseInt(rx_msg.getAttribute('rows'));
const query_str  = window.location.search;
const url_param  = new URLSearchParams(query_str);
const echo_mode  = url_param.get('echo') !== null;
const echo_hash  = url_param.get('echo') == 'hash';

const bt_svc_id      = 0xFFE0;
const bt_char_id     = 0xFFE1;
const max_msg_len    = 4096;
const echo_term      = '#';
const echo_hash_term = '$';
const echo_term_code      = echo_term.charCodeAt(0);
const echo_hash_term_code = echo_hash_term.charCodeAt(0);

let bt_char = null;
let rx_msgs = [];
let echo_buf = new Uint8Array(max_msg_len);
let echo_buf_len = 0;

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
	bt_char = null;
	connectTo(device);
}

function writeValue(val)
{
	bt_char.writeValue(val)
	.catch((err) => {
		console.log('BT device write failed');
		setTimeout(() => writeValue(val), 10);
	});
}

function echoReplyHash()
{
	let hash = 0x811c9dc5;
	for (let i = 0; i < echo_buf_len; ++i)
		hash = Math.imul(hash ^ echo_buf[i], 0x01000193) >>> 0;
	txString(hash.toString(16) + echo_hash_term);
	echo_buf_len = 0;
}

function echoReply()
{
	const resp = new Uint8Array(echo_buf_len);
	for (let i = 0; i < echo_buf_len; ++i)
		resp[i] = echo_buf[i];
	writeValue(resp);
	echo_buf_len = 0;
}

function echoHandleValue(val)
{
	for (let i = 0; i < val.byteLength; ++i)
		echo_buf[echo_buf_len++] = val.getUint8(i);
	const term = echo_buf[echo_buf_len-1];
	if (term == echo_term_code)
		echoReply();
	else if (term == echo_hash_term_code)
		echoReplyHash();
}

function onValueChanged(event) {
	const value = event.target.value;
	if (echo_mode)
		echoHandleValue(value);
	let msg = '';
	for (let i = 0; i < value.byteLength; i++) {
		const c = value.getUint8(i);
		if (c == 0)
			break;
		msg += String.fromCharCode(c);
	}
    showMessage(msg);
}

function onBTConnected(device, characteristic)
{
	console.log(device.name, 'connected');
	characteristic.addEventListener('characteristicvaluechanged', onValueChanged);
	device.addEventListener('gattserverdisconnected', onDisconnection);
	tx_msg.disabled = false;
	rx_msg.disabled = false;
	bt_btn.disabled = false;
	bt_char = characteristic;
	bt_btn.textContent = 'Send';
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
		return service.getCharacteristic(bt_char_id);
	}).
	then((characteristic) => {
		console.log(device.name, 'characteristic found');
		return characteristic.startNotifications().then(
			() => {
				onBTConnected(device, characteristic);
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
	txString(tx_msg.value);
}

function onBtn(event)
{
	if (isConnected())
		onTx();
	else
		onConnect();
}

initPage();

})();

