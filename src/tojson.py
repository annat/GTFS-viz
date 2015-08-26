import csv
import json

def main():
	createGeoJSON();

def createGeoJSON():
	stops_path='stops.txt'
	freq_path = 'frequencies.txt'
	stop_times_path = 'stop_times.txt'
	# Read in raw data from csv
	stops_raw = csv.reader(open(stops_path, 'rb'), dialect='excel')
	freq_raw = csv.reader(open(freq_path, 'rb'), dialect='excel')
	stop_times_raw = csv.reader(open(stop_times_path, 'rb'), dialect='excel')

	iter = 0	
	iter1 = 0

	stops_list = [list(lst) for lst in stops_raw]

	stop_time_list = [list(lst) for lst in stop_times_raw]

	freq_dict = {}
	for row in freq_raw:
		key = row[0]
	   	freq_dict[key] = row[1:]


	'''
	Assign one frequncy (in this case the highest) to each stop per time interval. 
	Stop_times contains  trip_id and stop_id and frequencies contains trip_id and frequncy. In order to assign frequncy to a stop, 			the stop_id have to be matched in stops and stop_times, then the trip_id can be extracted and with the trip_id it is 
	'''
	for stop in stops_list:
	 	iter += 1
		#creating an object with bins for each time interval
		trips = {'0':100000,  '1':100000, '2':100000, '3':100000, '4':100000, '5':100000, '6':100000, '7':100000, '8':100000, 				'9':100000, '10':100000, '11':100000, '12':100000, '13':100000, '14':100000, '15':100000, '16':100000, '17':100000, 					'18':100000, '19':100000 , '20':100000, '21':100000, '22':100000, '23':100000}
	
		for s in stop_time_list:

			iter1 += 1			
			if stop[0] == s[2]:
				# Accessing the frequnecy for the current stop key: [start_time, stop_time, headaway_secs]
				start_time = int(freq_dict[s[0]][0].split(":")[0])
				stop_time = int(freq_dict[s[0]][1].split(":")[0])
				freq = freq_dict[s[0]][2]
				trip_id = s[0]
				
				if 0 >= start_time and  1< stop_time :
					index = '0'
					if trips[index] <= freq:
						trips[index] =freq 
					
				if 1 >= start_time and 2 <= stop_time:
					index = '1'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 2 >= start_time and 3 <= stop_time:
					index = '2'
					if trips[index] <= freq:
						trips[index] =freq 	
					
				if 3 > start_time and 4 <= stop_time:
					index = '3'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 4 >= start_time and 5 <= stop_time:
					index = '4'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 5 >= start_time and 6 <= stop_time:
					index = '5'
					if trips[index] <= freq:
						trips[index] =freq 	
				
				if 6 >= start_time and 7 <= stop_time:
					index = '6'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 7 >= start_time and 8 <= stop_time:
					index = '7'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 8 >= start_time and 9 <= stop_time:
					index = '8'
				
					if trips[index] <= freq:
						trips[index] =freq 		
				
				if 9 >= start_time and 10 <= stop_time:
					index = '9'
					if trips[index] <= freq:
						trips[index] =freq 	
				
				if 10 >= start_time and 11 <= stop_time:
					index = '10'
					if trips[index] <= freq:
						trips[index] =freq 
				if 11 >= start_time and 12 <= stop_time:
					index = '11'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 12 >= start_time and 13 <= stop_time:
					index = '12'
					if trips[index] <= freq:
						trips[index] =freq 
				
				if 13 >= start_time and 14 <= stop_time:
					index = '13'
					if trips[index] <= freq:
						trips[index] =freq 

				if 14 >= start_time and 15 <= stop_time:
					index = '14'
					if trips[index] <= freq:
						trips[index] =freq 		
				
				if 15 >= start_time and 16 <= stop_time:
					index = '15'
					if trips[index] <= freq:
						trips[index] =freq 
				if 16 >= start_time and 17 <= stop_time:
					index = '16'
					if trips[index] <= freq:
						trips[index] = freq 		
				
				if 17 >= start_time and 18 <= stop_time:
					index = '17'
					if trips[index] <= freq:
						trips[index] =freq 
				if 18 >= start_time and 19 <= stop_time:
					index = '18'
					if trips[index] <= freq:
						trips[index] =freq 	
				
				if 19 >= start_time and 20 <= stop_time:
					index = '19'
					if trips[index] <= freq:
						trips[index] =freq 	
				
				if 20 >= start_time and 21 <= stop_time:
					index = '20'
					if trips[index] <= freq:
						trips[index] =freq 	
					
				if 21 >= start_time and 22 <= stop_time:
					index = '21'
					if trips[index] <= freq:
						trips[index] =freq 	
					
				elif 22 >= start_time and 23 <= stop_time:
					index = '22'
					if trips[index] <= freq:
						trips[index] =freq 	
					
				
				if 23 >= start_time and 24 <= stop_time:
					index = '23'	
					if trips[index] <= freq:
						trips[index] =freq 	
							
				else: 
					index = str(start_time )
					if trips[index] <= freq:
						trips[index] =freq 	
					
				
		stop.append(trips)	
			
	 			

	# data from the csv is be formatted to geojson
	template = \
	    ''' \
	    { "type" : "Feature",
	       
		    "geometry" : {
		        "type" : "Point",
		        "coordinates" : [%s,%s]},
		"properties" : { "name" : "%s", "id" : "%s", "freq" : %s}
		},
	    '''

	template_last_element = \
	    ''' \
	    { "type" : "Feature",
	       
		    "geometry" : {
		        "type" : "Point",
		        "coordinates" : [%s,%s]},
		"properties" : { "name" : "%s", "id" : "%s", "freq" : %s}
		}
	    '''
	# the first part of the geojson file
	output = \
	    ''' \
	{ "type" : "FeatureCollection",
	    "features" : [
	    '''

	iter = 0
	last_element = len(stops_list)
	for row in stops_list:
	    #skipping the header of the csv
	    iter += 1
	    if iter >= 2 :
		
		lat = float(row[5])
		lon = float(row[4])
		name = str(row[0])
		id = row[0]
		freq = row[12]
		if(iter == last_element):
	 		output += template_last_element % ( float(row[5]), float(row[4]), str(row[0]), row[0], json.dumps(row[12]))
	       		
		else:
			output += template % ( float(row[5]), float(row[4]), str(row[0]), row[0], json.dumps(row[12]))
		
	# the last part of the geojson
	output += \
	    ''' \
	    ]
	}
	    '''
	    
	# writes the result to output.geojson
	outFileHandle = open("output.geojson", "w")
	outFileHandle.write(output)
	outFileHandle.close()


if __name__ == '__main__':
    main()
