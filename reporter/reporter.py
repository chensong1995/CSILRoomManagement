#
# Author(s)  : Chen Song
# Description: This file implements an user program that calls our live API to report machine status.
# Last Update: July 22, 2017
#

# How to use on ubuntu:
# 1. Edit ".bash_login" in your home directory. It is a text file.
# 2. At the end of the file, add "python2 /path/to/reporter.py <room> <name> <server-address> &"
#    e.g. python2 /home/chen/Documents/SFU/CMPT470/project/reporter/reporter.py developers chen-t470s localhost 8080 &
# 3. Note that the server address does not contain "/live" prefix

import httplib, urllib, time
from sys import argv

if __name__ == '__main__':
	# room
	room = argv[1]
	# name
	name = argv[2]
	# address
	address = argv[3]
	# port
	port = int(argv[4])
	while True:
		try:
			# current time
			currentTime = str(int(time.time()))
			# prepare POST request
			params = urllib.urlencode({'room': room, 'name': name, 'time': currentTime})
			headers = {"Content-type": "application/x-www-form-urlencoded"}
			conn = httplib.HTTPConnection(address, port)
			conn.request("POST", "/live", params, headers)
			response = conn.getresponse()
			print response.status, response.reason
		except:
			print "something is wrong. do nothing"
		finally:
			time.sleep(10) # every 10 seconds