from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PhotoSerializer
from django.http import HttpResponse, Http404
import os, json
from django.conf import settings
from django.http import FileResponse
from django.http import JsonResponse

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
        base_path = '/opt/apache/htdocs/field_trial_data/APItest/'
        photo_path = os.path.join(base_path, subfolder, photo_name)

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
        base_path = '/opt/apache/htdocs/field_trial_data/APItest/'
        subfolder_path = os.path.join(base_path, subfolder)

        # Check if the subfolder exists, if not create it
        if not os.path.exists(subfolder_path):
            os.makedirs(subfolder_path)

        limits_file_path = os.path.join(base_path, subfolder, 'limits.json')

        # Check if the limits.json file exists
        if os.path.exists(limits_file_path):
            # Serve the limits.json file
            return FileResponse(open(limits_file_path, 'rb'), content_type='application/json')
        else:
            # File not found
            raise Http404("limits.json not found")
        
class LimitsFileUpdate(APIView):
    def post(self, request, subfolder):
        base_path = '/opt/apache/htdocs/field_trial_data/APItest/'
        subfolder_path = os.path.join(base_path, subfolder)

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
