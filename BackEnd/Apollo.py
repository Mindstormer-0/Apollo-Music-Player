'''
         _                   _          _            _             _             _       
        / /\                /\ \       /\ \         _\ \          _\ \          /\ \     
       / /  \              /  \ \     /  \ \       /\__ \        /\__ \        /  \ \    
      / / /\ \            / /\ \ \   / /\ \ \     / /_ \_\      / /_ \_\      / /\ \ \   
     / / /\ \ \          / / /\ \_\ / / /\ \ \   / / /\/_/     / / /\/_/     / / /\ \ \  
    / / /  \ \ \        / / /_/ / // / /  \ \_\ / / /         / / /         / / /  \ \_\ 
   / / /___/ /\ \      / / /__\/ // / /   / / // / /         / / /         / / /   / / / 
  / / /_____/ /\ \    / / /_____// / /   / / // / / ____    / / / ____    / / /   / / /  
 / /_________/\ \ \  / / /      / / /___/ / // /_/_/ ___/\ / /_/_/ ___/\ / / /___/ / /   
/ / /_       __\ \_\/ / /      / / /____\/ //_______/\__\//_______/\__\// / /____\/ /    
\_\___\     /____/_/\/_/       \/_________/ \_______\/    \_______\/    \/_________/                                                                                    
Music Player using MPD
'''
# dependencies
import musicpd, json, subprocess, os, sys, io, time, requests, traceback, logging
import xml.etree.ElementTree as ET
from subprocess import Popen, CREATE_NEW_CONSOLE
from flask import Flask, render_template, request, redirect, Response
from flask_cors import CORS 
from urllib.request import urlopen
from waitress import serve
from colorthief import ColorThief
if sys.version_info < (3, 0):
    from urllib2 import urlopen
else:
    from urllib.request import urlopen

# initialization
app = Flask(__name__) #Flask
CORS(app, resources=r'/api/*', allow_headers= ['Content-Type', 'Access-Control-Allow-Origin']) #Cross Origin for JSON
#logging.getLogger('flask_cors').level = logging.DEBUG #Debug with CORS
client = musicpd.MPDClient() #mpd client
desired_volume = 50 #volume at start = 50
info = []

# functions
def startup_func():
	global desired_volume,client,info
	program = 'C:/mpd/mpd.exe' #make sure your path is correct
	args = 'C:/mpd/mpd.conf' #make sure your path is correct
	try:
		client.connect()
	except:
		Popen([program, args],creationflags = CREATE_NEW_CONSOLE) #CREATE_NEW_CONSOLE MAY ONLY WORK IN WINDOWS
		client.connect()
	if client.status()['state'] == 'play':
		desired_volume = int(client.status()['volume'])	
	else:
		client.rescan()
		client.clear()
		temp_list = client.listall() 
		for songs in temp_list: #builds a queue with all songs. can also use a playlist
			if 'file' in songs and songs['file'].endswith('.mp3'):
				client.add(songs['file'])
	info = info_obj_builder()
	return 'OK'

def songBuilder(song, attributes): 
	curr_song = {}
	for x in attributes:		
		try:
			curr_song[x] = song[x]			
		except:
			curr_song[x] = 'none'	
	return curr_song

def AlbumArtGenerator(album,artist):
	api_key = 'd1915a9d435d47526a61dc0210978583'
	retVal = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=' + api_key +'&artist='  + artist + '&album=' + album + '&format=json'

	r = requests.get(url = retVal) 
	r = r.content
	r = r.decode("UTF-8")
	k = json.loads(r)

	try:
		if k['album']['image'][4]['#text'] != '':
			return k['album']['image'][4]['#text']
	except:
		return 'none'

def info_obj_builder():
	#this function has morphed into one of the worst functions i've ever written. I'll fix it later -Omar
	global info
	albums_artist = set(())
	albums =   artists = set()
	songs = []
	client.rescan()
	tempList = client.listallinfo()


	ids = []
	list_for_ids = client.playlistinfo()
	for x in list_for_ids:
		temp = {}
		temp['name'] = x['title']
		temp['id'] = x['id']
		ids.append(temp)
	#x = client.
	for x in tempList:
		if 'file' in x and x['file'].endswith('.mp3'):
			try:

				albums_artist.add((x['album'],x['artist'])) if 'album' in x and 'artist' in x else albums_artist
				albums.add(x['album']) if 'album' in x else albums.add('none')
				artists.add(x['artist']) if 'artist' in x else artists
				temp_song = (songBuilder(x,['title','artist','album','duration']))
				#songs.append((songBuilder(x,['title','artist','album','duration'])))
				for y in ids:
					if y['name'] == x['title']:
						temp_song['id'] = y['id']
						songs.append(temp_song)
						break
				#songs.append('songid':x['id'])
			except:
				continue
	albums_list = []
	artists_list = []
	seen = []
	artist_seen = []
	for albums,artist in albums_artist:
		if artist not in artist_seen:
			artist_seen.append(artist)
			temp_artist = {}
			artists_albums = []
			temp_artist['name'] = artist
			artists_albums.append(AlbumArtGenerator(albums,artist))
			temp_artist['albums'] = artists_albums
			artists_list.append(temp_artist)
		else:
			if albums not in seen :
				for x in artists_list:
					if x['name'] == artist:
						x["albums"].append(AlbumArtGenerator(albums,artist))
						break		
		if albums not in seen:
			album = {}
			seen.append(albums)
			album["albumname"] = albums
			album['pic'] = AlbumArtGenerator(albums,artist)  #make this one call
			album['artist'] = artist
			albums_list.append(album)


	for x in tempList:
		if 'album' not in x:
			if 'file' in x and x['file'].endswith('.mp3'):
				if 'none' not in seen:
					album = {}
					seen.append('none')
					album['albumname'] = 'none'
					album['pic']= 'none'
					album['artist'] = x['artist'] if 'artist' in x else 'none'
					albums_list.append(album)

	

	for x in tempList:
		if 'artist' not in x:
			if 'file' in x and x['file'].endswith('.mp3'):
				if 'none' not in artist_seen:
					temp_artist = {}
					artist_seen.append('none')
					temp_artist['name'] = 'none'
					temp_artist['albums'] = 'none'
					artists_list.append(temp_artist)
				
				


	return 	{'songs':songs,'albums':albums_list,'artists':artists_list}


