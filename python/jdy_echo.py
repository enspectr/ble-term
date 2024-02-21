import sys
import time
import random
from serial import Serial

baud_rate = 115200 # AT+BOUD0 (default)
max_len  = 80
term_chr = b'#'
term_chr_code = ord(term_chr)

random.seed()

def random_bytes():
	n = random.randrange(1, max_len)
	b = bytes([random.randrange(ord('0'), ord('z') + 1) for _ in range(n)] + [term_chr_code])
	return b

def read_resp(com, tout=1):
	resp = b''
	dline = time.time() + tout
	while True:
		r = com.read(max_len)
		if r:
			resp += r
			if resp[-1] == term_chr_code:
				return resp
			continue
		if time.time() > dline:
			return resp

with Serial(sys.argv[1], baudrate=baud_rate, timeout=.01) as com:
	try:
		while True:
			com.write(msg := random_bytes())
			resp = read_resp(com)
			if resp == msg:
				print ('.', end='', flush=True)
			else:
				print (f'\ntx:{msg} rx:{resp}', file=sys.stderr)
				if len(resp) != len(msg):
					print ('response with different length', file=sys.stderr)
				else:
					for i in range(len(msg)):
						if resp[i] != msg[i]:
							print (f'error at [{i}] tx:{msg[i]} rx:{resp[i]}', file=sys.stderr)
				break
	except KeyboardInterrupt:
		pass
