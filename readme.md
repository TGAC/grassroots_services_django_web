# Introduction

This is frontend web application for the [Grassroots infrastructure](https://grassroots.tools) using the [Django framework](https://www.djangoproject.com/). This application is open source and available from [https://github.com/TGAC/grassroots_services_django_web](https://github.com/TGAC/grassroots_services_django_web).

# Installation

Django is a Python-based framework so requires various Python components to be installed. 
These can be installed using

```
sudo apt install python3 virtualenv python3-pip
```

The next stage is to set up the virtual environment to run the application in which is done with
the following commands:

```
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements.txt
```

Once this is done, then you need to set up the Django web application so that it has the correct paths for the Apache httpd server that is running Grassroots.
This is done by creating a custom settings file to store the configuration details

```
cd grassroots_services_django_web
cp example_custom_settings.py custom_settings.py
```

In this file are the variables that you need to set up

 * **STATIC_ROOT**: The filesystem path to where the static files that Django uses will be installed and should be synchronized with the relative web address specified by the *STATIC_URL* variable listed below.
 * **STATIC_URL**: This is the web address to access the static files that are installed to the *STATIC_ROOT* path defined above.
 
 So, for example if you have the Apache webserver's ```DocumentRoot``` variable set to ```/opt/apache/htdocs``` and you wish to have the Django static files served from */static*, then these configuration variables would be:
 
 ```
STATIC_ROOT = '/opt/apache/htdocs/static'
STATIC_URL = '/static/'
```

 * **SERVER_URL**: This defines the web address of the Grassroots server that this Django application will be using.


# Usage

To use this application, make sure that you are in the virtual environment by having run

```
source venv/bin/activate
```

After an initial install or after any changes to the static files, these need to be copied to the Apache webserver which can be done with:

```
python3 manage.py collectstatic
```


To run the application, the command is 

```
python3 manage.py runserver <PORT>
```

where *<PORT>* is the port that you wish to run the application on. For instance to run it on port 8000, the command would be:
	
```
python3 manage.py runserver 8000
```

So by browsing to *http://localhost:\<PORT\>*, or in the example above *http://localhost:8000*. you can access the application.
