import sys
from serial import Serial

baud_rate = 115200 # AT+BOUD0 (default)

with Serial(sys.argv[1], baudrate=baud_rate, timeout=.5) as com:
	try:
		while True:
			cmd = input('>')
			com.write(cmd.strip().encode())
			resp = com.read(256)
			print (resp.decode())
	except KeyboardInterrupt:
		pass
