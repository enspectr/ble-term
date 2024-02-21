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

def chk_resp(msg, resp):
	if resp == msg:
		return True
	if not len(resp):
		print ('\nempty response', file=sys.stderr)
	elif len(resp) != len(msg):
		print ('\nresponse with different length', file=sys.stderr)
	else:
		print ('', file=sys.stderr)
		for i in range(len(msg)):
			if resp[i] != msg[i]:
				print (f'error at [{i}] tx:{msg[i]} rx:{resp[i]}', file=sys.stderr)
	return False

with Serial(sys.argv[1], baudrate=baud_rate, timeout=.01) as com:
	try:
		while True:
			com.write(msg := random_bytes())
			resp = read_resp(com)
			if chk_resp(msg, resp):
				print ('.', end='', flush=True)
			else:
				print (f'tx:{msg} rx:{resp}', file=sys.stderr)
				break
	except KeyboardInterrupt:
		pass
