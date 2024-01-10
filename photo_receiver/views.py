from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PhotoSerializer
from django.http import HttpResponse, Http404
import os
from django.conf import settings
from django.http import FileResponse

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
        limits_file_path = os.path.join(base_path, subfolder, 'limits.json')

        # Check if the limits.json file exists
        if os.path.exists(limits_file_path):
            # Serve the limits.json file
            return FileResponse(open(limits_file_path, 'rb'), content_type='application/json')
        else:
            # File not found
            raise Http404("limits.json not found")