@app.route('/api/play', methods = ['POST'])
def play_pause():
	if client.status()['state'] != 'play':
		client.play()
		#if the server was in a 'stop' state, this check will give it a second to add 'volume' back to status which will allow
		#set_volume to work and avoid misreadings of the volume level
		if 'volume' not in client.status():
			time.sleep(1)
		set_volume(desired_volume) 
	else:
		client.pause(1)
	return 'OK',200

@app.route('/api/volume', methods = ['POST'])
def set_volume(x = -1): #won't let desired_volume be higher than 100 or lower than 0
	global desired_volume	
	
	if x != -1:
		vol = x
	else:
		req = request.get_json()
		vol = int(req['volume'])	
	if vol >= 0 and vol <= 100:
		desired_volume = vol
	elif vol < 0:
		desired_volume = 0
	else:
		desired_volume = 100
	client.setvol(desired_volume)
	return 'OK',200

@app.route('/api/seek', methods = ['POST'])
def seek():
	req = request.get_json()
	pos = float(req['seek'])
	
	if 'duration' in client.status():
		pos *= float(client.status()['duration'])
		if pos < float(client.status()['duration']):			
			pos = int(pos)
			client.seekcur(pos)
		else: next_song()   	
	return 'OK',200

@app.route('/api/next', methods = ['GET'])
def next_song():
	if client.status()['state'] == 'play' and int(client.status()['song']) != int(client.status()['playlistlength']) -1:
		client.next()
	return json.dumps(return_current_song())

@app.route('/api/previous', methods = ['GET'])
def prev_song():
	if client.status()['state'] == 'play': #this check prevented a crash on my system that didn't happen on other peoples
		if float(client.status()['elapsed']) > 3.: #if the song has played for over 3 seconds, start it over. otherwise play the previous song
			client.seekcur(0)
		elif client.status()['song'] != '0':
			client.previous()		
	return json.dumps(return_current_song())

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

@app.route('/api/get_vol', methods = ['GET'])
def get_volume(): 
	retVal = {'volume':desired_volume}
	return json.dumps(retVal) 

@app.route('/api/get_current', methods = ['GET'])
def return_current_song():
	attributes = ['artist', 'album', 'title', 'duration', 'elapsed', 'pic', 'palette']
	status = client.status()
	song = client.currentsong() if status['state'] != 'stop' else client.playlistinfo(0)[0]
	elapsed = status['elapsed'] if status['state'] != 'stop' else '0'
	curr_song = songBuilder(song, attributes) if status['state'] != 'stop' else songBuilder(client.playlistinfo(0)[0], attributes)
	try:
		curr_song['title'] = song_stripper(curr_song['title'])
		curr_song['duration'] = song['duration']
		curr_song['elapsed'] = elapsed
		curr_song['pic'] = AlbumArtGenerator(song['album'],song['artist'])
		fd = urlopen(curr_song['pic'])
		f = io.BytesIO(fd.read())
		color_thief = ColorThief(f)
		palette = color_thief.get_palette(color_count=2)
		curr_song['palette'] = palette
	except:
		pass
	return json.dumps(curr_song)

@app.route('/api/shuffle', methods = ['POST']) #this will shuffle what is in the queue. It would not need to be changed if you had loaded a playlist
def shuffle():
	global current_playlist
	current_playlist = client.playlistinfo()

	client.shuffle()

	return 'OK',200

@app.route('/api/unshuffle', methods = ['POST']) #this will work under the assumption you had been playing from all of your music and not a specific playlist
def unshuffle():
	client.rescan() 
	#play_pause() not sure if we should pause before we do our stuff
	playlistlength = int(client.status()['playlistlength']) #accoutnig for 0 based positions
		
	for song in range(1,playlistlength):
		client.delete(1)

	pos=0
	for songs in current_playlist: #builds a queue with all songs.
		if songs['file'] != client.playlistinfo()[0]['file']: #skips over current song playing or paused on
			client.add(songs['file'])
			pos += 1
		else:
			client.move(0,pos) #takes care of current song
	return 'OK', 200

@app.route('/api/obj_list', methods = ['GET'])
def startup_info_builder():
	return json.dumps(info)

@app.route('/api/cur_state', methods = ['GET'])
def get_state():
	return json.dumps({'state': client.status()['state']})

@app.route('/api/play_selected', methods = ['POST'])
def play_selected():
	req = request.get_json()
	id = req['id']
	client.playid(id)
	return 'OK',200

@app.route('/api/repeatSong', methods = ['POST'])
def repeat_song():
	client.single(1)
	client.repeat(1)
	return 'Ok',200

@app.route('/api/repeat', methods = ['POST'])
def repeat_playlist():
	client.repeat(1)
	client.single(0)
	return 'Ok',200

@app.route('/api/repeatoff', methods = ['POST'])
def repeat_off():
	client.repeat(0)
	client.single(0)
	return 'Ok',200


startup_func()
