import sys
from serial import Serial

baud_rate = 115200 # AT+BOUD0 (default)

with Serial(sys.argv[1], baudrate=baud_rate, timeout=.5) as com:
	try:
		while True:
			msg = b''
			while True:
				r = com.read(256)
				if r:
					msg += r
				elif msg:
					break
			print (msg.decode())
	except KeyboardInterrupt:
		pass
