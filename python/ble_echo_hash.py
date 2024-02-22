import sys
import time
import random
from serial import Serial

baud_rate = 115200 # AT+BOUD0 (default)
max_len  = 80
term_chr = b'$'
term_chr_code = ord(term_chr)

random.seed()

FNV_prime        = 0x01000193
FNV_offset_basis = 0x811c9dc5

def fnv1a(s):
    hash = FNV_offset_basis
    for b in s:
        hash = ((hash ^ b) * FNV_prime) & 0xffffffff
    return hash

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
	if not len(resp):
		print ('\nempty response', file=sys.stderr)
		return False
	if resp[-1] != term_chr_code:
		print ('\ninvalid response terminator', file=sys.stderr)
		print (f'tx:{msg} rx:{resp}', file=sys.stderr)
		return False
	echo_hash = (b'%x' % fnv1a(msg)) + term_chr
	if echo_hash == resp:
		return True
	print ('\ninvalid response to %u bytes sent:' % len(msg), file=sys.stderr)
	print (f'tx:{msg} rx:{resp} expect:{echo_hash}', file=sys.stderr)
	return False

total_bytes = 0
start = time.time()

with Serial(sys.argv[1], baudrate=baud_rate, timeout=.01) as com:
	try:
		while True:
			com.write(msg := random_bytes())
			resp = read_resp(com)
			if chk_resp(msg, resp):
				total_bytes += len(msg) + len(resp)
				print ('.', end='', flush=True)
			else:
				break
	except KeyboardInterrupt:
		now = time.time()
		print('\n%u bytes transferred (%u bytes/sec)' % (total_bytes, int(total_bytes/(now-start))))
		pass
