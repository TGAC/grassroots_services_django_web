from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PhotoSerializer
from django.http import HttpResponse, Http404
import os, json
from django.conf import settings
from django.http import FileResponse
from django.http import JsonResponse
import glob
BASE_PATH = '/opt/apache/htdocs/field_trial_data/APItest/'

import requests
from django.http import JsonResponse

def oauth_callback(request):
    auth_code = request.GET.get('code', None)
    if auth_code:
        print(f"Authorization Code: {auth_code}")
        
        # Now exchange the code for an access token
        token_url = 'https://auth.globus.org/v2/oauth2/token'
        client_id = 'f3cb960a-601c-43e0-b045-81a266fd2193'
        client_secret = 'f3cb960a-601c-43e0-b045-81a266fd2193'
        redirect_uri = 'https://grassroots.tools/beta/photo_receiver/private/redirect_uri'

        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'redirect_uri': redirect_uri,
            'client_id': client_id,
            'client_secret': client_secret,
        }

        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        ########## response = requests.post(token_url, headers=headers, data=data)
        if response.status_code == 200:
            token_data = response.json()
            # Do something with the token_data, e.g., store it, use it to make further requests, etc.
            return JsonResponse({'message': 'Token received', 'token_data': token_data})
        else:
            return JsonResponse({'error': 'Failed to exchange authorization code for token'}, status=response.status_code)

    else:
        return HttpResponse("No authorization code provided.", status=400)

class LatestPhoto(APIView):
    def get(self, request, subfolder, plot_number):        
        ##plot_path = os.path.join(BASE_PATH, subfolder, f'photo_plot_{plot_number}_*.jpg')
        plot_path = os.path.join(BASE_PATH, subfolder, 'photo_plot_{}_*.jpg'.format(plot_number))

        # Find all photos for the plot
        photos = glob.glob(plot_path)
        if not photos:
            raise Http404("No photos found for the plot")

        # Find the most recent photo
        latest_photo = max(photos, key=os.path.getctime)
        latest_photo_filename = os.path.basename(latest_photo)
        photo_url = request.build_absolute_uri(os.path.join(settings.MEDIA_URL, subfolder, latest_photo_filename))
         # Manually construct the URL
        photo_url = 'https://grassroots.tools/beta' + os.path.join(settings.MEDIA_URL, subfolder, latest_photo_filename)

        print(photo_url)
        # Serve the photo
        #return FileResponse(open(latest_photo, 'rb'), content_type='image/jpeg')
        return JsonResponse({'status': 'success', 'filename': latest_photo_filename, 'url': photo_url})

class PhotoUploadView(APIView):
    def post(self, request, format=None):
        serializer = PhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_BAD_REQUEST)
    
class PhotoRetrieveView(APIView):
    def get(self, request, subfolder, photo_name):
        # Construct the path to the photo        
        photo_path = os.path.join(BASE_PATH, subfolder, photo_name)

        # Check if the photo exists
        if os.path.exists(photo_path):
            # Serve the photo
            return FileResponse(open(photo_path, 'rb'), content_type='image/jpeg')
        else:
            # Photo not found
            raise Http404("Photo not found")

class LimitsFileRetrieve(APIView):
    def get(self, request, subfolder):
        # Construct the path to the limits.json file
        #base_path = '/opt/apache/htdocs/field_trial_data/APItest/'
        subfolder_path = os.path.join(BASE_PATH, subfolder)

        # Check if the subfolder exists, if not create it
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)

        limits_file_path = os.path.join(BASE_PATH, subfolder, 'limits.json')

        # Check if the limits.json file exists
        if os.path.exists(limits_file_path):
            # Serve the limits.json file
            return FileResponse(open(limits_file_path, 'rb'), content_type='application/json')
        else:
            # File not found
            raise Http404("limits.json not found")
        
class LimitsFileUpdate(APIView):
    def post(self, request, subfolder):        
        subfolder_path = os.path.join(BASE_PATH, subfolder)

        # Ensure the subfolder exists, create it if not
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)

        limits_file_path = os.path.join(subfolder_path, 'limits.json')

        try:
            # Parse the incoming JSON data
            data = request.data.get('Plant height')
            min_value = data.get('min')
            max_value = data.get('max')

            # Initialize or update the limits.json file
            if not os.path.exists(limits_file_path):
                limits = {'Plant height': {'min': min_value, 'max': max_value}}
            else:
                with open(limits_file_path, 'r') as file:
                    limits = json.load(file)
                    limits['Plant height']['min'] = min_value
                    limits['Plant height']['max'] = max_value

            # Write the updated or new limits to the file
            with open(limits_file_path, 'w') as file:
                json.dump(limits, file, indent=4)

            return JsonResponse({'message': 'Limits updated successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
