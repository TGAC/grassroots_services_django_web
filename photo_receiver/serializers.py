from rest_framework import serializers
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
import os

class PhotoSerializer(serializers.Serializer):
    image = serializers.ImageField(use_url=True)
    subfolder = serializers.CharField(max_length=100)

    def save(self):
        image = self.validated_data['image']
        subfolder = self.validated_data['subfolder']

        # Base path where images will be stored
        base_path = '/opt/apache/htdocs/field_trial_data/APItest/'

        # Construct the full path with subfolder
        full_path = os.path.join(base_path, subfolder)

        # Check if the subfolder exists, if not create it
        if not os.path.exists(full_path):
            os.makedirs(full_path)

        # Open the image using Pillow
        img = Image.open(image)

        # Calculate the thumbnail size (a quarter of the original size)
        original_size = img.size
        thumbnail_size = (original_size[0] // 4, original_size[1] // 4)
        img.thumbnail(thumbnail_size, Image.ANTIALIAS)

        # Save the thumbnail to a BytesIO object
        thumb_io = BytesIO()
        img.save(thumb_io, format='JPEG', quality=85)
        thumb_io.seek(0)  # Reset the file pointer to the beginning

        # Create a new Django file-like object for the thumbnail
        thumbnail = ContentFile(thumb_io.getvalue(), name='thumb_' + image.name)

        # Save the thumbnail
        thumb_path = os.path.join(full_path, thumbnail.name)
        with open(thumb_path, 'wb+') as thumb_file:
            thumb_file.write(thumbnail.read())

        # Reset the BytesIO object for the original image
        image.seek(0)

        # Save the original image
        original_path = os.path.join(full_path, image.name)
        with open(original_path, 'wb+') as original_file:
            for chunk in image.chunks():
                original_file.write(chunk)