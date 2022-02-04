from django import template

register = template.Library()

@register.simple_tag
def lookup_value(mapping, key):
   # Try to fetch from the dict, and if it's not found return an empty string.
   return mapping.get(key,'') 
 
