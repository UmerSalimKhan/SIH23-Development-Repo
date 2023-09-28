import face_recognition
import cv2
import numpy as np
import csv
import os
from datetime import datetime

filepath = "D:/Jupyter Notebook/Practice/Face Recognition/Train data"
video_capture = cv2.VideoCapture (0) 

kalpana_image = face_recognition.load_image_file (filepath + "/KC1.jpg")
kalpana_encoding = face_recognition.face_encodings (kalpana_image)[0]

mia_image = face_recognition.load_image_file (filepath + "/MK2.jpg")
mia_encoding = face_recognition.face_encodings (mia_image)[0]

neeraj_image = face_recognition.load_image_file (filepath + "/NC7.jpg")
neeraj_encoding = face_recognition.face_encodings (neeraj_image)[0]

mary_image = face_recognition.load_image_file (filepath + "/MKom2.jpg")
mary_encoding = face_recognition.face_encodings (mary_image)[0]

known_face_encoding = [kalpana_encoding, mia_encoding, neeraj_encoding, mary_encoding]
known_faces_names = ['Kalpana', 'Mia', 'Neeraj', 'Mary']
students = known_faces_names.copy ()

face_locations = []
face_encodings = []
face_names = []
iterate = True

now = datetime.now ()
current_date = now.strftime ('%Y-%m-%d')

f = open (current_date + '.csv', 'w+', newline='')
lnwriter = csv.writer (f)

while True:
	_, frame = video_capture.read ()
	small_frame = cv2.resize (frame, (0, 0), fx=0.25, fy=0.25)
	rgb_small_frame = small_frame [:, :, ::-1]
	if iterate:
		face_locations = face_recognition.face_locations (rgb_small_frame)
		face_encodings = face_recognition.face_encodings (rgb_small_frame, face_locations)
		face_names = []
		for face_encoding in face_encodings:
			matches = face_recognition.compare_faces (known_face_encoding, face_encoding)
			name = ''
			face_distance = face_recognition.face_distance (known_face_encoding, face_encoding)
			best_match_index = np.argmin (face_distance)
			if matches [best_match_index]:
				name = known_faces_names [best_match_index]
			face_names.append (name)
			if name in students:
				students.remove (name)
				print (students)
				current_time = now.strftime ('%H:%M:%S')
				lnwriter.writerow ([name, current_time])
	cv2.imshow ('Attendance system', frame)
	if cv2.waitKey (1) & 0xFF == ord ('q'):
		break

video_capture.release ()
cv2.destroyAllWindows ()
f.close ()

