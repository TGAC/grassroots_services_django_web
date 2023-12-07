from rest_framework import serializers

class PhotoSerializer(serializers.Serializer):
    image = serializers.ImageField(use_url=True)

    def save(self):
        image = self.validated_data['image']
        # Save image to /apache/htdocs/test_data/test1/
        with open('/opt/apache/htdocs/field_trial_data/APItest/' + image.name, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)

