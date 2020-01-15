import musicpd

def next_song():
	if client.status()['state'] == 'play': #this check prevented a crash on my system that didn't happen on other peoples
		client.next()

def prev_song():
	if client.status()['state'] == 'play': #this check prevented a crash on my system that didn't happen on other peoples
		if float(client.status()['elapsed']) > 3.: #if the song has played for over 3 seconds, start it over. otherwise play the previous song
			client.seekcur(0)  
		else:
			client.previous()



def play_pause():
	if client.status()['state'] != 'play': 
		client.play()
	else:
		client.pause(1)
		
def list_all_songs(): #will list only .mp3 files in the music directory, as well as in any directories inside 
	for song in client.listall():
		for x in song:
			if song[x][-1] == '3':	#only shows .mp3 files (or any file extension that ends in '3')	
				print(song[x])
				#print(song_stripper(song[x])) instead of above line to strip out directory, numbering, and extension data
				
def song_stripper(s): 
	#finds last slash in filename to remove directories
	index_of_slash = s.rfind('/') 
	if index_of_slash != -1:
		temp_string = s[index_of_slash + 1:]
	else:
		temp_string = s

	#finds '.' at the end of file names to remove filetypes
	neg_size = len(temp_string) * -1
	for e in range(-1,-5,-1): 
		if e < neg_size:
			break
		elif temp_string[e] == '.':
			temp_string = temp_string[0:e]
			break

	#finds the first letter in the file name to remove track numbers
	#can mess up file names of songs that start with a number or character
	size = len(temp_string) - 1
	for e in range(6): 
		if e == size:  
			break		
		elif temp_string[e].isalpha():
			temp_string = temp_string[e:]
			break

	return temp_string


client = musicpd.MPDClient()       # create client object
client.connect()
print(client.mpd_version) 
client.command_list_ok_begin()       # start a command list
client.update()                      
client.status()                      
client.stats()
results = client.command_list_end() 
print(results)

