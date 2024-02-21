import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# The filesystem path to where the static files
# that Django uses will be installed
STATIC_ROOT = "/home/billy/Applications/apache/htdocs/static/"

# The web address to access the static files
STATIC_URL = 'http://localhost:2000/static/'

# The web address for the grassroots server to connect to
SERVER_URL = "http://localhost:2000/grassroots/public_backend"

# new location for source static files
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'grassroots_services_django_web/static') # general location to search for static files 
]