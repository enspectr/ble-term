import sys
import time
from serial import Serial

baud_rate = 115200 # AT+BOUD0 (default)
max_len  = 80
term_chr = b'#'
term_chr_code = ord(term_chr)
cnt = 0

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
	while True:
		cnt += 1
		com.write((b'%d' + term_chr) % cnt)
		resp = read_resp(com)
		print (resp)
